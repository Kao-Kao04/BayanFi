# BayanFi User Stories & Use Cases

Format: *As a [role], I want [capability], so that [benefit].*
Each story includes acceptance criteria (AC).

## Beneficiary

### US-B1: Register and create a wallet
As a beneficiary, I want to register and get a digital wallet automatically, so that I can receive aid without a bank account.
- AC: Registration with email/password succeeds and issues JWT tokens.
- AC: A Stellar wallet is provisioned with a USDC trustline on first request.
- AC: The secret key is encrypted at rest and never exposed to the client.

### US-B2: Browse and apply for programs
As a beneficiary, I want to browse available programs and apply, so that I can request assistance I qualify for.
- AC: Only ACTIVE programs are listed publicly.
- AC: Duplicate applications to the same program are rejected.
- AC: Application starts as DRAFT and can be submitted.

### US-B3: Track application status
As a beneficiary, I want to see my application status in real time, so that I know when aid arrives.
- AC: Status transitions are reflected within seconds via WebSocket.
- AC: On disbursement, a Stellar transaction hash and explorer link are shown.

### US-B4: Spend aid at merchants
As a beneficiary, I want to pay merchants by scanning a QR, so that I can use my aid for approved goods.
- AC: Payments violating spending restrictions are blocked with a clear reason.
- AC: A digital receipt with on-chain proof is generated.

### US-B5: Ask the assistant
As a beneficiary, I want to ask questions about eligibility and requirements, so that I get help 24/7.
- AC: The assistant responds within a few seconds, degrading gracefully offline.

## Organization Admin

### US-O1: Register and get verified
As an org admin, I want to register my organization and be verified, so that I can run programs.
- AC: On verification, a master Stellar account is provisioned.
- AC: Programs cannot be activated until the org is VERIFIED.

### US-O2: Create and fund programs
As an org admin, I want to create programs with budgets and rules, so that I can distribute funds within policy.
- AC: Budget, per-beneficiary max, eligibility, and spending restrictions are configurable.
- AC: Distributed amount can never exceed the budget (enforced atomically).

### US-O3: Review applications
As staff, I want AI-flagged applications surfaced first, so that I focus on risky cases.
- AC: Risk score, duplicate/fraud flags, and explanations are visible.
- AC: Approve triggers on-chain disbursement.

## Merchant

### US-M1: Register and accept payments
As a merchant, I want to register and generate QR codes, so that I can accept aid payments.
- AC: A payment wallet is provisioned on registration.
- AC: QR encodes a SEP-0007 pay URI compatible with Stellar wallets.

### US-M2: Track sales
As a merchant, I want a sales dashboard, so that I can reconcile revenue.
- AC: Today/week/month/total figures are shown.

## Auditor

### US-A1: Audit transactions
As an auditor, I want to search and verify transactions, so that I can ensure funds are used correctly.
- AC: Transactions are searchable by date, status, and program.
- AC: Each transaction links to on-chain proof.

### US-A2: Investigate anomalies
As an auditor, I want AI-flagged anomalies surfaced, so that I can investigate misuse.
- AC: Anomalies with REVIEW_REQUIRED status are listed.
- AC: I can flag a transaction with a reason.

## Super Admin

### US-S1: Verify organizations
As a super admin, I want to verify organizations, so that only legitimate entities distribute funds.

### US-S2: Emergency disaster release
As a super admin, I want to release emergency funds to a region, so that disaster victims get instant help.
- AC: All active beneficiaries in the region receive a fixed amount.
- AC: Every disbursement is recorded on-chain and auditable.
- AC: The release fails safely if the budget is insufficient.

## Use Case Summary Table

| ID | Actor | Use Case | Priority |
|----|-------|----------|----------|
| UC-1 | Beneficiary | Register & wallet creation | Critical |
| UC-2 | Beneficiary | Apply for program | Critical |
| UC-3 | Beneficiary | Receive & spend funds | Critical |
| UC-4 | Org Admin | Create & fund program | Critical |
| UC-5 | Staff | Review & approve application | Critical |
| UC-6 | Merchant | Accept QR payment | High |
| UC-7 | Auditor | Audit & flag transactions | High |
| UC-8 | Super Admin | Verify organization | High |
| UC-9 | Super Admin | Disaster emergency release | High |
| UC-10 | Any | AI assistant chat | Medium |
