"""routes/resume.py — Upload, parse, retrieve resume"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Request, Depends
from bson import ObjectId
from datetime import datetime
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../ml-model"))

from middleware.auth import verify_token
from services.nlp_service import parse_resume_file

router = APIRouter()


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    request: Request = None,
    current: dict = Depends(verify_token),
):
    if file.content_type not in (
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
    ):
        raise HTTPException(400, "Only PDF, DOCX, or TXT files supported")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:  # 5 MB limit
        raise HTTPException(400, "File too large (max 5 MB)")

    # Parse resume
    parsed = parse_resume_file(content, file.filename or "resume.pdf")

    # Save to DB
    db = request.app.state.db
    doc = {
        "user_id": current["user_id"],
        "filename": file.filename,
        "raw_text": parsed["raw_text"],
        "skills": parsed["skills"],
        "education": parsed["education"],
        "experience": parsed["experience"],
        "summary": parsed["summary"],
        "word_count": parsed["word_count"],
        "uploaded_at": datetime.utcnow(),
    }
    result = await db.resumes.insert_one(doc)

    return {
        "resume_id": str(result.inserted_id),
        "parsed": {
            "skills": parsed["skills"],
            "education": parsed["education"],
            "experience": parsed["experience"],
            "summary": parsed["summary"],
            "word_count": parsed["word_count"],
        },
    }


@router.get("/{resume_id}")
async def get_resume(
    resume_id: str,
    request: Request,
    current: dict = Depends(verify_token),
):
    db = request.app.state.db
    doc = await db.resumes.find_one(
        {"_id": ObjectId(resume_id), "user_id": current["user_id"]}
    )
    if not doc:
        raise HTTPException(404, "Resume not found")
    doc["id"] = str(doc.pop("_id"))
    return doc


@router.get("/")
async def list_resumes(request: Request, current: dict = Depends(verify_token)):
    db = request.app.state.db
    cursor = db.resumes.find({"user_id": current["user_id"]}).sort("uploaded_at", -1).limit(10)
    docs = []
    async for doc in cursor:
        docs.append({
            "id": str(doc["_id"]),
            "filename": doc["filename"],
            "skill_count": len(doc.get("skills", [])),
            "uploaded_at": doc["uploaded_at"].isoformat(),
        })
    return docs