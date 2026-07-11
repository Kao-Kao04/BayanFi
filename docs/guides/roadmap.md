# BayanFi Development Roadmap & Sprint Plan

## Vision

Become the operating system for public money across Southeast Asia, serving
millions of beneficiaries with transparent, fraud-resistant, instant aid.

## Phased Roadmap

### Phase 1 — MVP (Hackathon) ✅
- Auth + RBAC (6 roles), JWT rotation, wallet login
- Organization & program management
- Application lifecycle with AI risk checks
- Stellar disbursement + merchant QR payments
- Public transparency dashboard
- Disaster emergency release
- Soroban escrow contract
- AI service (fraud, duplicate, document, eligibility, chat, forecast)

### Phase 2 — Enhanced AI & Trust (Q3 2026)
- Vision-based document forgery detection (fine-tuned model)
- Embedding-based duplicate detection at scale (vector DB)
- Multi-language assistant (Filipino, Tagalog, Cebuano)
- SEP-24/31 anchor integration for fiat on/off-ramp
- Multi-signature approval UI for high-value disbursements

### Phase 3 — Scale (Q4 2026)
- Native mobile apps (iOS/Android) with offline wallet
- Advanced Soroban contracts (conditional escrow, streaming aid)
- Read replicas, table partitioning, horizontal autoscaling
- Public API + webhooks for partner integrations

### Phase 4 — Ecosystem (2027)
- Stellar anchor partnerships across APAC
- Government & LGU onboarding program
- Grant marketplace and cross-org program syndication
- Regional expansion beyond the Philippines

## Sprint Plan (MVP, 2-week sprints)

### Sprint 0 — Foundations
- Monorepo, CI/CD, Docker, DB schema, SRS, architecture docs

### Sprint 1 — Identity & Wallets
- Auth module (register/login/refresh/MFA/wallet login)
- RBAC guards, audit logging
- Stellar package + wallet provisioning

### Sprint 2 — Programs & Applications
- Organizations, programs, beneficiaries modules
- Application lifecycle + atomic budget reservation

### Sprint 3 — Money Movement
- Transactions module (disbursement + merchant payments)
- Spending restriction enforcement
- Merchant registration + QR

### Sprint 4 — Intelligence
- AI service (all routers)
- Backend AI proxy + graceful degradation
- Explainable risk scoring integrated into approvals

### Sprint 5 — Transparency & Oversight
- Public transparency dashboard + charts
- Auditor dashboard (search, flag, anomalies)
- Disaster mode

### Sprint 6 — Polish & Harden
- Frontend dashboards for all roles
- Security review (OWASP), rate limiting, encryption audit
- Soroban escrow deploy + integration
- E2E tests, load tests, demo data

## Success Metrics

| Metric | Target (MVP) | Target (Scale) |
|--------|--------------|----------------|
| Disbursement finality | < 7s | < 5s |
| Cost per transaction | < $0.01 | < $0.001 |
| Fraud detection precision | > 80% | > 95% |
| Uptime | 99.5% | 99.9% |
| Beneficiaries served | 1,000 (demo) | 1,000,000+ |
| Concurrent users | 1,000 | 100,000 |

## Risk Register

| Risk | Mitigation |
|------|-----------|
| Stellar network congestion | Queue + retry with backoff; monitor Horizon |
| AI false positives blocking aid | Human-in-the-loop review; never auto-reject |
| Key compromise | KMS/HSM, envelope encryption, multi-sig treasury |
| Regulatory changes | Configurable KYC/AML; audit retention |
| Data privacy | Field-level encryption, PII masking, Ollama option |
