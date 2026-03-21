"""routes/analysis.py — Run and retrieve skill gap analyses"""
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime
from typing import Optional
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../ml-model"))

from middleware.auth import verify_token
from services.analysis_service import run_analysis, scan_eligibility

router = APIRouter()

XP_PER_ANALYSIS = 50


class AnalysisRequest(BaseModel):
    resume_id: str
    job_role_id: str          # e.g. "ml-engineer"
    hours_per_week: int = 10


class EligibilityScanRequest(BaseModel):
    resume_skills: list[dict]          # array of {skill, display, confidence, ...}
    eligibility_text: str              # raw pasted JD / criteria text
    target_companies: Optional[str] = None   # optional comma-separated company names


@router.post("/run")
async def run_gap_analysis(
    body: AnalysisRequest,
    request: Request,
    current: dict = Depends(verify_token),
):
    db = request.app.state.db

    # Fetch resume
    resume = await db.resumes.find_one(
        {"_id": ObjectId(body.resume_id), "user_id": current["user_id"]}
    )
    if not resume:
        raise HTTPException(404, "Resume not found")

    # Run ML analysis
    result = run_analysis(
        resume_skills=resume["skills"],
        job_role_id=body.job_role_id,
        hours_per_week=body.hours_per_week,
    )

    # Persist
    doc = {
        "user_id": current["user_id"],
        "resume_id": body.resume_id,
        "job_role_id": body.job_role_id,
        **result,
        "created_at": datetime.utcnow(),
    }
    ins = await db.analyses.insert_one(doc)

    # Award XP to user (gamification)
    await db.users.update_one(
        {"_id": ObjectId(current["user_id"])},
        {"$inc": {"xp": XP_PER_ANALYSIS}},
    )

    result["analysis_id"] = str(ins.inserted_id)
    return result


@router.post("/eligibility-scan")
async def eligibility_scan(
    body: EligibilityScanRequest,
    current: dict = Depends(verify_token),
):
    """
    Scans free-text eligibility / JD criteria against the user's resume skills.
    Returns a compatibility score, matched requirements, missing skills, and a verdict.
    Does NOT require a saved resume_id — works directly with the parsed skills from the frontend.
    """
    if not body.eligibility_text.strip():
        raise HTTPException(400, "eligibility_text must not be empty")

    if len(body.eligibility_text) > 10_000:
        raise HTTPException(400, "eligibility_text too long (max 10,000 chars)")

    try:
        result = scan_eligibility(
            resume_skills=body.resume_skills,
            eligibility_text=body.eligibility_text,
            target_companies=body.target_companies,
        )
    except Exception as e:
        raise HTTPException(500, f"ATS scan failed: {str(e)}")
    return result


@router.get("/history")
async def get_history(request: Request, current: dict = Depends(verify_token)):
    db = request.app.state.db
    cursor = db.analyses.find({"user_id": current["user_id"]}).sort("created_at", -1).limit(20)
    docs = []
    async for doc in cursor:
        docs.append({
            "id": str(doc["_id"]),
            "job_role_id": doc.get("job_role_id"),
            "ats_score": doc.get("ats_score"),
            "match_score": doc.get("match_score"),
            "profile_strength": doc.get("profile_strength"),
            "gap_count": doc.get("gap_count"),
            "created_at": doc["created_at"].isoformat(),
        })
    return docs


@router.get("/{analysis_id}")
async def get_analysis(
    analysis_id: str,
    request: Request,
    current: dict = Depends(verify_token),
):
    db = request.app.state.db
    doc = await db.analyses.find_one(
        {"_id": ObjectId(analysis_id), "user_id": current["user_id"]}
    )
    if not doc:
        raise HTTPException(404, "Analysis not found")
    doc["id"] = str(doc.pop("_id"))
    doc.pop("_id", None)
    return doc