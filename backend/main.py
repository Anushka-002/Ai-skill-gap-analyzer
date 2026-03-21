"""main.py — FastAPI application entry point"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import motor.motor_asyncio

from config import get_settings

from routes import auth, resume, analysis, roadmap, insights

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect MongoDB
    app.state.mongo = motor.motor_asyncio.AsyncIOMotorClient(settings.mongodb_uri)
    app.state.db = app.state.mongo[settings.db_name]
    print(f"✅ Connected to MongoDB: {settings.db_name}")
    yield
    # Shutdown
    app.state.mongo.close()
    print("MongoDB connection closed")


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="AI-powered resume skill gap analyzer API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth.router,     prefix="/auth",     tags=["Authentication"])
app.include_router(resume.router,   prefix="/resume",   tags=["Resume"])
app.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
app.include_router(roadmap.router,  prefix="/roadmap",  tags=["Roadmap"])
app.include_router(insights.router, prefix="/insights", tags=["Market Insights"])


@app.get("/health")
async def health():
    return {"status": "ok", "version": settings.version}