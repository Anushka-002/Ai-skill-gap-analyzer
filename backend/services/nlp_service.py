"""services/nlp_service.py — Resume parsing (PDF/DOCX/TXT → structured data)"""
import re
import json
import os
from pathlib import Path
from collections import defaultdict

# ── Load skills ontology ───────────────────────────────────────────────
_ONTOLOGY_PATH = Path(__file__).resolve().parent.parent.parent / "dataset" / "skills_ontology.json"
with open(_ONTOLOGY_PATH, encoding="utf-8") as f:
    _ONTOLOGY = json.load(f)["skills"]

# Build alias → canonical map
_ALIAS_MAP: dict[str, str] = {}
for canonical, data in _ONTOLOGY.items():
    _ALIAS_MAP[canonical.lower()] = canonical
    for alias in data.get("aliases", []):
        _ALIAS_MAP[alias.lower()] = canonical


def _build_ngrams(tokens: list[str], n: int) -> list[tuple[str, int]]:
    return [(" ".join(tokens[i:i+n]), i) for i in range(len(tokens) - n + 1)]


def _extract_text_pdf(content: bytes) -> str:
    try:
        import pypdf
        import io
        reader = pypdf.PdfReader(io.BytesIO(content))
        return "\n".join(
            page.extract_text() or "" for page in reader.pages
        )
    except Exception:
        return content.decode("utf-8", errors="ignore")


def _extract_text_docx(content: bytes) -> str:
    try:
        import io
        from docx import Document
        doc = Document(io.BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs)
    except Exception:
        return content.decode("utf-8", errors="ignore")


def _extract_skills_from_text(text: str) -> list[dict]:
    cleaned = re.sub(r"[^\w\s\-/+#.]", " ", text.lower())
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    tokens = cleaned.split()

    found: dict[str, dict] = {}

    negation = {"no", "not", "without", "lack", "never", "limited"}
    for n in range(4, 0, -1):
        for gram, idx in _build_ngrams(tokens, n):
            if gram not in _ALIAS_MAP:
                continue
            # Negation check
            preceding = tokens[max(0, idx-4):idx]
            if any(t in negation for t in preceding):
                continue
            canonical = _ALIAS_MAP[gram]
            if canonical not in found:
                info = _ONTOLOGY.get(canonical, {})
                found[canonical] = {
                    "skill": canonical,
                    "display": info.get("display", canonical.title()),
                    "category": info.get("category", "Other"),
                    "confidence": 1.0 if gram == canonical else 0.9,
                    "mentions": 1,
                }
            else:
                found[canonical]["mentions"] += 1

    # Boost confidence for multiple mentions
    for data in found.values():
        data["confidence"] = min(1.0, data["confidence"] + 0.02 * (data["mentions"] - 1))

    return sorted(found.values(), key=lambda x: -x["confidence"])


def _extract_education(text: str) -> list[dict]:
    edu = []
    degree_patterns = [
        r"(B\.?S\.?|B\.?E\.?|Bachelor[s]?|B\.Tech|B\.Sc)\s+(?:of\s+|in\s+)?([A-Za-z\s,]+?)(?:\n|,|from|at|—|-)",
        r"(M\.?S\.?|M\.?E\.?|Master[s]?|M\.Tech|M\.Sc|MBA)\s+(?:of\s+|in\s+)?([A-Za-z\s,]+?)(?:\n|,|from|at|—|-)",
        r"(Ph\.?D\.?|Doctor(?:ate)?)\s+(?:of\s+|in\s+)?([A-Za-z\s,]+?)(?:\n|,|from|at|—|-)",
    ]
    for pat in degree_patterns:
        for m in re.finditer(pat, text, re.IGNORECASE):
            edu.append({
                "degree": m.group(1).strip(),
                "field": m.group(2).strip()[:80],
            })
    return edu[:5]


def _extract_experience_years(text: str) -> list[dict]:
    exp = []
    patterns = [
        r"(\d{4})\s*[–\-—]\s*(Present|Current|\d{4})\s*\n?\s*(.{10,80})",
        r"(.{10,60})\s*\|\s*(\d{4})\s*[–\-—]\s*(Present|\d{4})",
    ]
    for pat in patterns:
        for m in re.finditer(pat, text, re.IGNORECASE):
            groups = m.groups()
            exp.append({"raw": " | ".join(str(g).strip() for g in groups if g)[:120]})
            if len(exp) >= 5:
                break
    return exp


def _extract_summary(text: str) -> str:
    lines = text.strip().split("\n")
    # First ~3 non-empty, non-header lines as summary
    summary_lines = []
    skip_words = {"skills", "education", "experience", "projects", "certifications", "summary"}
    for line in lines[:20]:
        stripped = line.strip()
        if len(stripped) > 30 and stripped.lower() not in skip_words:
            summary_lines.append(stripped)
        if len(summary_lines) >= 3:
            break
    return " ".join(summary_lines)[:400]


def parse_resume_file(content: bytes, filename: str) -> dict:
    """Main entry point: bytes → parsed resume dict."""
    ext = Path(filename).suffix.lower()
    if ext == ".pdf":
        raw_text = _extract_text_pdf(content)
    elif ext in (".docx", ".doc"):
        raw_text = _extract_text_docx(content)
    else:
        raw_text = content.decode("utf-8", errors="ignore")

    if not raw_text.strip():
        raw_text = "No text could be extracted from this file."

    return {
        "raw_text": raw_text[:10000],
        "skills": _extract_skills_from_text(raw_text),
        "education": _extract_education(raw_text),
        "experience": _extract_experience_years(raw_text),
        "summary": _extract_summary(raw_text),
        "word_count": len(raw_text.split()),
    }