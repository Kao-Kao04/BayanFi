<div align="center">

# 🛡️ BayanFi

### Transparent Public Money. Powered by Stellar.

**AI-powered public finance platform that lets governments, NGOs, universities, and disaster-relief organizations distribute financial assistance instantly and transparently on the Stellar blockchain.**

[![Stellar](https://img.shields.io/badge/Stellar-Testnet-7D00FF)](https://stellar.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E)](https://nestjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

_Built for the Stellar APAC Hackathon._

</div>

---

## 💡 The Problem

Public aid today is slow, opaque, and leaks value. Cash and paper forms enable **ghost beneficiaries**, **duplicate claims**, and **fraud**, while citizens have **no way to verify** where funds actually go. Distribution can cost 7–15% in overhead.

## ✅ The Solution

BayanFi replaces spreadsheets and manual verification with **programmable, transparent money on Stellar**:

- 💸 **Instant disbursement** — aid reaches beneficiaries in 3–5 seconds, for a fraction of a cent
- 🔍 **Publicly verifiable** — every figure is backed by on-chain state anyone can audit
- 🧠 **AI fraud prevention** — duplicate detection, risk scoring, and document checks
- 🏦 **Financial inclusion** — beneficiaries onboard with **zero XLM** via sponsored reserves
- 📱 **QR payments** — spend aid at verified merchants, settled on-chain

---

## ⭐ Why Stellar Is Essential

Every feature answers one question: _why does this need a blockchain?_ These are **implemented and verifiable**, not slideware:

| Capability | Why it needs Stellar |
|-----------|----------------------|
| **Sponsored Reserves (CAP-33)** | Beneficiaries onboard with **0 XLM** — the platform sponsors all reserves. This is how we bank the unbanked for free. *(verified on testnet: accounts created with 0 XLM + sponsored USDC trustline)* |
| **On-chain transparency** | The public dashboard reads **live ledger state** via Horizon. Anyone can cross-check the numbers and follow every transaction to the explorer — impossible with a private database. |
| **Claimable Balances** | Disaster relief can be sent to people who don't have a wallet yet — they claim it later. |
| **Instant settlement** | 3–5s finality, sub-cent fees — viable for micro-disbursements at national scale. |
| **Soroban escrow** | Program budget caps and per-beneficiary limits enforced **on-chain**, not just in app code. |

## 🧠 AI Features

Meaningful AI, not buzzwords — each is explainable and keeps a human in the loop:

- **Duplicate / ghost-beneficiary detection** (fuzzy identity matching over the beneficiary set)
- **Fraud risk scoring** with a transparent factor breakdown
- **Document verification** routing low-confidence uploads to manual review
- **Spending anomaly detection** for auditors
- **24/7 assistant** (OpenAI or on-prem Ollama) for eligibility & status questions
- **Budget forecasting** for program administrators

---

## 🏗️ Architecture

```
apps/
  web/          Next.js 14 · React · TypeScript · Tailwind · Shadcn UI
  backend/      NestJS · Prisma · PostgreSQL (Supabase) · JWT + RBAC
  ai-service/   Python FastAPI · OpenAI / Ollama · scikit-learn
packages/
  stellar/      Stellar SDK wrapper (sponsored reserves, claimable balances, QR)
  types/        Shared TypeScript types
contracts/
  program_escrow/   Soroban smart contract (Rust) — on-chain budget enforcement
docs/           SRS · architecture · API reference · diagrams · roadmap
```

Six roles with full RBAC: **Super Admin · Org Admin · Staff · Auditor · Merchant · Beneficiary**.

## 🚀 Quick Start

```bash
npm install
cp .env.example .env          # add a Supabase DATABASE_URL (Session pooler, port 5432)
npm run stellar:setup         # generates + funds a Stellar testnet master account
npm run db:push               # sync schema to your database
npm run db:seed               # load demo data
npm run dev                   # web :3000 · api :4000 · ai :8000
```

- **Web app:** http://localhost:3000
- **API + Swagger:** http://localhost:4000/api/docs
- **AI docs:** http://localhost:8000/docs

### Demo Accounts

All use password **`BayanFi@2026`**:

| Email | Role |
|-------|------|
| `admin@bayanfi.io` | Super Admin |
| `dswd.admin@bayanfi.io` | Organization Admin |
| `auditor@bayanfi.io` | Auditor |
| `juan@bayanfi.io` | Beneficiary |
| `store@bayanfi.io` | Merchant |

## 🗺️ Roadmap

- **Now (MVP):** auth + RBAC, programs, applications with AI checks, sponsored-reserve wallets, QR payments, public on-chain transparency, disaster mode
- **Next:** PHP anchor (SEP-24/31) cash-out, PhilSys identity verification, Soroban escrow in the disbursement path, mobile-first + SMS/USSD
- **Scale:** partner anchors across APAC, government pilots, embedding-based fraud detection

## 📄 License

MIT — see [LICENSE](./LICENSE).

<div align="center">
<sub>Built with ❤️ for financial inclusion and transparency across Southeast Asia.</sub>
</div>
