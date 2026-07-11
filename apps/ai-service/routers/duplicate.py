"""Duplicate beneficiary detection.

Combines deterministic identity signals (name + DOB) using fuzzy string
matching. In production this also queries an embedding index of existing
beneficiaries; here we score against a provided candidate set or return a
low-risk baseline when none is supplied.
"""
from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel
from rapidfuzz import fuzz

from config import get_settings

router = APIRouter()


class Candidate(BaseModel):
    beneficiaryId: str
    firstName: str
    lastName: str
    dateOfBirth: str


class DuplicateCheckRequest(BaseModel):
    beneficiaryId: str
    firstName: str
    lastName: str
    dateOfBirth: str
    candidates: list[Candidate] = []


class DuplicateCheckResponse(BaseModel):
    score: float
    isDuplicate: bool
    flags: list[str]
    matches: list[dict]


@router.post("/duplicate-check", response_model=DuplicateCheckResponse)
async def duplicate_check(req: DuplicateCheckRequest) -> DuplicateCheckResponse:
    settings = get_settings()
    threshold = settings.duplicate_similarity_threshold * 100

    full_name = f"{req.firstName} {req.lastName}".lower().strip()
    matches: list[dict] = []
    best = 0.0

    for candidate in req.candidates:
        if candidate.beneficiaryId == req.beneficiaryId:
            continue
        cand_name = f"{candidate.firstName} {candidate.lastName}".lower().strip()
        name_sim = fuzz.token_sort_ratio(full_name, cand_name)
        dob_match = candidate.dateOfBirth[:10] == req.dateOfBirth[:10]
        # DOB match strongly reinforces a name match.
        combined = name_sim if not dob_match else min(100.0, name_sim + 15)
        if combined > best:
            best = combined
        if combined >= threshold:
            matches.append(
                {
                    "beneficiaryId": candidate.beneficiaryId,
                    "nameSimilarity": round(name_sim, 1),
                    "dobMatch": dob_match,
                    "score": round(combined, 1),
                }
            )

    is_duplicate = best >= threshold
    flags: list[str] = []
    if is_duplicate:
        flags.append(f"Potential duplicate detected (similarity {round(best, 1)}%)")

    return DuplicateCheckResponse(
        score=round(best, 1),
        isDuplicate=is_duplicate,
        flags=flags,
        matches=matches,
    )
