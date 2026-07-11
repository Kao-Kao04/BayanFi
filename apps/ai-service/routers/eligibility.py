"""Eligibility prediction and explanation.

Evaluates a beneficiary profile against a program's structured eligibility
criteria and produces a transparent score plus a plain-language explanation.
"""
from __future__ import annotations

from datetime import date, datetime

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class BeneficiaryProfile(BaseModel):
    dateOfBirth: str | None = None
    monthlyIncome: float | None = None
    region: str | None = None


class EligibilityRequest(BaseModel):
    beneficiary: BeneficiaryProfile
    criteria: dict = {}


class EligibilityResponse(BaseModel):
    score: float
    eligible: bool
    met: list[str]
    unmet: list[str]
    flags: list[str]


def _age_from_dob(dob: str) -> int | None:
    try:
        birth = datetime.fromisoformat(dob[:10]).date()
        today = date.today()
        return today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))
    except Exception:
        return None


@router.post("/eligibility", response_model=EligibilityResponse)
async def eligibility(req: EligibilityRequest) -> EligibilityResponse:
    criteria = req.criteria or {}
    met: list[str] = []
    unmet: list[str] = []
    checks = 0

    # Age criterion.
    age_rule = criteria.get("age")
    if age_rule:
        checks += 1
        age = _age_from_dob(req.beneficiary.dateOfBirth or "")
        if age is not None and age >= age_rule.get("min", 0) and age <= age_rule.get("max", 200):
            met.append(f"Age {age} within range")
        else:
            unmet.append("Age outside the eligible range")

    # Income criterion.
    income_rule = criteria.get("income")
    if income_rule and "max" in income_rule:
        checks += 1
        income = req.beneficiary.monthlyIncome
        if income is not None and income <= income_rule["max"]:
            met.append("Income within the eligible ceiling")
        else:
            unmet.append("Income exceeds the eligible ceiling")

    # Location criterion.
    loc_rule = criteria.get("location")
    if loc_rule:
        checks += 1
        if req.beneficiary.region in loc_rule:
            met.append("Location is covered by the program")
        else:
            unmet.append("Location is not covered by the program")

    # If no criteria are defined, treat as open eligibility.
    if checks == 0:
        return EligibilityResponse(score=75.0, eligible=True, met=["No specific criteria"], unmet=[], flags=[])

    score = round((len(met) / checks) * 100, 1)
    eligible = len(unmet) == 0
    flags = [] if eligible else ["One or more eligibility criteria not met"]

    return EligibilityResponse(score=score, eligible=eligible, met=met, unmet=unmet, flags=flags)
