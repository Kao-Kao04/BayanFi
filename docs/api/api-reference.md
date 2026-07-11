# BayanFi API Reference

**Version:** 1.0
**Base URL:** `https://api.bayanfi.io/v1` (production) | `http://localhost:4000/v1` (development)
**Protocol:** REST over HTTPS
**Format:** JSON
**Auth:** Bearer JWT

---

## Table of Contents

1. [Authentication](#authentication)
2. [Conventions](#conventions)
3. [Auth Endpoints](#auth-endpoints)
4. [Organizations](#organizations)
5. [Programs](#programs)
6. [Applications](#applications)
7. [Beneficiaries](#beneficiaries)
8. [Wallets](#wallets)
9. [Transactions](#transactions)
10. [Merchants](#merchants)
11. [AI Services](#ai-services)
12. [Transparency (Public)](#transparency-public)
13. [Auditor](#auditor)
14. [Disaster Mode](#disaster-mode)
15. [WebSocket Events](#websocket-events)
16. [Error Codes](#error-codes)

---

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Access tokens expire after 15 minutes. Use the refresh token endpoint to obtain a new access token.

### Token Lifecycle

```
Login -> access_token (15m) + refresh_token (7d)
        -> access_token expires
        -> POST /auth/refresh with refresh_token
        -> new access_token + new refresh_token (rotation)
```

---

## Conventions

### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Protected routes | `Bearer <token>` |
| `Content-Type` | POST/PATCH/PUT | `application/json` |
| `X-Request-Id` | Optional | Client correlation ID |
| `Accept-Language` | Optional | `en`, `fil`, `tl` |

### Pagination

List endpoints support cursor and offset pagination:

```
GET /programs?page=1&limit=20&sort=createdAt&order=desc
```

Response envelope:

```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 143,
    "totalPages": 8
  }
}
```

### Standard Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  },
  "requestId": "req_abc123"
}
```


---

## Auth Endpoints

### POST /auth/register

Register a new user account.

**Request:**
```json
{
  "email": "juan@example.com",
  "password": "SecureP@ss123",
  "role": "BENEFICIARY",
  "phone": "+639171234567"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "juan@example.com",
      "role": "BENEFICIARY",
      "isEmailVerified": false
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### POST /auth/login

Authenticate with email and password.

**Request:**
```json
{
  "email": "juan@example.com",
  "password": "SecureP@ss123"
}
```

**Response `200`:** Returns user object + tokens. If MFA enabled, returns `mfaRequired: true` and a temporary `mfaToken`.

### POST /auth/mfa/verify

Complete MFA challenge.

**Request:**
```json
{ "mfaToken": "temp_token", "code": "123456" }
```

### POST /auth/wallet-login

Authenticate using a Stellar wallet signature (challenge-response).

**Request:**
```json
{
  "publicKey": "GABC...",
  "signature": "base64_signature",
  "challenge": "server_issued_nonce"
}
```

### POST /auth/refresh

Exchange a refresh token for a new access token (with rotation).

**Request:**
```json
{ "refreshToken": "eyJ..." }
```

### POST /auth/logout

Invalidate the current refresh token/session.

### POST /auth/forgot-password

Send a password reset email.

**Request:** `{ "email": "juan@example.com" }`

### POST /auth/reset-password

Reset password using a time-limited token.

**Request:** `{ "token": "reset_token", "password": "NewP@ss123" }`


---

## Organizations

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/organizations` | Authenticated | Register new organization |
| GET | `/organizations` | Super Admin | List all organizations |
| GET | `/organizations/:id` | Member | Get organization details |
| PATCH | `/organizations/:id` | Org Admin | Update organization |
| POST | `/organizations/:id/verify` | Super Admin | Verify organization |
| POST | `/organizations/:id/members` | Org Admin | Invite member |
| GET | `/organizations/:id/members` | Member | List members |
| DELETE | `/organizations/:id/members/:userId` | Org Admin | Remove member |
| GET | `/organizations/:id/stats` | Member | Organization statistics |

### POST /organizations

**Request:**
```json
{
  "name": "Department of Social Welfare",
  "type": "GOVERNMENT",
  "registrationNumber": "GOV-2026-001",
  "contactEmail": "contact@dswd.gov.ph",
  "contactPhone": "+63288888888",
  "address": {
    "line1": "Batasan Complex",
    "city": "Quezon City",
    "province": "Metro Manila",
    "region": "NCR",
    "country": "PH"
  }
}
```

---

## Programs

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/programs` | Org Admin/Staff | Create program |
| GET | `/programs` | Public | List active programs |
| GET | `/programs/:id` | Public | Get program details |
| PATCH | `/programs/:id` | Org Admin/Staff | Update program |
| POST | `/programs/:id/activate` | Org Admin | Activate program |
| POST | `/programs/:id/pause` | Org Admin | Pause program |
| POST | `/programs/:id/fund` | Org Admin | Fund program wallet |
| GET | `/programs/:id/applications` | Staff | List applications |
| GET | `/programs/:id/stats` | Member | Program statistics |

### POST /programs

**Request:**
```json
{
  "name": "TES College Scholarship 2026",
  "type": "SCHOLARSHIP",
  "description": "Tertiary education subsidy",
  "budgetAmount": 5000000,
  "budgetAsset": "USDC",
  "maxAmountPerBeneficiary": 20000,
  "startDate": "2026-08-01",
  "endDate": "2027-05-31",
  "eligibilityCriteria": {
    "age": { "min": 16, "max": 30 },
    "income": { "max": 300000 },
    "location": ["NCR", "Region III"]
  },
  "requiredDocuments": ["NATIONAL_ID", "PROOF_OF_ENROLLMENT", "PROOF_OF_INCOME"],
  "approvalWorkflow": "SINGLE_APPROVAL",
  "spendingRestrictions": {
    "allowedCategories": ["EDUCATION"],
    "dailyLimit": 5000
  }
}
```


---

## Applications

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/applications` | Beneficiary | Create draft application |
| GET | `/applications` | Beneficiary | List own applications |
| GET | `/applications/:id` | Owner/Staff | Get application |
| PATCH | `/applications/:id` | Beneficiary | Update draft |
| POST | `/applications/:id/submit` | Beneficiary | Submit for review |
| POST | `/applications/:id/documents` | Beneficiary | Upload document |
| POST | `/applications/:id/review` | Staff | Review application |
| POST | `/applications/:id/approve` | Staff/Org Admin | Approve + disburse |
| POST | `/applications/:id/reject` | Staff | Reject application |
| POST | `/applications/:id/cancel` | Beneficiary | Cancel application |

### POST /applications/:id/approve

Approves an application and triggers on-chain disbursement.

**Request:**
```json
{ "approvedAmount": 20000, "note": "All requirements verified" }
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "application": { "id": "uuid", "status": "DISBURSED" },
    "transaction": {
      "id": "uuid",
      "stellarTxHash": "abc123...",
      "amount": 20000,
      "assetCode": "USDC",
      "status": "SUCCESS"
    }
  }
}
```

---

## Beneficiaries

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/beneficiaries` | Beneficiary | Create profile |
| GET | `/beneficiaries/me` | Beneficiary | Get own profile |
| PATCH | `/beneficiaries/me` | Beneficiary | Update profile |
| GET | `/beneficiaries/:id` | Staff | Get profile (staff) |
| GET | `/beneficiaries` | Staff | Search beneficiaries |

---

## Wallets

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/wallets` | Authenticated | Create/connect wallet |
| GET | `/wallets/me` | Authenticated | List own wallets |
| GET | `/wallets/:id/balance` | Owner | Get live balance |
| GET | `/wallets/:id/transactions` | Owner | Transaction history |
| POST | `/wallets/:id/qr` | Owner | Generate payment QR |
| POST | `/wallets/connect` | Authenticated | Connect external (Freighter) |

### GET /wallets/:id/balance

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "publicKey": "GABC...",
    "balances": [
      { "asset": "XLM", "balance": "5.0000000" },
      { "asset": "USDC", "issuer": "GA5Z...", "balance": "20000.0000000" }
    ],
    "lastSyncedAt": "2026-07-11T10:00:00Z"
  }
}
```


---

## Transactions

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/transactions/pay` | Beneficiary | Pay a merchant |
| GET | `/transactions/:id` | Owner/Auditor | Get transaction |
| GET | `/transactions/:id/receipt` | Owner | Download receipt (PDF) |
| GET | `/transactions/:id/proof` | Public | Blockchain proof link |

### POST /transactions/pay

Pay a merchant by scanning their QR (contains merchant wallet + optional amount).

**Request:**
```json
{
  "merchantId": "uuid",
  "amount": 350.50,
  "assetCode": "USDC",
  "memo": "Groceries"
}
```

Spending restrictions from the funding program are enforced server-side before submitting to Stellar.

---

## Merchants

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/merchants` | Authenticated | Register merchant |
| GET | `/merchants/me` | Merchant | Get own profile |
| POST | `/merchants/:id/verify` | Org Admin | Verify merchant |
| POST | `/merchants/me/qr` | Merchant | Generate static/dynamic QR |
| GET | `/merchants/me/sales` | Merchant | Sales analytics |
| GET | `/merchants/me/transactions` | Merchant | Transaction history |
| POST | `/merchants/me/refund` | Merchant | Issue refund |

---

## AI Services

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/ai/duplicate-check` | Staff | Check for duplicate beneficiary |
| POST | `/ai/fraud-check` | Staff | Fraud risk analysis |
| POST | `/ai/verify-document` | Staff | Document authenticity |
| POST | `/ai/anomaly-check` | Auditor | Spending anomaly analysis |
| POST | `/ai/eligibility` | Beneficiary | Eligibility prediction |
| POST | `/ai/chat` | Authenticated | Chatbot query |
| GET | `/ai/forecast/:programId` | Org Admin | Budget forecast |

### POST /ai/chat

**Request:**
```json
{
  "message": "Am I eligible for the scholarship program?",
  "context": { "programId": "uuid" }
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "reply": "Based on your profile, you meet 3 of 4 criteria. You still need to upload proof of enrollment.",
    "confidence": 0.92,
    "suggestedActions": [
      { "type": "UPLOAD_DOCUMENT", "documentType": "PROOF_OF_ENROLLMENT" }
    ]
  }
}
```

---

## Transparency (Public)

No authentication required. No PII exposed.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/public/programs` | List active programs with stats |
| GET | `/public/stats` | Platform-wide statistics |
| GET | `/public/programs/:id` | Program transparency detail |
| GET | `/public/map` | Geographic distribution data |
| GET | `/public/transactions/daily` | Daily transaction volume |

### GET /public/stats

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "totalPrograms": 42,
    "totalBudget": "125000000.00",
    "totalDistributed": "87500000.00",
    "totalBeneficiaries": 15420,
    "totalTransactions": 98341,
    "activeOrganizations": 18
  }
}
```

---

## Auditor

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/audit/transactions` | Search transactions |
| POST | `/audit/transactions/:id/flag` | Flag transaction |
| GET | `/audit/logs` | Query audit logs |
| GET | `/audit/reports` | Generate report (PDF/Excel) |
| GET | `/audit/anomalies` | View AI-flagged anomalies |

---

## Disaster Mode

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/disaster/release` | Super Admin/Org Admin | Emergency fund release |
| GET | `/disaster/regions` | Authenticated | Available target regions |
| GET | `/disaster/:id/status` | Authenticated | Release status |

### POST /disaster/release

**Request:**
```json
{
  "programId": "uuid",
  "region": "Region VIII",
  "amountPerRecipient": 5000,
  "assetCode": "USDC",
  "recipientFilter": { "verified": true, "affected": true }
}
```


---

## WebSocket Events

Connect: `wss://api.bayanfi.io/ws?token=<access_token>`

### Server -> Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `application.status_changed` | `{ applicationId, status }` | Application status update |
| `transaction.received` | `{ transactionId, amount, asset }` | Funds received |
| `transaction.sent` | `{ transactionId, amount, asset }` | Payment sent |
| `notification.new` | `{ notification }` | New notification |
| `dashboard.update` | `{ stats }` | Live dashboard stats |
| `disaster.progress` | `{ releaseId, sent, total }` | Disaster release progress |

### Client -> Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `subscribe` | `{ channel }` | Subscribe to a channel |
| `unsubscribe` | `{ channel }` | Unsubscribe |
| `ping` | `{}` | Keep-alive |

---

## Error Codes

| HTTP | Code | Description |
|------|------|-------------|
| 400 | `VALIDATION_ERROR` | Request validation failed |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 401 | `TOKEN_EXPIRED` | Access token expired |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 403 | `ACCOUNT_LOCKED` | Too many failed attempts |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Duplicate resource |
| 409 | `DUPLICATE_APPLICATION` | Already applied to program |
| 422 | `INSUFFICIENT_FUNDS` | Program/wallet lacks funds |
| 422 | `SPENDING_RESTRICTED` | Merchant category not allowed |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
| 502 | `STELLAR_ERROR` | Blockchain network error |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily down |

### Rate Limits

| Endpoint Group | Limit |
|----------------|-------|
| Auth | 10 requests / 15 min |
| General API | 100 requests / 15 min |
| AI Services | 30 requests / 15 min |
| Public | 300 requests / 15 min |

---

## OpenAPI / Swagger

Interactive API documentation is available at:
- Development: `http://localhost:4000/api/docs`
- The full OpenAPI 3.0 spec is served at `/api/docs-json`
