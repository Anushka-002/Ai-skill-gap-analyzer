"""routes/roadmap.py + insights.py combined"""
from fastapi import APIRouter, Request, Depends, HTTPException
from pydantic import BaseModel
import json, os, sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../ml-model"))

from middleware.auth import verify_token

router = APIRouter()

DATASET_DIR = os.path.join(os.path.dirname(__file__), "../../../dataset")


class RoadmapRequest(BaseModel):
    gaps: list[str]
    role: str
    level: str = "beginner"  # beginner | intermediate | advanced
    hours_per_week: int = 10


@router.post("/generate")
async def generate_roadmap(body: RoadmapRequest, current: dict = Depends(verify_token)):
    from analyzers.roadmap_generator import generate
    roadmap = generate(body.gaps, body.role, body.level, body.hours_per_week)
    return roadmap