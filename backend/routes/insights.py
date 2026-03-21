from fastapi import APIRouter, HTTPException
import json, os

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "..", "dataset")

@router.get("/market")
async def market_insights(role: str = "ml-engineer"):
    with open(os.path.join(DATASET_DIR, "job_roles.json"), encoding="utf-8") as f:
        data = json.load(f)

    role_data = next((r for r in data["roles"] if r["id"] == role), None)
    if not role_data:
        raise HTTPException(404, f"Role '{role}' not found")

    return {
        "role": role_data["title"],
        "salary": role_data["salary"],
        "demand_score": role_data["demand_score"],
        "growth_rate": role_data["growth_rate"],
        "trending_skills": role_data["trending_skills"],
        "top_companies": role_data["top_companies"],
        "certifications": role_data["certifications"],
        "fresher_salary": role_data.get("fresher_salary", ""),
        "mid_salary": role_data.get("mid_salary", ""),
        "senior_salary": role_data.get("senior_salary", ""),
        "best_hiring_season": role_data.get("best_hiring_season", []),
        "internship": role_data.get("internship", {}),
    }

@router.get("/roles")
async def list_roles():
    with open(os.path.join(DATASET_DIR, "job_roles.json"), encoding="utf-8") as f:
        data = json.load(f)
    return [
        {"id": r["id"], "title": r["title"], 
         "category": r["category"], "demand_score": r["demand_score"]}
        for r in data["roles"]
    ]