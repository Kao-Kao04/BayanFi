# BayanFi Repository Structure

```
bayanfi/
├── apps/
│   ├── web/                        # Next.js 14 frontend (App Router)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (marketing)/    # Landing + public transparency
│   │   │   │   ├── (auth)/         # Login, register
│   │   │   │   └── (dashboard)/    # admin, beneficiary, merchant, auditor
│   │   │   ├── components/         # UI (Shadcn), layout, charts
│   │   │   ├── lib/                # API client, queries, utils
│   │   │   └── stores/             # Zustand stores
│   │   ├── tailwind.config.ts
│   │   └── Dockerfile
│   │
│   ├── backend/                    # NestJS API (modular monolith)
│   │   ├── src/
│   │   │   ├── common/             # Guards, filters, interceptors, decorators, utils
│   │   │   ├── config/             # Configuration + validation
│   │   │   ├── database/           # Prisma module + service
│   │   │   └── modules/            # auth, users, organizations, programs,
│   │   │       │                   #   applications, beneficiaries, wallets,
│   │   │       │                   #   transactions, merchants, stellar, ai,
│   │   │       │                   #   audit, disaster, transparency, notifications, health
│   │   ├── prisma/                 # schema.prisma + seed.ts
│   │   └── Dockerfile
│   │
│   └── ai-service/                 # Python FastAPI AI/ML service
│       ├── routers/                # duplicate, fraud, documents, eligibility, chat, anomaly, forecast
│       ├── services/               # llm abstraction (OpenAI/Ollama)
│       ├── main.py
│       ├── config.py
│       ├── requirements.txt
│       └── Dockerfile
│
├── packages/
│   ├── stellar/                    # Stellar SDK wrapper (client, keypair, multisig, payment-request)
│   ├── types/                      # Shared TypeScript types (enums, models, api)
│   ├── ui/                         # (reserved) shared UI library
│   └── shared/                     # (reserved) shared utilities
│
├── contracts/
│   └── program_escrow/             # Soroban escrow contract (Rust)
│       ├── src/lib.rs
│       ├── src/test.rs
│       └── Cargo.toml
│
├── docs/
│   ├── requirements/               # SRS, user stories, use cases
│   ├── architecture/               # DB schema, ER diagram, system architecture,
│   │                               #   sequence diagrams, flowcharts
│   ├── api/                        # API reference
│   └── guides/                     # Deployment, roadmap, folder structure
│
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   └── nginx/nginx.conf
│
├── scripts/
│   └── stellar-setup.js            # Generate + fund platform master account
│
├── .github/workflows/ci.yml        # CI: lint, typecheck, test, contracts, security scan
├── docker-compose.yml
├── turbo.json
├── package.json                    # npm workspaces root
└── README.md
```

## Conventions

- **Modules** are self-contained (controller + service + module + DTOs) and can be extracted into microservices later.
- **Shared code** lives in `packages/*` and is consumed via workspace aliases (`@bayanfi/stellar`, `@bayanfi/types`).
- **Secrets** are never committed; use `.env` (gitignored) and secret managers in production.
- **Migrations** are version-controlled and reversible.
