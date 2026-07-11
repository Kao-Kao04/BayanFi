"""Fraud risk scoring for applications.

Uses an interpretable rule-weighted model over behavioral and profile
signals. Every contributing factor is returned so decisions are explainable
and auditable, which is a hard requirement for public-money systems.
"""
from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from config import get_settings

router = APIRouter()


class FraudCheckRequest(BaseModel):
    applicationId: str
    monthlyIncome: float = 0
    region: str = ""
    # Optional behavioral signals supplied by the backend.
    applicationsLast30Days: int = 0
    accountAgeDays: int = 365
    documentCount: int = 0


class FraudCheckResponse(BaseModel):
    score: float
    isFraud: bool
    flags: list[str]
    factors: dict


@router.post("/fraud-check", response_model=FraudCheckResponse)
async def fraud_check(req: FraudCheckRequest) -> FraudCheckResponse:
    settings = get_settings()
    factors: dict[str, float] = {}
    flags: list[str] = []

    # High application velocity is a classic fraud signal.
    if req.applicationsLast30Days >= 5:
        factors["velocity"] = 35
        flags.append("High application velocity in the last 30 days")
    elif req.applicationsLast30Days >= 3:
        factors["velocity"] = 20

    # Very new accounts carry more risk.
    if req.accountAgeDays < 3:
        factors["account_age"] = 25
        flags.append("Account created very recently")
    elif req.accountAgeDays < 14:
        factors["account_age"] = 12

    # Missing supporting documents raises risk.
    if req.documentCount == 0:
        factors["documents"] = 20
        flags.append("No supporting documents provided")

    # Implausible income data.
    if req.monthlyIncome < 0:
        factors["income_anomaly"] = 30
        flags.append("Invalid income value")

    score = min(100.0, sum(factors.values()))
    is_fraud = score >= settings.fraud_high_risk_threshold

    return FraudCheckResponse(
        score=round(score, 1),
        isFraud=is_fraud,
        flags=flags,
        factors=factors,
    )
