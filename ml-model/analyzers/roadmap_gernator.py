"""analyzers/roadmap_generator.py — Personalized learning roadmap"""
import json
import math
from pathlib import Path

_ONTOLOGY_PATH = Path(__file__).parent.parent.parent / "dataset" / "skills_ontology.json"
with open(_ONTOLOGY_PATH) as f:
    _ONTOLOGY = json.load(f)["skills"]


def _weeks(hours: int, hpw: int) -> str:
    if hours == 0: return "Ongoing"
    w = math.ceil(hours / max(hpw, 1))
    if w <= 1: return "1 week"
    if w <= 4: return f"{w} weeks"
    if w <= 12: return f"{round(w/4.3,1)} months"
    return f"{round(w/4.3)} months"


def generate(
    gaps: list[str],
    role: str,
    level: str = "beginner",
    hours_per_week: int = 10,
) -> dict:
    """
    Returns a phased roadmap dict:
    {
      phases: [
        { phase: 1, title: "...", skills: [...], total_hours: N, duration: "..." }
      ],
      total_hours: N,
      total_duration: "...",
      career_path: ["..."],
      projects: [...],
      certifications: [...]
    }
    """
    # Sort gaps by priority (skills with fewer prereqs first)
    def prereq_score(skill: str) -> int:
        info = _ONTOLOGY.get(skill, {})
        return len(info.get("prereqs", []))

    sorted_gaps = sorted(gaps, key=prereq_score)

    # Build phases
    phase_1, phase_2, phase_3 = [], [], []
    for skill in sorted_gaps:
        info = _ONTOLOGY.get(skill, {})
        prereqs = info.get("prereqs", [])
        hours = info.get("learn_hours", 20)
        entry = {
            "skill": skill,
            "display": info.get("display", skill.title()),
            "category": info.get("category", "Other"),
            "hours": hours,
            "resources": info.get("resources", [])[:2],
            "prereqs": prereqs,
        }
        if len(prereqs) == 0 or hours <= 20:
            phase_1.append(entry)
        elif len(prereqs) <= 2:
            phase_2.append(entry)
        else:
            phase_3.append(entry)

    # Career path prediction
    career_path_map = {
        "ml-engineer":          ["Junior ML Engineer → ML Engineer → Senior ML Engineer → ML Tech Lead → Head of AI"],
        "llm-engineer":         ["AI Engineer → LLM Engineer → Senior GenAI Engineer → AI Architect → VP AI"],
        "data-scientist":       ["Data Analyst → Junior DS → Data Scientist → Senior DS → Principal DS → Chief Data Officer"],
        "data-engineer":        ["Data Analyst → Junior DE → Data Engineer → Senior DE → Data Architect → VP Data"],
        "nlp-engineer":         ["ML Engineer → NLP Engineer → Senior NLP Engineer → NLP Researcher → Research Scientist"],
        "mlops-engineer":       ["DevOps Engineer → MLOps Engineer → Senior MLOps → ML Platform Lead → Head of ML Platform"],
    }

    career_steps_raw = career_path_map.get(role, ["Junior Engineer → Engineer → Senior Engineer → Lead → Principal"])
    career_steps = career_steps_raw[0].split(" → ")

    # Recommended projects
    project_map = {
        "pytorch":           {"title": "Image Classifier with PyTorch", "difficulty": "beginner", "hours": 8},
        "large language models": {"title": "RAG Chatbot with LangChain + FAISS", "difficulty": "intermediate", "hours": 12},
        "fine-tuning":       {"title": "Fine-tune LLaMA-2 on custom dataset (LoRA)", "difficulty": "advanced", "hours": 20},
        "kubernetes":        {"title": "Deploy ML model on Kubernetes cluster", "difficulty": "advanced", "hours": 15},
        "mlops":             {"title": "Build an end-to-end MLOps pipeline with MLflow + Airflow", "difficulty": "intermediate", "hours": 20},
        "computer vision":   {"title": "Real-time object detection with YOLO", "difficulty": "intermediate", "hours": 10},
        "transformers":      {"title": "Build a Transformer from scratch", "difficulty": "advanced", "hours": 16},
        "vector databases":  {"title": "Semantic search engine with Chroma/FAISS", "difficulty": "beginner", "hours": 6},
        "apache spark":      {"title": "Big data processing pipeline with PySpark", "difficulty": "intermediate", "hours": 12},
    }
    projects = [project_map[g] for g in gaps if g in project_map][:5]

    # Certifications
    cert_map = {
        "aws":           "AWS Certified ML Specialty",
        "gcp":           "Google Professional ML Engineer",
        "azure":         "Azure AI Engineer Associate",
        "mlops":         "MLOps Zoomcamp Certificate",
        "machine learning": "DeepLearning.AI ML Specialization",
        "deep learning": "DeepLearning.AI Deep Learning Specialization",
        "large language models": "DeepLearning.AI LLM Specialization",
    }
    certs = list({cert_map[g] for g in gaps if g in cert_map})[:4]

    def phase_total(p): return sum(e["hours"] for e in p)

    phases = []
    if phase_1:
        h = phase_total(phase_1)
        phases.append({"phase": 1, "title": "Foundation", "skills": phase_1,
                       "total_hours": h, "duration": _weeks(h, hours_per_week)})
    if phase_2:
        h = phase_total(phase_2)
        phases.append({"phase": 2, "title": "Core Skills", "skills": phase_2,
                       "total_hours": h, "duration": _weeks(h, hours_per_week)})
    if phase_3:
        h = phase_total(phase_3)
        phases.append({"phase": 3, "title": "Advanced Mastery", "skills": phase_3,
                       "total_hours": h, "duration": _weeks(h, hours_per_week)})

    total_hours = sum(p["total_hours"] for p in phases)

    return {
        "phases": phases,
        "total_hours": total_hours,
        "total_duration": _weeks(total_hours, hours_per_week),
        "career_path": career_steps,
        "projects": projects,
        "certifications": certs,
    }