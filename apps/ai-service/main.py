"""BayanFi AI Service.

A stateless FastAPI service providing fraud detection, duplicate detection,
document verification, spending anomaly detection, eligibility prediction, a
conversational assistant, and budget forecasting. Designed to run against
either OpenAI (cloud) or Ollama (local/private) inference backends.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from routers import (
    duplicate,
    fraud,
    documents,
    eligibility,
    chat,
    anomaly,
    forecast,
)

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="AI/ML services for the BayanFi public finance platform.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Feature routers.
app.include_router(duplicate.router, tags=["duplicate"])
app.include_router(fraud.router, tags=["fraud"])
app.include_router(documents.router, tags=["documents"])
app.include_router(eligibility.router, tags=["eligibility"])
app.include_router(chat.router, tags=["chat"])
app.include_router(anomaly.router, tags=["anomaly"])
app.include_router(forecast.router, tags=["forecast"])


@app.get("/health", tags=["health"])
async def health() -> dict:
    return {
        "status": "ok",
        "service": settings.app_name,
        "backend": "ollama" if settings.use_ollama or not settings.openai_api_key else "openai",
    }


@app.get("/", tags=["health"])
async def root() -> dict:
    return {"message": "BayanFi AI Service", "docs": "/docs"}
