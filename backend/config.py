"""config.py — App settings loaded from .env"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "AI Skill Gap Analyzer API"
    version: str = "1.0.0"

    # Database
    mongodb_uri: str = "mongodb://localhost:27017"
    db_name: str = "skill_gap_analyzer"

    # Auth
    jwt_secret: str = "change-me-in-production-very-long-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24h

    # CORS
    cors_origins: list = ["http://localhost:5173", "http://localhost:3000", "*"]

    # OpenAI (optional – for AI chat)
    openai_api_key: str = ""

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()