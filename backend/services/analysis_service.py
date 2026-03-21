"""services/analysis_service.py — Gap analysis engine"""
import json
import math
import re
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
_DATASET_DIR = BASE_DIR / "dataset"

with open(_DATASET_DIR / "job_roles.json", encoding="utf-8") as f:
    _ROLES = {r["id"]: r for r in json.load(f)["roles"]}

with open(_DATASET_DIR / "skills_ontology.json", encoding="utf-8") as f:
    _ONTOLOGY = json.load(f)["skills"]


def _priority(weight: float, mentions: int = 1) -> str:
    score = weight * 0.7 + min(mentions / 5, 1.0) * 0.3
    if score >= 0.75: return "critical"
    if score >= 0.50: return "important"
    return "nice-to-have"


def _weeks_label(hours: int, hpw: int = 10) -> str:
    if hours == 0: return "Experience-based"
    weeks = math.ceil(hours / max(hpw, 1))
    if weeks <= 1: return "~1 week"
    if weeks <= 4: return f"~{weeks} weeks"
    if weeks <= 12: return f"~{round(weeks/4.3,1)} months"
    return f"~{round(weeks/4.3)} months"


def run_analysis(
    resume_skills: list[dict],
    job_role_id: str,
    hours_per_week: int = 10,
) -> dict:
    role = _ROLES.get(job_role_id)
    if not role:
        raise ValueError(f"Unknown role: {job_role_id}")

    resume_skill_set = {s["skill"].lower() for s in resume_skills}

    matched, gaps, key_diff = [], [], []
    total_jd_weight = 0.0
    matched_weight = 0.0

    for req in role["required_skills"]:
        canonical = req["skill"]
        weight = req["weight"]
        total_jd_weight += weight
        info = _ONTOLOGY.get(canonical, {})

        if canonical in resume_skill_set:
            matched_weight += weight
            resume_entry = next((s for s in resume_skills if s["skill"] == canonical), {})
            confidence = resume_entry.get("confidence", 0.8)
            is_diff = weight >= 0.85 and confidence >= 0.85
            entry = {
                "skill": canonical,
                "display": info.get("display", canonical.title()),
                "category": info.get("category", "Other"),
                "jd_weight": weight,
                "confidence": confidence,
                "is_key_differentiator": is_diff,
                "level_required": req.get("level", "intermediate"),
            }
            matched.append(entry)
            if is_diff:
                key_diff.append(entry)
        else:
            prereqs = info.get("prereqs", [])
            entry = {
                "skill": canonical,
                "display": info.get("display", canonical.title()),
                "category": info.get("category", "Other"),
                "jd_weight": weight,
                "priority": _priority(weight),
                "learn_hours": info.get("learn_hours", 20),
                "learn_time": _weeks_label(info.get("learn_hours", 20), hours_per_week),
                "level_required": req.get("level", "intermediate"),
                "prereqs_have": [p for p in prereqs if p in resume_skill_set],
                "prereqs_missing": [p for p in prereqs if p not in resume_skill_set],
                "resources": info.get("resources", [])[:2],
            }
            gaps.append(entry)

    prio_order = {"critical": 0, "important": 1, "nice-to-have": 2}
    gaps.sort(key=lambda x: (prio_order[x["priority"]], -x["jd_weight"]))

    jd_skill_set = {r["skill"] for r in role["required_skills"]}
    bonus = [s for s in resume_skills if s["skill"] not in jd_skill_set]

    ats_score = round((matched_weight / total_jd_weight) * 100, 1) if total_jd_weight else 0
    conf_avg = sum(m["confidence"] for m in matched) / len(matched) if matched else 0
    match_score = round(min(100, ats_score * 0.65 + conf_avg * 20 + len(key_diff) * 2), 1)

    cat_match: dict[str, float] = {}
    cat_total: dict[str, float] = {}
    for m in matched:
        c = m["category"]
        cat_match[c] = cat_match.get(c, 0) + m["jd_weight"]
        cat_total[c] = cat_total.get(c, 0) + m["jd_weight"]
    for g in gaps:
        c = g["category"]
        cat_total[c] = cat_total.get(c, 0) + g["jd_weight"]
    radar = {c: round(min(100, cat_match.get(c, 0) / cat_total[c] * 100), 1) for c in cat_total}

    total_learn_hours = sum(g["learn_hours"] for g in gaps)

    strength_map = [(85,"Excellent"),(70,"Strong"),(50,"Good"),(30,"Fair"),(0,"Weak")]
    profile_strength = next(s for t, s in strength_map if match_score >= t)

    return {
        "role_title": role["title"],
        "role_id": job_role_id,
        "ats_score": ats_score,
        "match_score": match_score,
        "profile_strength": profile_strength,
        "matched_skills": matched,
        "skill_gaps": gaps,
        "key_differentiators": key_diff,
        "bonus_skills": bonus[:10],
        "radar_data": radar,
        "total_jd_skills": len(role["required_skills"]),
        "matched_count": len(matched),
        "gap_count": len(gaps),
        "bonus_skills_count": len(bonus),
        "total_learn_hours": total_learn_hours,
        "trending_skills": role.get("trending_skills", []),
    }


# ── ATS-grade Eligibility Scanner (Claude-powered) ───────────────────────────

import anthropic as _anthropic
import json as _json

def scan_eligibility(
    resume_skills: list[dict],
    eligibility_text: str,
    target_companies: str | None = None,
) -> dict:
    """
    Real ATS-grade scanner powered by Claude.
    Reads the full JD text, understands context, synonyms, experience levels,
    and returns a structured compatibility report.
    """

    # Build a readable skills summary for Claude
    skill_lines = "\n".join(
        f"- {s.get('display', s['skill'])} (confidence: {s.get('confidence', 0.8):.0%})"
        for s in resume_skills
    )

    company_line = f"Target company/companies: {target_companies}" if target_companies else ""

    prompt = f"""You are an expert ATS (Applicant Tracking System) scanner and career advisor.

Analyze the candidate's resume skills against the job description below and return a detailed compatibility report.

{company_line}

## Candidate's Resume Skills:
{skill_lines}

## Job Description / Eligibility Criteria:
{eligibility_text}

Analyze deeply:
1. Understand what the JD is actually asking for (not just keywords)
2. Match candidate skills semantically (e.g. "PyTorch" satisfies "deep learning framework")
3. Identify experience level requirements and check if candidate meets them
4. Find critical missing skills vs nice-to-have ones
5. Give actionable how-to-learn advice for each missing skill

Return ONLY a valid JSON object with this exact structure:
{{
  "compatibility_score": <integer 0-100>,
  "summary": "<one sentence summary of the match>",
  "matched_requirements": ["<skill/requirement>", ...],
  "missing_skills": [
    {{
      "name": "<skill name>",
      "priority": "<critical|important|nice-to-have>",
      "how_to_learn": "<specific, actionable 1-2 sentence learning path>"
    }},
    ...
  ],
  "verdict": "<2-3 sentence honest assessment with specific next steps>",
  "ats_tips": "<1-2 sentence tip on how to better tailor the resume for this specific JD>"
}}

Scoring guide:
- 85-100: Excellent fit, candidate has almost everything
- 70-84: Strong match, 1-2 gaps
- 50-69: Good potential, several gaps but strong foundation  
- 30-49: Partial match, significant upskilling needed
- 0-29: Major gaps, not ready for this role yet

Be honest and specific. Do not inflate the score."""

    client = _anthropic.Anthropic()
    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text.strip()

    # Strip markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    result = _json.loads(raw)

    # Ensure score is an int and clamped
    result["compatibility_score"] = max(0, min(100, int(result.get("compatibility_score", 50))))

    # Add companies to result for display on Results page
    if target_companies:
        result["companies"] = target_companies

    return result