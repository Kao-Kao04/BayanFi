# BayanFi Flowcharts & UML

## Application Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> SUBMITTED: submit (AI checks run)
    DRAFT --> CANCELLED: cancel
    SUBMITTED --> UNDER_REVIEW: staff review
    SUBMITTED --> APPROVED: auto-approve (low risk)
    SUBMITTED --> CANCELLED: cancel
    UNDER_REVIEW --> APPROVED: approve
    UNDER_REVIEW --> REJECTED: reject
    APPROVED --> DISBURSED: on-chain payment success
    REJECTED --> [*]
    CANCELLED --> [*]
    DISBURSED --> [*]
```

## Fraud Decision Flow

```mermaid
flowchart TD
    A[Application submitted] --> B{Duplicate check}
    B -->|Duplicate found| F[Flag: REVIEW_REQUIRED]
    B -->|Unique| C{Fraud score}
    C -->|>= 70| F
    C -->|< 70| D{Eligibility}
    D -->|Not eligible| F
    D -->|Eligible| E{Risk score < 30 & AUTOMATIC?}
    E -->|Yes| G[Auto-approve & disburse]
    E -->|No| H[Queue for staff review]
    F --> H
    H --> I[Staff decision]
    I -->|Approve| G
    I -->|Reject| J[Rejected with reason]
```

## Program Funding & Disbursement Flow

```mermaid
flowchart LR
    A[Organization verified] --> B[Master Stellar account provisioned]
    B --> C[Create program with budget]
    C --> D[Activate program]
    D --> E[Beneficiaries apply]
    E --> F[AI + staff approval]
    F --> G[Reserve budget atomically]
    G --> H[On-chain disbursement]
    H --> I[Beneficiary wallet funded]
    I --> J[Spend at merchants via QR]
    J --> K[Merchant settlement]
```

## RBAC Authorization Flow

```mermaid
flowchart TD
    A[Request] --> B{Public route?}
    B -->|Yes| Z[Allow]
    B -->|No| C{Valid JWT?}
    C -->|No| X[401 Unauthorized]
    C -->|Yes| D{Route requires roles?}
    D -->|No| Z
    D -->|Yes| E{SUPER_ADMIN?}
    E -->|Yes| Z
    E -->|No| F{Role in allowed set?}
    F -->|No| Y[403 Forbidden]
    F -->|Yes| G{Ownership check needed?}
    G -->|No| Z
    G -->|Yes| H{Owns resource?}
    H -->|No| Y
    H -->|Yes| Z
```

## Component Diagram (UML)

```mermaid
flowchart TB
    subgraph Frontend
        NEXT[Next.js App]
    end
    subgraph Backend
        AUTH[Auth Module]
        PROG[Programs Module]
        APP[Applications Module]
        TXN[Transactions Module]
        STL[Stellar Module]
        AIP[AI Proxy Module]
    end
    subgraph External
        AISVC[Python AI Service]
        HORIZON[Stellar Horizon]
        SOROBAN[Soroban RPC]
    end
    subgraph Data
        PG[(PostgreSQL)]
        RD[(Redis)]
    end

    NEXT --> AUTH & PROG & APP & TXN
    APP --> AIP --> AISVC
    APP --> TXN --> STL
    STL --> HORIZON
    STL --> SOROBAN
    AUTH & PROG & APP & TXN --> PG
    AUTH --> RD
```

## Deployment Diagram (UML)

```mermaid
flowchart TB
    subgraph Edge
        LB[Load Balancer / Nginx]
    end
    subgraph Compute
        WEBPODS[Web Pods]
        APIPODS[API Pods]
        WORKERS[Queue Workers]
        AIPODS[AI Pods]
    end
    subgraph Managed
        PG[(PostgreSQL + replicas)]
        RD[(Redis)]
    end
    subgraph Blockchain
        STELLAR[Stellar Network]
    end

    LB --> WEBPODS
    LB --> APIPODS
    APIPODS --> AIPODS
    APIPODS --> PG
    APIPODS --> RD
    WORKERS --> PG
    APIPODS --> STELLAR
```
