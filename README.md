<div align="center">

# BayanFi

### Transparent Public Money. Powered by Stellar.

AI-powered public finance platform for distributing government and NGO financial assistance instantly and transparently on the Stellar blockchain.

[![Stellar](https://img.shields.io/badge/Stellar-Testnet-7D00FF)](https://stellar.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E)](https://nestjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

_Stellar APAC Hackathon submission._

</div>

---

## The Problem

Public aid is slow, opaque, and leaky. Cash and paper forms enable ghost beneficiaries, duplicate claims, and fraud, and citizens have no way to verify where funds go. Distribution overhead runs 7–15%.

## The Solution

BayanFi turns public money into programmable, transparent money on Stellar:

- **Instant disbursement** — aid arrives in 3–5 seconds for a fraction of a cent.
- **Zero-cost onboarding** — beneficiaries get a Stellar wallet with **0 XLM** via sponsored reserves.
- **Publicly verifiable** — the transparency dashboard reads live ledger state; every figure links to the explorer.
- **AI fraud prevention** — duplicate/ghost detection, fraud scoring, document checks, anomaly detection.
- **QR payments** — beneficiaries spend aid at verified merchants, settled on-chain.

## Why Stellar Is Essential

Implemented and verifiable — not slideware:

| Capability | Why it needs Stellar |
|-----------|----------------------|
| **Sponsored Reserves (CAP-33)** | Beneficiaries onboard with **0 XLM** — the platform sponsors all reserves. Verified on testnet. |
| **On-chain transparency** | The dashboard reads live ledger state via Horizon; anyone can cross-check and follow transactions to the explorer. |
| **Claimable Balances** | Disaster relief can reach people who don't have a wallet yet. |
| **Instant settlement** | 3–5s finality, sub-cent fees — viable for micro-disbursements at scale. |
| **Soroban escrow** | Program budget caps enforced on-chain, not just in app code. |

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, TailwindCSS, Zustand, TanStack Query
- **Backend:** NestJS, Prisma, PostgreSQL (Supabase), JWT + RBAC (6 roles)
- **Blockchain:** Stellar SDK, Soroban (Rust)
- **AI:** Python FastAPI, OpenAI / Ollama, scikit-learn, rapidfuzz
- **DevOps:** Docker, GitHub Actions, Nginx

## Project Structure

```
apps/
  web/          Next.js frontend
  backend/      NestJS API
  ai-service/   Python AI/ML service
packages/
  stellar/      Stellar SDK wrapper (sponsored reserves, claimable balances, QR)
  types/        Shared TypeScript types
contracts/
  program_escrow/   Soroban smart contract (Rust)
docs/           SRS, architecture, API reference, diagrams
```

## Quick Start

```bash
npm install
cp .env.example .env          # add a Supabase DATABASE_URL (Session pooler, port 5432)
npm run stellar:setup         # generates + funds a Stellar testnet master account
npm run db:push               # sync schema to the database
npm run db:seed               # load demo data
npm run dev                   # web :3000 · api :4000 · ai :8000
```

- Web: http://localhost:3000
- API + Swagger: http://localhost:4000/api/docs
- AI docs: http://localhost:8000/docs

### Demo Accounts

All use password **`BayanFi@2026`**:

| Email | Role |
|-------|------|
| `admin@bayanfi.io` | Super Admin |
| `dswd.admin@bayanfi.io` | Organization Admin |
| `auditor@bayanfi.io` | Auditor |
| `juan@bayanfi.io` | Beneficiary |
| `store@bayanfi.io` | Merchant |

## Smart Contract & On-Chain Addresses (Stellar Testnet)

All addresses are live and verifiable on [stellar.expert](https://stellar.expert/explorer/testnet).

| Component | Address |
|-----------|---------|
| **Platform master / sponsor account** | [`GDI7ZF3BS25FXS4IO2AEJVJJ6RAA72MHEMV53RDIJ4JUXYXQ7HOJHRWX`](https://stellar.expert/explorer/testnet/account/GDI7ZF3BS25FXS4IO2AEJVJJ6RAA72MHEMV53RDIJ4JUXYXQ7HOJHRWX) |
| **Program funding account (DSWD)** | [`GADRQH46TDRW46ZQ2DU2EZFKKUHU3X37GKXBTVWFWAJ6ITJ4UMDEKVJX`](https://stellar.expert/explorer/testnet/account/GADRQH46TDRW46ZQ2DU2EZFKKUHU3X37GKXBTVWFWAJ6ITJ4UMDEKVJX) |
| **Soroban escrow contract** | See [`contracts/program_escrow`](./contracts/program_escrow) — deploy to obtain the contract ID (`C...`). |

Open the master account on the explorer to verify the sponsored sub-entries: beneficiary wallets are created with 0 XLM, reserves fully sponsored by the platform.

## Roadmap

- **Now (MVP):** auth + RBAC, programs, applications with AI checks, sponsored-reserve wallets, QR payments, on-chain transparency, disaster mode.
- **Next:** PHP anchor cash-out (SEP-24/31), PhilSys identity verification, Soroban escrow in the disbursement path, mobile + SMS/USSD.
- **Scale:** anchor partnerships across APAC, government pilots.

## License

MIT — see [LICENSE](./LICENSE).
