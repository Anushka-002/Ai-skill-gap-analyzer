"""routes/auth.py — Signup / Login / Me"""
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from bson import ObjectId

from config import get_settings
from middleware.auth import verify_token

settings = get_settings()
router = APIRouter()
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Schemas ──────────────────────────────────────────────────────────
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Helpers ───────────────────────────────────────────────────────────
def make_token(user_id: str, email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode(
        {"sub": user_id, "email": email, "exp": expire},
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )


def _serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "xp": user.get("xp", 0),
        "level": user.get("level", 1),
        "created_at": user.get("created_at", "").isoformat() if user.get("created_at") else "",
    }


# ── Routes ────────────────────────────────────────────────────────────
@router.post("/signup")
async def signup(body: SignupRequest, request: Request):
    db = request.app.state.db
    if await db.users.find_one({"email": body.email}):
        raise HTTPException(400, "Email already registered")

    user = {
        "name": body.name,
        "email": body.email,
        "password_hash": pwd_ctx.hash(body.password),
        "xp": 0,
        "level": 1,
        "badges": [],
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(user)
    user["_id"] = result.inserted_id
    token = make_token(str(result.inserted_id), body.email)
    return {"user": _serialize_user(user), "token": token}


@router.post("/login")
async def login(body: LoginRequest, request: Request):
    db = request.app.state.db
    user = await db.users.find_one({"email": body.email})
    if not user or not pwd_ctx.verify(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")

    token = make_token(str(user["_id"]), body.email)
    return {"user": _serialize_user(user), "token": token}


@router.get("/me")
async def me(request: Request, current: dict = Depends(verify_token)):
    db = request.app.state.db
    user = await db.users.find_one({"_id": ObjectId(current["user_id"])})
    if not user:
        raise HTTPException(404, "User not found")
    return {"user": _serialize_user(user)}