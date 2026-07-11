"""Budget forecasting.

Projects future fund requirements from historical disbursement series using a
simple trend + moving-average model. This keeps the service dependency-light
while giving program admins a defensible forward estimate. A Prophet-based
model can be swapped in for seasonality-aware forecasts.
"""
from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class HistoryPoint(BaseModel):
    date: str
    amount: float


class ForecastRequest(BaseModel):
    programId: str
    history: list[HistoryPoint] = []
    horizonDays: int = 30


class ForecastResponse(BaseModel):
    programId: str
    projectedTotal: float
    dailyAverage: float
    trend: str
    forecast: list[dict]


@router.post("/forecast", response_model=ForecastResponse)
async def forecast(req: ForecastRequest) -> ForecastResponse:
    history = req.history
    if not history:
        return ForecastResponse(
            programId=req.programId,
            projectedTotal=0.0,
            dailyAverage=0.0,
            trend="insufficient_data",
            forecast=[],
        )

    amounts = [h.amount for h in history]
    daily_avg = sum(amounts) / len(amounts)

    # Determine trend from the slope between first and second halves.
    half = max(1, len(amounts) // 2)
    first_avg = sum(amounts[:half]) / half
    second_avg = sum(amounts[half:]) / max(1, len(amounts) - half)
    if second_avg > first_avg * 1.1:
        trend = "increasing"
        growth = 1.05
    elif second_avg < first_avg * 0.9:
        trend = "decreasing"
        growth = 0.95
    else:
        trend = "stable"
        growth = 1.0

    projected = []
    running = daily_avg
    total = 0.0
    for day in range(1, req.horizonDays + 1):
        running *= growth
        total += running
        projected.append({"day": day, "projectedAmount": round(running, 2)})

    return ForecastResponse(
        programId=req.programId,
        projectedTotal=round(total, 2),
        dailyAverage=round(daily_avg, 2),
        trend=trend,
        forecast=projected,
    )
