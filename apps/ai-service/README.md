# BayanFi AI Service

Python FastAPI service providing the platform's AI/ML capabilities.

## Features

| Endpoint | Purpose |
|----------|---------|
| `POST /duplicate-check` | Detect duplicate/ghost beneficiaries (fuzzy name + DOB) |
| `POST /fraud-check` | Interpretable fraud risk scoring with factor breakdown |
| `POST /verify-document` | Document authenticity checks (routes low scores to review) |
| `POST /eligibility` | Eligibility prediction against program criteria |
| `POST /anomaly-check` | Spending anomaly detection (statistical + Isolation Forest) |
| `POST /chat` | Beneficiary assistant (OpenAI or Ollama) |
| `POST /forecast` | Budget forecasting from disbursement history |
| `GET /health` | Health check |

## Design Principles

- **Explainable**: every fraud/eligibility decision returns contributing factors.
- **Human-in-the-loop**: the service never auto-rejects; low scores route to staff.
- **Privacy-first**: switch `use_ollama=true` to keep all inference on-premise.
- **Graceful degradation**: the backend proxy tolerates this service being down.

## Local Development

```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Interactive docs at http://localhost:8000/docs

## Configuration

Set via environment variables (see root `.env.example`):

- `OPENAI_API_KEY` — enables OpenAI backend
- `USE_OLLAMA=true` + `OLLAMA_BASE_URL` — use a local model instead
- `DUPLICATE_SIMILARITY_THRESHOLD` — default 0.90
- `FRAUD_HIGH_RISK_THRESHOLD` — default 70.0
