# BayanFi Database Schema

**Version:** 1.0  
**Date:** July 11, 2026  
**Database:** PostgreSQL 15+  
**ORM:** Prisma

---

## Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Table Definitions](#table-definitions)
4. [Indexes](#indexes)
5. [Constraints](#constraints)
6. [Data Types](#data-types)

---

## Overview

The BayanFi database is designed to support a multi-tenant public finance platform with the following key characteristics:

- **Multi-organization support**: Multiple organizations can operate independently
- **Audit trail**: Complete history of all actions and changes
- **Blockchain integration**: Store references to Stellar transactions
- **AI analysis**: Store ML model outputs and fraud detection results
- **High performance**: Optimized indexes for common query patterns
- **Data integrity**: Foreign key constraints and check constraints
- **Security**: Encrypted sensitive fields, audit logging

### Database Architecture Principles

1. **Normalization**: 3NF to reduce redundancy
2. **Soft deletes**: Use `deleted_at` timestamp instead of hard deletes
3. **Timestamps**: All tables have `created_at` and `updated_at`
4. **UUID primary keys**: For distributed systems and security
5. **JSONB columns**: For flexible metadata storage
6. **Enum types**: For status fields to ensure data consistency

---

## Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    User     │────────>│ Organization │<────────│   Program   │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │                        │
      │                        │                        │
      v                        v                        v
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│ Beneficiary │         │    Staff     │         │ Application │
└─────────────┘         └──────────────┘         └─────────────┘
      │                                                 │
      │                                                 │
      v                                                 v
┌─────────────┐                                  ┌─────────────┐
│   Wallet    │                                  │  Document   │
└─────────────┘                                  └─────────────┘
      │
      │
      v
┌─────────────┐         ┌──────────────┐
│ Transaction │────────>│   Merchant   │
└─────────────┘         └──────────────┘
```


---

## Table Definitions

### 1. users

Core user authentication and account management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| password_hash | VARCHAR(255) | NULL | Bcrypt hashed password (null for wallet-only auth) |
| role | ENUM | NOT NULL | User role: SUPER_ADMIN, ORG_ADMIN, STAFF, AUDITOR, MERCHANT, BENEFICIARY |
| stellar_public_key | VARCHAR(56) | UNIQUE, NULL | Stellar public key (G...) |
| phone | VARCHAR(20) | NULL | Phone number with country code |
| is_email_verified | BOOLEAN | DEFAULT false | Email verification status |
| is_phone_verified | BOOLEAN | DEFAULT false | Phone verification status |
| mfa_enabled | BOOLEAN | DEFAULT false | Multi-factor authentication status |
| mfa_secret | VARCHAR(255) | NULL | Encrypted TOTP secret |
| last_login_at | TIMESTAMP | NULL | Last successful login |
| login_attempts | INTEGER | DEFAULT 0 | Failed login counter |
| locked_until | TIMESTAMP | NULL | Account lock expiry |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Record update timestamp |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes:**
- `idx_users_email` ON (email)
- `idx_users_stellar_public_key` ON (stellar_public_key)
- `idx_users_role` ON (role)
- `idx_users_deleted_at` ON (deleted_at)

**Constraints:**
- CHECK: `email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'`
- CHECK: `login_attempts >= 0`


### 2. organizations

Government agencies, NGOs, universities, and foundations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique organization identifier |
| name | VARCHAR(255) | NOT NULL | Organization name |
| type | ENUM | NOT NULL | GOVERNMENT, NGO, UNIVERSITY, FOUNDATION, DISASTER_RELIEF |
| registration_number | VARCHAR(100) | NULL | Official registration/license number |
| description | TEXT | NULL | Organization mission and description |
| website | VARCHAR(255) | NULL | Official website URL |
| logo_url | VARCHAR(500) | NULL | Organization logo |
| contact_email | VARCHAR(255) | NOT NULL | Primary contact email |
| contact_phone | VARCHAR(20) | NULL | Primary contact phone |
| address | JSONB | NULL | Full address object |
| status | ENUM | DEFAULT 'PENDING' | PENDING, VERIFIED, SUSPENDED, REJECTED |
| verified_at | TIMESTAMP | NULL | Verification timestamp |
| verified_by | UUID | FK(users.id) | Admin who verified |
| stellar_public_key | VARCHAR(56) | UNIQUE, NULL | Organization master wallet |
| metadata | JSONB | DEFAULT '{}' | Additional organization data |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Record update timestamp |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes:**
- `idx_organizations_status` ON (status)
- `idx_organizations_type` ON (type)
- `idx_organizations_name` ON (name) USING gin(to_tsvector('english', name))

### 3. organization_members

Association between users and organizations with roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique membership identifier |
| organization_id | UUID | FK(organizations.id) | Organization reference |
| user_id | UUID | FK(users.id) | User reference |
| role | ENUM | NOT NULL | ADMIN, MANAGER, STAFF, VIEWER |
| permissions | JSONB | DEFAULT '[]' | Specific permissions array |
| invited_by | UUID | FK(users.id) | User who sent invitation |
| joined_at | TIMESTAMP | DEFAULT NOW() | Membership start date |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Record update timestamp |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes:**
- `idx_org_members_organization` ON (organization_id)
- `idx_org_members_user` ON (user_id)
- `idx_org_members_composite` ON (organization_id, user_id, deleted_at)

**Constraints:**
- UNIQUE (organization_id, user_id) WHERE deleted_at IS NULL


### 4. programs

Assistance programs created by organizations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique program identifier |
| organization_id | UUID | FK(organizations.id) | Owning organization |
| name | VARCHAR(255) | NOT NULL | Program name |
| type | ENUM | NOT NULL | SCHOLARSHIP, MEDICAL, DISASTER_RELIEF, LIVELIHOOD, SENIOR_CITIZEN, PWD, EMERGENCY_CASH, EDUCATION_VOUCHER, FARMER_SUBSIDY |
| description | TEXT | NULL | Detailed program description |
| budget_amount | DECIMAL(20,7) | NOT NULL | Total program budget |
| budget_asset | VARCHAR(12) | DEFAULT 'USDC' | Asset code (USDC, XLM, etc.) |
| distributed_amount | DECIMAL(20,7) | DEFAULT 0 | Amount already distributed |
| max_amount_per_beneficiary | DECIMAL(20,7) | NULL | Maximum per person |
| start_date | DATE | NOT NULL | Program start date |
| end_date | DATE | NULL | Program end date |
| eligibility_criteria | JSONB | DEFAULT '{}' | Structured eligibility rules |
| required_documents | JSONB | DEFAULT '[]' | Required document types |
| approval_workflow | ENUM | DEFAULT 'MANUAL' | AUTOMATIC, SINGLE_APPROVAL, MULTI_APPROVAL |
| spending_restrictions | JSONB | DEFAULT '{}' | Merchant categories, limits |
| status | ENUM | DEFAULT 'DRAFT' | DRAFT, ACTIVE, PAUSED, COMPLETED, CANCELLED |
| stellar_issuer_public_key | VARCHAR(56) | NULL | Asset issuer for custom tokens |
| stellar_distribution_key | VARCHAR(56) | NULL | Distribution account |
| is_emergency | BOOLEAN | DEFAULT false | Disaster relief flag |
| geographic_scope | JSONB | NULL | Regions, barangays covered |
| metadata | JSONB | DEFAULT '{}' | Additional program data |
| created_by | UUID | FK(users.id) | Program creator |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Record update timestamp |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes:**
- `idx_programs_organization` ON (organization_id)
- `idx_programs_type` ON (type)
- `idx_programs_status` ON (status)
- `idx_programs_dates` ON (start_date, end_date)
- `idx_programs_search` ON (name) USING gin(to_tsvector('english', name))

**Constraints:**
- CHECK: `budget_amount > 0`
- CHECK: `distributed_amount >= 0`
- CHECK: `distributed_amount <= budget_amount`
- CHECK: `end_date IS NULL OR end_date >= start_date`


### 5. beneficiaries

Individuals receiving financial assistance.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique beneficiary identifier |
| user_id | UUID | FK(users.id), UNIQUE | Associated user account |
| first_name | VARCHAR(100) | NOT NULL | First name |
| middle_name | VARCHAR(100) | NULL | Middle name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| suffix | VARCHAR(10) | NULL | Jr., Sr., III, etc. |
| date_of_birth | DATE | NOT NULL | Birth date |
| gender | ENUM | NULL | MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY |
| civil_status | ENUM | NULL | SINGLE, MARRIED, WIDOWED, SEPARATED |
| national_id | VARCHAR(50) | NULL | Government-issued ID number (encrypted) |
| national_id_type | VARCHAR(50) | NULL | ID type (passport, driver's license, etc.) |
| address_line1 | VARCHAR(255) | NOT NULL | Street address |
| address_line2 | VARCHAR(255) | NULL | Apartment, unit, etc. |
| barangay | VARCHAR(100) | NULL | Barangay name |
| city | VARCHAR(100) | NOT NULL | City/Municipality |
| province | VARCHAR(100) | NOT NULL | Province |
| region | VARCHAR(100) | NOT NULL | Region |
| postal_code | VARCHAR(20) | NULL | ZIP/Postal code |
| country | VARCHAR(2) | DEFAULT 'PH' | ISO country code |
| coordinates | POINT | NULL | GPS coordinates |
| is_pwd | BOOLEAN | DEFAULT false | Person with disability |
| is_senior | BOOLEAN | DEFAULT false | Senior citizen (60+) |
| is_indigenous | BOOLEAN | DEFAULT false | Indigenous person |
| household_size | INTEGER | NULL | Number of household members |
| monthly_income | DECIMAL(12,2) | NULL | Household monthly income |
| occupation | VARCHAR(100) | NULL | Current occupation |
| biometric_hash | VARCHAR(255) | NULL | Hashed biometric data |
| photo_url | VARCHAR(500) | NULL | ID photo |
| status | ENUM | DEFAULT 'ACTIVE' | ACTIVE, SUSPENDED, BLACKLISTED |
| metadata | JSONB | DEFAULT '{}' | Additional beneficiary data |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Record update timestamp |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes:**
- `idx_beneficiaries_user` ON (user_id)
- `idx_beneficiaries_name` ON (last_name, first_name)
- `idx_beneficiaries_location` ON (region, province, city)
- `idx_beneficiaries_dob` ON (date_of_birth)
- `idx_beneficiaries_status` ON (status)
- `idx_beneficiaries_flags` ON (is_pwd, is_senior, is_indigenous)

**Constraints:**
- CHECK: `date_of_birth < CURRENT_DATE`
- CHECK: `household_size > 0`


### 6. applications

Beneficiary applications for assistance programs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique application identifier |
| program_id | UUID | FK(programs.id) | Target program |
| beneficiary_id | UUID | FK(beneficiaries.id) | Applying beneficiary |
| status | ENUM | DEFAULT 'DRAFT' | DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, DISBURSED, CANCELLED |
| requested_amount | DECIMAL(20,7) | NULL | Amount requested |
| approved_amount | DECIMAL(20,7) | NULL | Amount approved |
| rejection_reason | TEXT | NULL | Reason for rejection |
| purpose | TEXT | NULL | Stated purpose of assistance |
| risk_score | DECIMAL(5,2) | NULL | AI-calculated risk (0-100) |
| eligibility_score | DECIMAL(5,2) | NULL | AI-calculated eligibility (0-100) |
| duplicate_check_passed | BOOLEAN | NULL | Duplicate detection result |
| fraud_check_passed | BOOLEAN | NULL | Fraud detection result |
| flags | JSONB | DEFAULT '[]' | Warning flags from AI |
| submitted_at | TIMESTAMP | NULL | Submission timestamp |
| reviewed_by | UUID | FK(users.id) | Staff who reviewed |
| reviewed_at | TIMESTAMP | NULL | Review timestamp |
| approved_by | UUID | FK(users.id) | Staff who approved |
| approved_at | TIMESTAMP | NULL | Approval timestamp |
| disbursed_at | TIMESTAMP | NULL | Disbursement timestamp |
| disbursement_tx_hash | VARCHAR(64) | NULL | Stellar transaction hash |
| metadata | JSONB | DEFAULT '{}' | Additional application data |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Record update timestamp |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes:**
- `idx_applications_program` ON (program_id)
- `idx_applications_beneficiary` ON (beneficiary_id)
- `idx_applications_status` ON (status)
- `idx_applications_submitted` ON (submitted_at)
- `idx_applications_composite` ON (program_id, beneficiary_id)

**Constraints:**
- CHECK: `risk_score >= 0 AND risk_score <= 100`
- CHECK: `eligibility_score >= 0 AND eligibility_score <= 100`
- CHECK: `approved_amount IS NULL OR approved_amount > 0`
- UNIQUE (program_id, beneficiary_id) WHERE status != 'CANCELLED' AND deleted_at IS NULL

### 7. documents

Supporting documents for applications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique document identifier |
| application_id | UUID | FK(applications.id) | Associated application |
| document_type | VARCHAR(50) | NOT NULL | NATIONAL_ID, BIRTH_CERT, PROOF_OF_INCOME, etc. |
| file_name | VARCHAR(255) | NOT NULL | Original file name |
| file_url | VARCHAR(500) | NOT NULL | Storage URL or path |
| file_size | INTEGER | NOT NULL | File size in bytes |
| mime_type | VARCHAR(100) | NOT NULL | MIME type |
| is_verified | BOOLEAN | DEFAULT false | Manual verification status |
| ai_verification_score | DECIMAL(5,2) | NULL | AI authenticity score (0-100) |
| ai_verification_result | JSONB | NULL | Detailed AI analysis |
| verified_by | UUID | FK(users.id) | Staff who verified |
| verified_at | TIMESTAMP | NULL | Verification timestamp |
| metadata | JSONB | DEFAULT '{}' | Additional document data |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Record update timestamp |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes:**
- `idx_documents_application` ON (application_id)
- `idx_documents_type` ON (document_type)


### 8. wallets

Stellar wallet management for users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique wallet identifier |
| user_id | UUID | FK(users.id) | Wallet owner |
| public_key | VARCHAR(56) | UNIQUE, NOT NULL | Stellar public key (G...) |
| encrypted_secret_key | TEXT | NULL | Encrypted secret key (stored only if custodial) |
| wallet_type | ENUM | DEFAULT 'CUSTODIAL' | CUSTODIAL, NON_CUSTODIAL |
| is_primary | BOOLEAN | DEFAULT true | Primary wallet flag |
| label | VARCHAR(100) | NULL | User-defined wallet label |
| balance_xlm | DECIMAL(20,7) | DEFAULT 0 | XLM balance (cached) |
| balance_usdc | DECIMAL(20,7) | DEFAULT 0 | USDC balance (cached) |
| balances | JSONB | DEFAULT '{}' | All asset balances |
| last_synced_at | TIMESTAMP | NULL | Last blockchain sync |
| is_funded | BOOLEAN | DEFAULT false | Has minimum balance |
| status | ENUM | DEFAULT 'ACTIVE' | ACTIVE, SUSPENDED, CLOSED |
| metadata | JSONB | DEFAULT '{}' | Additional wallet data |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Record update timestamp |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes:**
- `idx_wallets_user` ON (user_id)
- `idx_wallets_public_key` ON (public_key)
- `idx_wallets_status` ON (status)

**Constraints:**
- UNIQUE (user_id, is_primary) WHERE is_primary = true AND deleted_at IS NULL

### 9. transactions

All payment transactions on Stellar network.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique transaction identifier |
| from_wallet_id | UUID | FK(wallets.id) | Source wallet |
| to_wallet_id | UUID | FK(wallets.id) | Destination wallet |
| program_id | UUID | FK(programs.id), NULL | Associated program |
| application_id | UUID | FK(applications.id), NULL | Associated application |
| transaction_type | ENUM | NOT NULL | DISBURSEMENT, PAYMENT, REFUND, TRANSFER |
| amount | DECIMAL(20,7) | NOT NULL | Transaction amount |
| asset_code | VARCHAR(12) | NOT NULL | Asset code (USDC, XLM, etc.) |
| asset_issuer | VARCHAR(56) | NULL | Asset issuer public key |
| fee | DECIMAL(20,7) | DEFAULT 0 | Transaction fee |
| memo | TEXT | NULL | Transaction memo |
| stellar_tx_hash | VARCHAR(64) | UNIQUE, NOT NULL | Stellar transaction hash |
| stellar_ledger | INTEGER | NULL | Ledger number |
| status | ENUM | DEFAULT 'PENDING' | PENDING, SUCCESS, FAILED |
| failure_reason | TEXT | NULL | Error message if failed |
| merchant_id | UUID | FK(merchants.id), NULL | Merchant for payments |
| metadata | JSONB | DEFAULT '{}' | Additional transaction data |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Record update timestamp |

**Indexes:**
- `idx_transactions_from_wallet` ON (from_wallet_id)
- `idx_transactions_to_wallet` ON (to_wallet_id)
- `idx_transactions_program` ON (program_id)
- `idx_transactions_application` ON (application_id)
- `idx_transactions_type` ON (transaction_type)
- `idx_transactions_status` ON (status)
- `idx_transactions_hash` ON (stellar_tx_hash)
- `idx_transactions_created` ON (created_at DESC)

**Constraints:**
- CHECK: `amount > 0`
- CHECK: `fee >= 0`


### 10. merchants

Businesses accepting payments from beneficiaries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique merchant identifier |
| user_id | UUID | FK(users.id), UNIQUE | Associated user account |
| business_name | VARCHAR(255) | NOT NULL | Legal business name |
| trade_name | VARCHAR(255) | NULL | DBA/trade name |
| registration_number | VARCHAR(100) | NULL | Business registration number |
| tax_id | VARCHAR(50) | NULL | Tax identification number (encrypted) |
| category | ENUM | NOT NULL | GROCERY, PHARMACY, RESTAURANT, RETAIL, EDUCATION, HEALTHCARE, TRANSPORTATION, OTHER |
| description | TEXT | NULL | Business description |
| logo_url | VARCHAR(500) | NULL | Business logo |
| address_line1 | VARCHAR(255) | NOT NULL | Street address |
| address_line2 | VARCHAR(255) | NULL | Additional address |
| barangay | VARCHAR(100) | NULL | Barangay name |
| city | VARCHAR(100) | NOT NULL | City/Municipality |
| province | VARCHAR(100) | NOT NULL | Province |
| region | VARCHAR(100) | NOT NULL | Region |
| postal_code | VARCHAR(20) | NULL | ZIP/Postal code |
| country | VARCHAR(2) | DEFAULT 'PH' | ISO country code |
| coordinates | POINT | NULL | GPS coordinates for map |
| contact_person | VARCHAR(100) | NULL | Contact person name |
| contact_phone | VARCHAR(20) | NULL | Business phone |
| contact_email | VARCHAR(255) | NULL | Business email |
| wallet_id | UUID | FK(wallets.id) | Payment wallet |
| qr_code_url | VARCHAR(500) | NULL | Static QR code |
| status | ENUM | DEFAULT 'PENDING' | PENDING, VERIFIED, ACTIVE, SUSPENDED, REJECTED |
| verified_at | TIMESTAMP | NULL | Verification timestamp |
| verified_by | UUID | FK(users.id) | Admin who verified |
| total_sales | DECIMAL(20,7) | DEFAULT 0 | Lifetime sales |
| total_transactions | INTEGER | DEFAULT 0 | Transaction count |
| metadata | JSONB | DEFAULT '{}' | Additional merchant data |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Record update timestamp |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes:**
- `idx_merchants_user` ON (user_id)
- `idx_merchants_category` ON (category)
- `idx_merchants_status` ON (status)
- `idx_merchants_location` ON (region, province, city)
- `idx_merchants_search` ON (business_name) USING gin(to_tsvector('english', business_name))

### 11. audit_logs

Complete audit trail of all system actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique log identifier |
| user_id | UUID | FK(users.id), NULL | User who performed action |
| action | VARCHAR(100) | NOT NULL | Action performed (CREATE, UPDATE, DELETE, LOGIN, etc.) |
| entity_type | VARCHAR(50) | NOT NULL | Entity affected (USER, PROGRAM, APPLICATION, etc.) |
| entity_id | UUID | NULL | ID of affected entity |
| changes | JSONB | NULL | Before/after values |
| ip_address | INET | NULL | Client IP address |
| user_agent | TEXT | NULL | Client user agent |
| request_id | UUID | NULL | Request correlation ID |
| status | VARCHAR(20) | NOT NULL | SUCCESS, FAILURE |
| error_message | TEXT | NULL | Error details if failed |
| metadata | JSONB | DEFAULT '{}' | Additional context |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |

**Indexes:**
- `idx_audit_logs_user` ON (user_id)
- `idx_audit_logs_entity` ON (entity_type, entity_id)
- `idx_audit_logs_created` ON (created_at DESC)
- `idx_audit_logs_action` ON (action)

**Partitioning:** Partition by month (created_at) for performance


### 12. ai_analyses

AI/ML analysis results for fraud detection and verification.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique analysis identifier |
| target_id | UUID | NOT NULL | ID of analyzed entity |
| target_type | VARCHAR(50) | NOT NULL | BENEFICIARY, APPLICATION, DOCUMENT, TRANSACTION |
| analysis_type | ENUM | NOT NULL | DUPLICATE_DETECTION, FRAUD_DETECTION, DOCUMENT_VERIFICATION, ANOMALY_DETECTION, ELIGIBILITY_PREDICTION |
| model_name | VARCHAR(100) | NOT NULL | AI model used |
| model_version | VARCHAR(20) | NOT NULL | Model version |
| score | DECIMAL(5,2) | NOT NULL | Confidence score (0-100) |
| result | VARCHAR(50) | NOT NULL | PASS, FAIL, REVIEW_REQUIRED |
| details | JSONB | NOT NULL | Detailed analysis results |
| explanation | TEXT | NULL | Human-readable explanation |
| flags | JSONB | DEFAULT '[]' | Warning flags |
| processing_time_ms | INTEGER | NULL | Processing duration |
| reviewed_by | UUID | FK(users.id), NULL | Human reviewer |
| review_decision | VARCHAR(50) | NULL | APPROVE, REJECT, OVERRIDE |
| reviewed_at | TIMESTAMP | NULL | Review timestamp |
| metadata | JSONB | DEFAULT '{}' | Additional analysis data |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |

**Indexes:**
- `idx_ai_analyses_target` ON (target_type, target_id)
- `idx_ai_analyses_type` ON (analysis_type)
- `idx_ai_analyses_result` ON (result)
- `idx_ai_analyses_created` ON (created_at DESC)

**Constraints:**
- CHECK: `score >= 0 AND score <= 100`

### 13. notifications

System notifications for users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique notification identifier |
| user_id | UUID | FK(users.id) | Recipient user |
| type | VARCHAR(50) | NOT NULL | APPLICATION_STATUS, DISBURSEMENT, PAYMENT_RECEIVED, etc. |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| link | VARCHAR(500) | NULL | Deep link to related entity |
| priority | ENUM | DEFAULT 'NORMAL' | LOW, NORMAL, HIGH, URGENT |
| channel | ENUM | DEFAULT 'IN_APP' | IN_APP, EMAIL, SMS, PUSH |
| is_read | BOOLEAN | DEFAULT false | Read status |
| read_at | TIMESTAMP | NULL | Read timestamp |
| sent_at | TIMESTAMP | NULL | Delivery timestamp |
| metadata | JSONB | DEFAULT '{}' | Additional notification data |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |

**Indexes:**
- `idx_notifications_user` ON (user_id)
- `idx_notifications_is_read` ON (is_read)
- `idx_notifications_created` ON (created_at DESC)
- `idx_notifications_composite` ON (user_id, is_read, created_at DESC)


### 14. sessions

User session management for JWT refresh tokens.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique session identifier |
| user_id | UUID | FK(users.id) | Session owner |
| refresh_token_hash | VARCHAR(255) | UNIQUE, NOT NULL | Hashed refresh token |
| device_info | JSONB | NULL | Device information |
| ip_address | INET | NULL | Client IP |
| user_agent | TEXT | NULL | Client user agent |
| expires_at | TIMESTAMP | NOT NULL | Session expiry |
| last_used_at | TIMESTAMP | DEFAULT NOW() | Last activity |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |

**Indexes:**
- `idx_sessions_user` ON (user_id)
- `idx_sessions_token` ON (refresh_token_hash)
- `idx_sessions_expires` ON (expires_at)

### 15. settings

System-wide and organization-specific settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique setting identifier |
| scope | ENUM | NOT NULL | SYSTEM, ORGANIZATION |
| scope_id | UUID | NULL | Organization ID if scope=ORGANIZATION |
| key | VARCHAR(100) | NOT NULL | Setting key |
| value | JSONB | NOT NULL | Setting value |
| description | TEXT | NULL | Setting description |
| is_encrypted | BOOLEAN | DEFAULT false | Encryption flag |
| updated_by | UUID | FK(users.id) | Last updater |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Record update timestamp |

**Indexes:**
- `idx_settings_scope` ON (scope, scope_id)
- `idx_settings_key` ON (key)

**Constraints:**
- UNIQUE (scope, scope_id, key)

---

## Indexes

### Performance Optimization Strategy

1. **Primary Indexes**: All foreign keys have indexes
2. **Composite Indexes**: Common query patterns (e.g., user + status)
3. **Full-Text Search**: GIN indexes on searchable text fields
4. **Partial Indexes**: Filter on common WHERE clauses
5. **Covering Indexes**: Include frequently selected columns

### Index Maintenance

- Analyze tables weekly
- Reindex monthly
- Monitor index usage and remove unused indexes
- Use EXPLAIN ANALYZE for query optimization


---

## Constraints

### Foreign Key Constraints

All foreign key relationships use `ON DELETE` behavior:

- **CASCADE**: Delete child records when parent is deleted
  - `organization_members.organization_id`
  - `applications.beneficiary_id`
  - `documents.application_id`
  
- **SET NULL**: Set to NULL when parent is deleted (preserve history)
  - `programs.created_by`
  - `applications.reviewed_by`
  - `audit_logs.user_id`

- **RESTRICT**: Prevent deletion if children exist
  - `programs.organization_id`
  - `transactions.from_wallet_id`
  - `transactions.to_wallet_id`

### Check Constraints

- **Positive amounts**: All monetary fields > 0
- **Valid dates**: End dates must be after start dates
- **Percentage scores**: 0-100 range for AI scores
- **Email format**: Valid email regex
- **Status transitions**: Valid state machine transitions

### Unique Constraints

- Composite unique constraints prevent duplicates
- Partial unique constraints (WHERE deleted_at IS NULL)
- Case-insensitive unique for emails

---

## Data Types

### Custom ENUM Types

```sql
-- User roles
CREATE TYPE user_role AS ENUM (
  'SUPER_ADMIN',
  'ORG_ADMIN', 
  'STAFF',
  'AUDITOR',
  'MERCHANT',
  'BENEFICIARY'
);

-- Organization types
CREATE TYPE organization_type AS ENUM (
  'GOVERNMENT',
  'NGO',
  'UNIVERSITY',
  'FOUNDATION',
  'DISASTER_RELIEF'
);

-- Program types
CREATE TYPE program_type AS ENUM (
  'SCHOLARSHIP',
  'MEDICAL',
  'DISASTER_RELIEF',
  'LIVELIHOOD',
  'SENIOR_CITIZEN',
  'PWD',
  'EMERGENCY_CASH',
  'EDUCATION_VOUCHER',
  'FARMER_SUBSIDY',
  'CASH_FOR_WORK'
);

-- Application statuses
CREATE TYPE application_status AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'DISBURSED',
  'CANCELLED'
);

-- Transaction types
CREATE TYPE transaction_type AS ENUM (
  'DISBURSEMENT',
  'PAYMENT',
  'REFUND',
  'TRANSFER'
);

-- Wallet types
CREATE TYPE wallet_type AS ENUM (
  'CUSTODIAL',
  'NON_CUSTODIAL'
);

-- AI analysis types
CREATE TYPE analysis_type AS ENUM (
  'DUPLICATE_DETECTION',
  'FRAUD_DETECTION',
  'DOCUMENT_VERIFICATION',
  'ANOMALY_DETECTION',
  'ELIGIBILITY_PREDICTION'
);
```

### JSONB Structures

**eligibility_criteria** (programs):
```json
{
  "age": {"min": 18, "max": 60},
  "location": ["NCR", "Region III"],
  "income": {"max": 50000},
  "employment_status": ["unemployed", "underemployed"],
  "custom_rules": []
}
```

**spending_restrictions** (programs):
```json
{
  "allowed_categories": ["GROCERY", "PHARMACY"],
  "daily_limit": 1000,
  "transaction_limit": 500,
  "blocked_merchants": []
}
```

**address** (organizations, beneficiaries):
```json
{
  "line1": "123 Main St",
  "line2": "Unit 4B",
  "barangay": "Poblacion",
  "city": "Manila",
  "province": "Metro Manila",
  "region": "NCR",
  "postal_code": "1000",
  "country": "PH"
}
```
