# BayanFi Sequence Diagrams

## 1. User Registration & Wallet Creation

```mermaid
sequenceDiagram
    actor B as Beneficiary
    participant W as Web App
    participant API as Backend
    participant DB as PostgreSQL
    participant S as Stellar

    B->>W: Fill registration form
    W->>API: POST /auth/register
    API->>DB: Create user (bcrypt hash)
    API->>API: Issue JWT + refresh token
    API->>DB: Store session
    API-->>W: { user, tokens }
    W-->>B: Redirect to dashboard
    B->>W: Create wallet
    W->>API: POST /wallets
    API->>S: Generate keypair
    API->>S: Fund account (Friendbot/master)
    API->>S: Establish USDC trustline
    API->>DB: Store encrypted secret key
    API-->>W: Wallet { publicKey }
    W-->>B: Wallet ready
```

## 2. Application Submission with AI Analysis

```mermaid
sequenceDiagram
    actor B as Beneficiary
    participant API as Backend
    participant AI as AI Service
    participant DB as PostgreSQL

    B->>API: POST /applications/:id/submit
    API->>AI: /duplicate-check
    API->>AI: /fraud-check
    API->>AI: /eligibility
    AI-->>API: scores + flags
    API->>API: Compose risk score
    API->>DB: Update application (scores, flags)
    alt AUTOMATIC workflow & low risk
        API->>API: Auto-approve path
    else Manual review
        API->>DB: Status = SUBMITTED
    end
    API-->>B: Application status
```

## 3. Approval & On-Chain Disbursement

```mermaid
sequenceDiagram
    actor S as Staff
    participant API as Backend
    participant DB as PostgreSQL
    participant STL as Stellar

    S->>API: POST /applications/:id/approve
    API->>DB: BEGIN transaction
    API->>DB: reserveBudget (atomic increment)
    API->>DB: Application = APPROVED
    API->>DB: COMMIT
    API->>STL: ensureTrustline(beneficiary)
    API->>DB: Create Transaction (PENDING)
    API->>STL: sendPayment(org -> beneficiary)
    STL-->>API: tx hash + ledger
    API->>DB: Transaction = SUCCESS
    API->>DB: Application = DISBURSED
    API-->>S: { application, transaction }
```

## 4. Merchant QR Payment

```mermaid
sequenceDiagram
    actor B as Beneficiary
    participant M as Merchant App
    participant W as Beneficiary App
    participant API as Backend
    participant STL as Stellar

    M->>API: POST /merchants/me/qr
    API-->>M: QR (SEP-0007 pay URI)
    M-->>B: Display QR
    B->>W: Scan QR
    W->>API: POST /transactions/pay
    API->>API: Enforce spending restrictions
    API->>STL: sendPayment(beneficiary -> merchant)
    STL-->>API: tx hash
    API->>API: Increment merchant sales
    API-->>W: Receipt + explorer link
    API-->>M: WebSocket payment.received
```

## 5. Disaster Emergency Release

```mermaid
sequenceDiagram
    actor A as Org Admin
    participant API as Backend
    participant DB as PostgreSQL
    participant STL as Stellar
    participant N as Notifications

    A->>API: POST /disaster/release {region, amount}
    API->>DB: Find active beneficiaries in region
    API->>API: Validate budget >= total
    loop For each beneficiary
        API->>DB: Ensure wallet exists
        API->>DB: Create APPROVED application
        API->>DB: reserveBudget
        API->>STL: sendPayment
        STL-->>API: tx hash
        API->>DB: Application = DISBURSED
        API->>N: Notify beneficiary (SMS/push)
    end
    API-->>A: { sent, failed, failures }
```

## 6. Token Refresh Rotation

```mermaid
sequenceDiagram
    participant W as Web App
    participant API as Backend
    participant DB as PostgreSQL

    W->>API: Request with expired access token
    API-->>W: 401 TOKEN_EXPIRED
    W->>API: POST /auth/refresh { refreshToken }
    API->>DB: Verify session by token hash
    API->>DB: Delete old session (rotation)
    API->>API: Issue new access + refresh
    API->>DB: Store new session
    API-->>W: { accessToken, refreshToken }
    W->>API: Retry original request
```
