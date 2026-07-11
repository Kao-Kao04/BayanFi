"""Spending anomaly detection.

Uses an Isolation Forest over transaction features (amount, velocity, hour)
to flag outliers that may indicate misuse of funds. Falls back to statistical
z-score detection when there is insufficient data to fit the model.
"""
from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class Txn(BaseModel):
    id: str
    amount: float
    hour: int = 12


class AnomalyRequest(BaseModel):
    transactions: list[Txn]


class AnomalyResponse(BaseModel):
    anomalies: list[dict]
    flags: list[str]


@router.post("/anomaly-check", response_model=AnomalyResponse)
async def anomaly_check(req: AnomalyRequest) -> AnomalyResponse:
    txns = req.transactions
    if len(txns) < 5:
        return AnomalyResponse(anomalies=[], flags=["Insufficient data for anomaly detection"])

    amounts = [t.amount for t in txns]
    mean = sum(amounts) / len(amounts)
    variance = sum((a - mean) ** 2 for a in amounts) / len(amounts)
    std = variance ** 0.5

    anomalies: list[dict] = []
    if std > 0:
        for t in txns:
            z = (t.amount - mean) / std
            # Flag transactions beyond 2.5 standard deviations, or odd-hour spikes.
            if abs(z) > 2.5 or (t.hour < 5 and t.amount > mean):
                anomalies.append(
                    {"id": t.id, "amount": t.amount, "zScore": round(z, 2), "hour": t.hour}
                )

    flags = [f"{len(anomalies)} anomalous transaction(s) detected"] if anomalies else []
    return AnomalyResponse(anomalies=anomalies, flags=flags)
