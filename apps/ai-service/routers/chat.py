"""Conversational assistant for beneficiaries.

Answers questions about eligibility, missing requirements, disbursement
timing, and fund usage. Uses the LLM abstraction with a constrained system
prompt and returns suggested next actions the frontend can render as buttons.
"""
from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from services.llm import LLMService

router = APIRouter()
llm = LLMService()

SYSTEM_PROMPT = (
    "You are BayanFi Assistant, a helpful guide for people receiving public "
    "financial assistance in the Philippines. Be concise, warm, and factual. "
    "You help with: eligibility, missing requirements, application status, "
    "when aid arrives, and how funds can be spent. Never ask for passwords or "
    "secret keys. If unsure, advise contacting the program administrator."
)


class ChatRequest(BaseModel):
    userId: str
    message: str
    context: dict = {}


class ChatResponse(BaseModel):
    reply: str
    confidence: float
    suggestedActions: list[dict]


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    context_str = ""
    if req.context:
        context_str = "\n\nContext: " + ", ".join(f"{k}={v}" for k, v in req.context.items())

    reply = await llm.complete(SYSTEM_PROMPT, req.message + context_str, temperature=0.3)

    # Derive lightweight suggested actions from intent keywords.
    suggested: list[dict] = []
    lowered = req.message.lower()
    if "requirement" in lowered or "document" in lowered:
        suggested.append({"type": "VIEW_REQUIREMENTS"})
    if "status" in lowered or "arrive" in lowered or "when" in lowered:
        suggested.append({"type": "VIEW_APPLICATION_STATUS"})
    if "eligible" in lowered or "qualify" in lowered:
        suggested.append({"type": "CHECK_ELIGIBILITY"})

    return ChatResponse(reply=reply, confidence=0.85, suggestedActions=suggested)
