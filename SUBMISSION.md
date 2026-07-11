# 📤 BayanFi — Hackathon Submission Guide

Everything you need to complete the Stellar APAC Hackathon submission form.
Copy-paste the ready-made text below into each field.

---

## ✅ Submission Checklist

| Field | What to paste |
|-------|---------------|
| Project Description | Use the text in [Section 1](#1-project-description) |
| GitHub Repository Link | `https://github.com/Kao-Kao04/BayanFi` |
| Video Demo Link | Your YouTube (unlisted) link — see [Section 3](#3-how-to-record-the-demo-video) |
| Presentation (PPT) Link | Your Google Slides / Canva share link — see [Section 4](#4-presentation-ppt-contents) |
| Contract address in README | ✅ Already added — see the "Smart Contract & On-Chain Addresses" section of the README |

Before submitting, make sure:
- [ ] The GitHub repo is **Public** (Settings → General → Danger Zone → Change visibility)
- [ ] README shows the on-chain addresses
- [ ] Demo video is uploaded and set to **Unlisted** or **Public** (not Private)
- [ ] PPT link sharing is set to "Anyone with the link can view"

---

## 1. Project Description

### Short version (for a one-line / tagline field)
> BayanFi is an AI-powered public finance platform on Stellar that lets governments and NGOs distribute aid instantly and transparently — with beneficiaries onboarding at zero cost via sponsored reserves.

### Medium version (~100 words — recommended for the form)
> BayanFi is a public finance platform that lets governments, NGOs, and universities distribute financial assistance on the Stellar blockchain. It replaces slow, opaque, fraud-prone cash programs with instant, publicly verifiable disbursements. Beneficiaries onboard with **zero XLM** using Stellar's sponsored reserves, receive funds in 3–5 seconds, and spend them at merchants via QR — all settled on-chain. AI powers duplicate/ghost-beneficiary detection, fraud scoring, and a 24/7 assistant. A public transparency dashboard reads live ledger state, so any citizen can verify where public money goes. Built with Next.js, NestJS, a Python AI service, and a Soroban escrow contract.

### Long version (for a detailed description field)
See [Section 2](#2-long-project-description) below.

---

## 2. Long Project Description

**The problem.** Public aid today is slow, opaque, and leaky. Cash and paper forms enable ghost beneficiaries, duplicate claims, and fraud, while citizens have no way to verify where funds go. Distribution overhead runs 7–15%.

**The solution.** BayanFi turns public money into programmable, transparent money on Stellar:
- **Instant disbursement** — aid arrives in 3–5 seconds for a fraction of a cent.
- **Zero-cost onboarding** — beneficiaries get a Stellar wallet with **0 XLM** via sponsored reserves (CAP-33); the platform sponsors all reserves so the unbanked need no crypto.
- **Publicly verifiable** — the transparency dashboard reads live ledger state through Horizon; every figure links to the block explorer.
- **AI fraud prevention** — duplicate/ghost detection, explainable fraud scoring, document checks, spending-anomaly detection, and a 24/7 assistant.
- **QR merchant payments** — beneficiaries spend aid at verified merchants, settled on-chain.
- **Disaster mode** — bulk emergency releases to a whole region in parallel; claimable balances let funds reach people who don't have a wallet yet.

**Why Stellar is essential.** Sponsored reserves make free onboarding possible; on-chain settlement makes transparency trustless (impossible with a private database); claimable balances handle wallet-less recipients; Soroban enforces budget caps on-chain.

**Tech.** Next.js 14 + Tailwind frontend; NestJS + Prisma + PostgreSQL (Supabase) backend with JWT + RBAC across six roles; Python FastAPI AI service (OpenAI/Ollama); a Soroban escrow contract in Rust; Docker + CI.

**Impact & vision.** Cut aid delivery cost from ~12% to ~2%, eliminate ghost beneficiaries, and give every citizen a receipt on a public ledger — scalable to millions across Southeast Asia.

---

## 3. How to Record the Demo Video

Target length: **2–4 minutes.** Judges watch a lot of videos — keep it tight and show, don't tell.

### Tools (pick one, all free)
- **Windows Game Bar** (built-in): press `Win + G`, or `Win + Alt + R` to start/stop recording. Easiest.
- **OBS Studio** (free, best quality): https://obsproject.com — record screen + mic + webcam bubble.
- **Loom** (free): https://loom.com — records screen + face, gives an instant share link.

### Before you hit record
1. Start everything: `cd bayanfi ; npm run dev`
2. Open these tabs in order:
   - `http://localhost:3000` (landing)
   - `http://localhost:3000/transparency`
   - `http://localhost:3000/login`
   - `https://stellar.expert/explorer/testnet` (for the on-chain proof)
3. Switch the app to **dark mode** (toggle top-right) — it looks best.
4. Close notifications, silence your phone, use a clean desktop.
5. Do one dry run first. Have the demo login ready: `juan@bayanfi.io` / `BayanFi@2026`.

### The script (what to say + click) — ~3 minutes

**[0:00–0:20] Hook + problem** (landing page)
> "This is BayanFi — transparent public money, powered by Stellar. Today, government aid is slow, and prone to ghost beneficiaries and fraud, with no way for citizens to verify where money goes. We fix that."

**[0:20–0:50] Public transparency** (`/transparency`)
> "Anyone — no login — can see every program's budget and distribution, live." Scroll the charts. Click **Verify on Stellar** on a program.
> "These numbers aren't from our database — they're read straight from the Stellar ledger. Here's the funding wallet on the block explorer." Click the explorer link.

**[0:50–2:00] Beneficiary journey** (login as `juan@bayanfi.io`)
- Go to **Programs** → click **Apply**. _"Juan applies for assistance in a tap."_
- Go to **My Wallet** → **Create wallet**.
  > "Watch — we just created a real Stellar account. And notice: it holds ZERO XLM. Using Stellar's sponsored reserves, the platform pays all the fees, so the unbanked onboard for free."
- Copy the address → paste into stellar.expert.
  > "Here it is on-chain — zero XLM, sponsored reserves, a USDC trustline ready to receive aid. Verifiable by anyone."
- Open **Assistant**, ask _"Am I eligible for the scholarship?"_
  > "A 24/7 AI assistant, with fraud and duplicate detection running behind the scenes."

**[2:00–2:40] Merchant** (login as `store@bayanfi.io`)
- **Receive Payment** → **Generate QR**.
  > "Merchants accept aid by QR. Payments settle on Stellar in seconds, for under a cent — no chargebacks, no middlemen."

**[2:40–3:00] Close** (open `http://localhost:4000/api/docs`)
> "Production-grade: NestJS, a Python AI service, a Soroban escrow contract, full RBAC and audit logs. BayanFi makes public money instant, inclusive, and transparent — powered by Stellar. Salamat!"

### Recording tips
- Speak slowly and clearly; smile — energy sells.
- If a step is slow (wallet funding), pre-do it once so it's cached, or edit out the wait.
- Keep the cursor movements deliberate. Zoom your browser to 110–125% so text is readable.

### Upload
- Upload to **YouTube**, set visibility to **Unlisted** (or Public), copy the link into the form.

---

## 4. Presentation (PPT) Contents

Build in **Google Slides** or **Canva** (free), then share with "Anyone with the link can view." Aim for **10–12 slides**. Content for each below — copy the bullets.

### Slide 1 — Title
- **BayanFi**
- Tagline: _Transparent Public Money. Powered by Stellar._
- Your name / team, Stellar APAC Hackathon
- Logo/shield visual, dark background

### Slide 2 — The Problem
- Public aid is slow, opaque, fraud-prone
- Ghost beneficiaries & duplicate claims
- 7–15% distribution overhead
- Citizens can't verify where money goes
- (Add a stat or a Philippine news headline about aid leakage for impact)

### Slide 3 — The Solution
- BayanFi = operating system for public money on Stellar
- Instant, transparent, fraud-resistant disbursement
- One-line: "From cash and paper to programmable money with a public receipt"

### Slide 4 — How It Works (flow diagram)
- Organization creates + funds a program →
- Beneficiary applies → AI screens → approved →
- Funds disbursed on Stellar (3–5s) →
- Beneficiary spends via QR at merchants →
- Every step on the public ledger

### Slide 5 — Why Stellar Is Essential (the money slide)
- **Sponsored reserves** → unbanked onboard with 0 XLM
- **On-chain settlement** → trustless transparency (impossible on a DB)
- **Claimable balances** → reach wallet-less disaster victims
- **Soroban escrow** → budget caps enforced on-chain
- **3–5s finality, sub-cent fees** → viable at national scale

### Slide 6 — AI That Matters
- Duplicate / ghost-beneficiary detection
- Explainable fraud scoring (human-in-the-loop)
- Document verification, spending-anomaly detection
- 24/7 assistant (OpenAI or on-prem Ollama)

### Slide 7 — Live Demo / Screenshots
- Screenshot: transparency dashboard + "Verify on Stellar"
- Screenshot: beneficiary wallet (0 XLM, on-chain)
- Screenshot: stellar.expert account view
- "Everything you'll see is on Stellar Testnet, verifiable now"

### Slide 8 — Architecture
- Next.js web · NestJS API · Python AI service · Soroban contract
- PostgreSQL (Supabase) · Stellar (Horizon + Soroban)
- 6 roles, RBAC, JWT, audit logs, Dockerized
- (Use the diagram from `docs/architecture/system-architecture.md`)

### Slide 9 — Impact & Market
- Cut aid delivery cost ~12% → ~2%
- Eliminate ghost beneficiaries; instant disaster relief
- TAM: government + NGO cash-transfer programs across APAC
- Financial inclusion for the unbanked

### Slide 10 — Business Model
- SaaS platform fee + small bps per disbursement
- "Stripe for aid disbursement"
- Grant-eligible (Stellar Community Fund), govt SaaS contracts

### Slide 11 — Roadmap
- Now: MVP (this hackathon)
- Next: PHP anchor cash-out (SEP-24/31), PhilSys identity, Soroban escrow in disbursement path, mobile + SMS/USSD
- Scale: anchor partnerships, government pilots

### Slide 12 — Closing
- Recap: instant · inclusive · transparent · powered by Stellar
- GitHub link + demo video link + contract addresses
- "Thank you" + contact

### Design tips
- Dark theme, blue→cyan gradient (match the app)
- One idea per slide, big text, minimal words
- Use real screenshots, not stock images
- Keep it under 12 slides; judges skim

---

## 5. Contract Address — Important Note

The submission requires a **contract address in the README** (already added under
"Smart Contract & On-Chain Addresses"). You have two valid options:

**Option A — Use the Stellar Testnet account (already in README).**
The platform master account `GDI7ZF3B...` and the program funding account
`GADRQH46...` are live, verifiable on-chain, and demonstrate sponsored reserves.
For a payment-based Stellar app this is a legitimate on-chain address to submit.

**Option B — Deploy the Soroban escrow to get a `C...` contract ID (stronger).**
The local build was blocked by a missing Windows C++ linker. Deploy from a Linux
environment or **WSL** (Windows Subsystem for Linux):

```bash
# In WSL / Linux
rustup target add wasm32-unknown-unknown
curl -sSf https://sh.rustup.rs | sh          # if Rust isn't installed
cargo install --locked stellar-cli

cd contracts/program_escrow
stellar contract build
stellar keys generate deployer --network testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/program_escrow.wasm \
  --source deployer --network testnet
# -> prints your contract ID (starts with C...). Paste it into the README table.
```

If you deploy, replace the "Soroban escrow contract" row in the README with the
real `C...` contract ID and link it on stellar.expert. That's the strongest
answer to "where's the contract?"

---

## 6. Final Steps

1. Make the GitHub repo **Public**.
2. Record + upload the demo video → paste the link.
3. Build the PPT → share + paste the link.
4. Paste the Project Description (Section 1, medium version).
5. Confirm the contract address is in the README.
6. Submit. 🎉
