# Software Requirements Specification (SRS)
# BayanFi - Transparent Public Money Platform

**Version:** 1.0  
**Date:** July 11, 2026  
**Project:** BayanFi  
**Status:** Draft for Stellar APAC Hackathon

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Data Requirements](#6-data-requirements)
7. [Appendices](#7-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a complete description of the BayanFi platform - an AI-powered public finance system built on the Stellar blockchain. This document is intended for:

- Development team members
- Project stakeholders
- Government and NGO partners
- Stellar APAC Hackathon judges
- Future contributors and maintainers

### 1.2 Scope

**Product Name:** BayanFi  
**Tagline:** "Transparent Public Money. Powered by Stellar"

**Product Overview:**

BayanFi is a production-ready platform that enables governments, NGOs, universities, disaster relief organizations, and foundations to distribute financial assistance digitally using blockchain technology. The system provides:

- Digital program creation and management
- Automated beneficiary verification using AI
- Blockchain-based fund distribution via Stellar
- Real-time transparency and audit capabilities
- Fraud detection and duplicate claim prevention

- Merchant payment acceptance
- AI-powered chatbot assistance

**Benefits:**

- Eliminate ghost beneficiaries and duplicate claims
- Reduce distribution costs by 60-80%
- Provide real-time tracking and transparency
- Enable instant disaster relief deployment
- Create immutable audit trails
- Improve financial inclusion for unbanked populations

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| **BayanFi** | "Bayan" (Filipino: nation/community) + "Fi" (Finance) |
| **Stellar** | Blockchain network optimized for payments and asset transfers |
| **Soroban** | Smart contract platform on Stellar |
| **XLM** | Native cryptocurrency of Stellar (Lumens) |
| **USDC** | USD Coin stablecoin |
| **Anchor** | Entity that bridges traditional and blockchain currencies |
| **Beneficiary** | Individual receiving financial assistance |
| **Program** | Assistance initiative (e.g., scholarship, disaster relief) |
| **Organization** | Entity distributing funds (government, NGO, etc.) |
| **Merchant** | Business accepting payments from beneficiaries |
| **LGU** | Local Government Unit |
| **Barangay** | Smallest administrative division in Philippines |
| **PWD** | Person with Disability |
| **RBAC** | Role-Based Access Control |
| **KYC** | Know Your Customer |
| **AML** | Anti-Money Laundering |
| **WCAG** | Web Content Accessibility Guidelines |


### 1.4 References

- Stellar Documentation: https://developers.stellar.org/
- Soroban Documentation: https://soroban.stellar.org/
- Stellar APAC Hackathon Guidelines
- OWASP Security Guidelines
- WCAG 2.1 Accessibility Standards
- PCI DSS Compliance Framework

### 1.5 Overview

The remainder of this document provides detailed requirements for BayanFi, organized as follows:

- **Section 2**: High-level system description and user characteristics
- **Section 3**: Detailed functional requirements by module
- **Section 4**: Interface requirements (UI, API, blockchain)
- **Section 5**: Non-functional requirements (performance, security, etc.)
- **Section 6**: Data models and database requirements
- **Section 7**: Appendices with use cases and user stories

---

## 2. Overall Description

### 2.1 Product Perspective

BayanFi operates as a standalone web-based platform that integrates with:

1. **Stellar Blockchain**: For decentralized payments and transparency
2. **AI Services**: For fraud detection, document verification, and chatbot
3. **External Wallets**: Freighter, LOBSTR, and other Stellar wallets
4. **Traditional Infrastructure**: PostgreSQL, Redis, cloud storage

The system architecture consists of:
- Next.js frontend (web application)
- NestJS backend (REST + WebSocket API)
- Python FastAPI (AI/ML services)
- PostgreSQL (relational data)
- Redis (caching and queues)
- Stellar Network (payments and transparency)


### 2.2 Product Functions

The major functions of BayanFi include:

1. **Authentication & Authorization**
   - Multi-role user management (6 roles)
   - Secure login with JWT tokens
   - Stellar wallet integration
   - Identity verification

2. **Organization Management**
   - Organization registration and verification
   - Multi-organization support
   - Staff management
   - Budget allocation

3. **Program Management**
   - Create assistance programs
   - Define eligibility criteria
   - Set spending restrictions
   - Configure approval workflows
   - Monitor program performance

4. **Beneficiary Management**
   - Application submission
   - Document upload and verification
   - Application tracking
   - Wallet creation
   - Fund receipt and management
   - QR payment functionality

5. **AI-Powered Features**
   - Duplicate beneficiary detection
   - Fraud pattern recognition
   - Document authenticity verification
   - Spending anomaly detection
   - Eligibility assistant
   - Conversational chatbot
   - Budget forecasting

6. **Merchant System**
   - Merchant registration and verification
   - Payment acceptance via QR codes
   - Transaction history
   - Settlement tracking
   - Sales analytics


7. **Blockchain Integration**
   - Stellar wallet management
   - Asset issuance (program-specific tokens)
   - Payment processing
   - Multi-signature support
   - Transaction verification
   - Smart contract deployment (Soroban)

8. **Transparency & Reporting**
   - Public transparency dashboard
   - Real-time fund tracking
   - Geographic distribution visualization
   - Program statistics
   - Audit trail access

9. **Disaster Relief Mode**
   - Rapid emergency fund deployment
   - Geographic targeting
   - Instant beneficiary selection
   - Priority processing

10. **Audit & Compliance**
    - Complete transaction history
    - Anomaly flagging
    - Report generation
    - Blockchain verification
    - Compliance monitoring

### 2.3 User Classes and Characteristics

| User Class | Technical Expertise | Primary Goals | Frequency of Use |
|------------|-------------------|---------------|------------------|
| **Super Admin** | High | Platform management, system configuration | Daily |
| **Organization Admin** | Medium | Program creation, budget management | Daily |
| **Staff** | Medium | Application review, beneficiary support | Daily |
| **Auditor** | High | Transaction review, compliance monitoring | Weekly |
| **Beneficiary** | Low | Apply for aid, receive funds, make payments | Variable |
| **Merchant** | Low | Accept payments, track sales | Daily |


### 2.4 Operating Environment

**Client-Side:**
- Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Mobile browsers (iOS Safari 14+, Chrome Mobile 90+)
- Minimum screen resolution: 320px width (mobile-first)
- JavaScript enabled
- Stellar wallet extension (optional but recommended)

**Server-Side:**
- Node.js 20+ runtime
- Python 3.11+ runtime
- PostgreSQL 15+ database
- Redis 7+ cache
- Docker container environment (production)
- Linux-based servers (Ubuntu 22.04 LTS recommended)

**Network:**
- HTTPS connection required
- Stellar Testnet (development) / Mainnet (production)
- Soroban RPC endpoint access
- Minimum 1 Mbps internet connection

**Third-Party Services:**
- Stellar Horizon API
- Soroban RPC
- OpenAI API (or Ollama for local AI)
- Email service (SendGrid, AWS SES, or SMTP)
- SMS service (Twilio or equivalent)
- Cloud storage (AWS S3 or equivalent)

### 2.5 Design and Implementation Constraints

**Technical Constraints:**
- Must integrate with Stellar blockchain
- Must support Soroban smart contracts
- Must maintain compatibility with Freighter wallet
- Must comply with WCAG 2.1 AA accessibility standards
- Must implement end-to-end encryption for sensitive data
- Must support offline wallet creation for beneficiaries


**Regulatory Constraints:**
- Must comply with local data protection laws (Philippines Data Privacy Act)
- Must support KYC/AML requirements
- Must maintain audit trails for government oversight
- Must not store unencrypted personally identifiable information (PII)

**Business Constraints:**
- MVP must be completed within hackathon timeline
- Must demonstrate real-world utility for Stellar APAC Hackathon
- Must be production-ready, not a proof-of-concept
- Must scale to support thousands of concurrent users

**Security Constraints:**
- Must follow OWASP Top 10 security guidelines
- Must implement rate limiting to prevent abuse
- Must use secure key management for Stellar accounts
- Must encrypt data in transit and at rest
- Must implement multi-factor authentication for administrative roles

### 2.6 Assumptions and Dependencies

**Assumptions:**
- Users have basic internet literacy
- Organizations have stable internet connectivity
- Beneficiaries can access smartphones or computers
- Stellar network maintains >99.9% uptime
- OpenAI API remains accessible (or Ollama is deployed locally)
- Target regions have adequate mobile network coverage

**Dependencies:**
- Stellar blockchain network availability
- Horizon API uptime and performance
- Soroban RPC service availability
- Third-party authentication services
- Email/SMS delivery services
- Cloud infrastructure providers
- AI model API access


---

## 3. System Features

### 3.1 Authentication and Authorization

**Priority:** Critical  
**Description:** Secure user authentication with role-based access control supporting 6 distinct user roles.

**Functional Requirements:**

**FR-AUTH-001:** The system shall support email/password authentication with bcrypt hashing (minimum 10 rounds).

**FR-AUTH-002:** The system shall implement JWT-based token authentication with 15-minute access token expiry and 7-day refresh token validity.

**FR-AUTH-003:** The system shall support Stellar wallet-based authentication using public key signatures.

**FR-AUTH-004:** The system shall implement Role-Based Access Control (RBAC) with the following roles:
- Super Admin: Full system access
- Organization Admin: Organization and program management
- Staff: Application review and beneficiary support
- Auditor: Read-only access to transactions and reports
- Merchant: Payment acceptance and sales tracking
- Beneficiary: Application submission and fund management

**FR-AUTH-005:** The system shall enforce multi-factor authentication (MFA) for Super Admin and Organization Admin roles.

**FR-AUTH-006:** The system shall implement account lockout after 5 failed login attempts within 15 minutes.

**FR-AUTH-007:** The system shall maintain comprehensive audit logs of all authentication events.

**FR-AUTH-008:** The system shall support password reset via email with time-limited tokens (valid for 1 hour).


### 3.2 Organization Management

**FR-ORG-001:** Organizations shall register with name, type, registration number, and contact details.  
**FR-ORG-002:** System shall verify organization legitimacy before approval.  
**FR-ORG-003:** Organizations shall manage multiple staff members with role assignments.  
**FR-ORG-004:** Organizations shall create and fund multiple assistance programs.  
**FR-ORG-005:** Organizations shall view real-time budget allocation and spending.

### 3.3 Program Management

**FR-PROG-001:** Organizations shall create programs with name, type, budget, dates, and eligibility criteria.  
**FR-PROG-002:** Programs shall support types: Scholarship, Medical, Disaster Relief, Livelihood, Senior Citizen, PWD, Emergency Cash.  
**FR-PROG-003:** Programs shall define maximum amount per beneficiary.  
**FR-PROG-004:** Programs shall configure spending restrictions (merchant categories, daily limits).  
**FR-PROG-005:** Programs shall implement approval workflows (automatic, single-approval, multi-approval).  
**FR-PROG-006:** Programs shall generate unique Stellar funding addresses.  
**FR-PROG-007:** Programs shall track distributed vs remaining funds in real-time.

### 3.4 Beneficiary Management

**FR-BEN-001:** Beneficiaries shall browse available programs by category and location.  
**FR-BEN-002:** Beneficiaries shall submit applications with required documents.  
**FR-BEN-003:** System shall validate eligibility against program criteria.  
**FR-BEN-004:** Beneficiaries shall track application status (pending, under review, approved, rejected, disbursed).  
**FR-BEN-005:** Approved beneficiaries shall receive Stellar wallet automatically.  
**FR-BEN-006:** Beneficiaries shall receive funds directly to their wallet.  
**FR-BEN-007:** Beneficiaries shall generate QR codes for merchant payments.  
**FR-BEN-008:** Beneficiaries shall view complete transaction history.  
**FR-BEN-009:** Beneficiaries shall download digital receipts.  
**FR-BEN-010:** Beneficiaries shall receive notifications for status changes.


### 3.5 AI-Powered Features

**FR-AI-001:** System shall detect duplicate beneficiaries using name, birthdate, and biometric similarity (>90% confidence threshold).  
**FR-AI-002:** System shall flag fraudulent documents using image analysis and metadata inspection.  
**FR-AI-003:** System shall detect spending anomalies (unusual transaction patterns, velocity, amounts).  
**FR-AI-004:** System shall provide eligibility prediction based on beneficiary profile.  
**FR-AI-005:** System shall implement chatbot for answering beneficiary questions 24/7.  
**FR-AI-006:** Chatbot shall answer queries about: eligibility, requirements, status, fund usage.  
**FR-AI-007:** System shall forecast future budget requirements using historical data.  
**FR-AI-008:** System shall flag applications requiring manual review based on risk scores.  
**FR-AI-009:** All AI decisions shall be explainable with confidence scores.

### 3.6 Merchant System

**FR-MERCH-001:** Merchants shall register with business name, registration, address, category.  
**FR-MERCH-002:** System shall verify merchant legitimacy before approval.  
**FR-MERCH-003:** Merchants shall generate static QR codes for payment acceptance.  
**FR-MERCH-004:** Merchants shall generate dynamic QR codes with pre-filled amounts.  
**FR-MERCH-005:** Merchants shall receive real-time payment notifications.  
**FR-MERCH-006:** Merchants shall view daily/weekly/monthly sales analytics.  
**FR-MERCH-007:** Merchants shall export transaction reports in CSV format.  
**FR-MERCH-008:** Merchants shall initiate refunds for eligible transactions.  
**FR-MERCH-009:** System shall settle merchant payments within 24 hours.

### 3.7 Blockchain Integration (Stellar)

**FR-BLOCK-001:** System shall connect to Stellar Testnet (dev) and Mainnet (production).  
**FR-BLOCK-002:** System shall create and manage Stellar keypairs securely.  
**FR-BLOCK-003:** System shall issue custom assets for specific programs.  
**FR-BLOCK-004:** System shall support USDC and XLM as payment assets.  
**FR-BLOCK-005:** System shall process payments with 3-5 second confirmation.  
**FR-BLOCK-006:** System shall implement multi-signature for transactions >$1000.  
**FR-BLOCK-007:** System shall store transaction hashes for verification.  
**FR-BLOCK-008:** System shall provide blockchain explorers links for transparency.  
**FR-BLOCK-009:** System shall deploy Soroban smart contracts for escrow logic.  
**FR-BLOCK-010:** System shall monitor Stellar account balances in real-time.


### 3.8 Transparency Dashboard

**FR-TRANS-001:** Public dashboard shall display all active programs without authentication.  
**FR-TRANS-002:** Dashboard shall show total budget, distributed funds, remaining funds per program.  
**FR-TRANS-003:** Dashboard shall display number of beneficiaries served.  
**FR-TRANS-004:** Dashboard shall show daily transaction volume and count.  
**FR-TRANS-005:** Dashboard shall provide geographic distribution heat map.  
**FR-TRANS-006:** Dashboard shall update in real-time using WebSocket connections.  
**FR-TRANS-007:** Dashboard shall NOT expose personally identifiable information.  
**FR-TRANS-008:** Dashboard shall provide links to Stellar blockchain verification.  
**FR-TRANS-009:** Dashboard shall support filtering by organization, program type, date range.

### 3.9 Auditor Dashboard

**FR-AUDIT-001:** Auditors shall search transactions by date, amount, program, beneficiary.  
**FR-AUDIT-002:** Auditors shall flag suspicious transactions for investigation.  
**FR-AUDIT-003:** Auditors shall export comprehensive reports in PDF and Excel formats.  
**FR-AUDIT-004:** Auditors shall view complete audit trails for all system actions.  
**FR-AUDIT-005:** Auditors shall verify transactions directly on Stellar blockchain.  
**FR-AUDIT-006:** Auditors shall access AI fraud detection logs and scores.  
**FR-AUDIT-007:** Auditors shall generate compliance reports for regulatory requirements.

### 3.10 Disaster Relief Mode

**FR-DISASTER-001:** System shall support "Emergency Release" for rapid fund deployment.  
**FR-DISASTER-002:** Authorized users shall select target region using map interface.  
**FR-DISASTER-003:** System shall distribute fixed amount to all residents in selected area.  
**FR-DISASTER-004:** Emergency funds shall bypass standard approval workflows.  
**FR-DISASTER-005:** System shall prioritize emergency transactions on Stellar network.  
**FR-DISASTER-006:** System shall send SMS notifications to all affected beneficiaries.  
**FR-DISASTER-007:** Emergency mode shall maintain full audit trail and transparency.


---

## 4. External Interface Requirements

### 4.1 User Interfaces

**UI-001:** Application shall implement responsive design supporting devices from 320px to 4K resolution.  
**UI-002:** Application shall follow Material Design / Shadcn UI component library.  
**UI-003:** Application shall support light and dark themes with system preference detection.  
**UI-004:** Application shall meet WCAG 2.1 AA accessibility standards.  
**UI-005:** Application shall support keyboard navigation for all interactive elements.  
**UI-006:** Application shall provide clear loading states and progress indicators.  
**UI-007:** Application shall display meaningful error messages with recovery suggestions.  
**UI-008:** Application shall implement glassmorphism design with professional aesthetics.

### 4.2 Hardware Interfaces

**HW-001:** Application shall support QR code scanning via device camera.  
**HW-002:** Application shall support biometric authentication (fingerprint, Face ID) where available.  
**HW-003:** Application shall function on devices with minimum 2GB RAM.

### 4.3 Software Interfaces

**Stellar Horizon API:**
- Protocol: HTTPS/REST
- Data Format: JSON
- Purpose: Submit transactions, query accounts, stream events
- Endpoint: https://horizon-testnet.stellar.org (testnet)

**Soroban RPC:**
- Protocol: HTTPS/JSON-RPC
- Purpose: Deploy and invoke smart contracts
- Endpoint: https://soroban-testnet.stellar.org

**OpenAI API:**
- Protocol: HTTPS/REST
- Models: GPT-4 Turbo, text-embedding-3-small
- Purpose: AI fraud detection, chatbot, document analysis

**PostgreSQL Database:**
- Version: 15+
- Protocol: TCP/IP
- Purpose: Persistent data storage

**Redis:**
- Version: 7+
- Protocol: RESP
- Purpose: Caching, session storage, job queues


### 4.4 Communication Interfaces

**HTTP/HTTPS:**
- TLS 1.3 encryption for all communications
- RESTful API following OpenAPI 3.0 specification
- JSON data format for requests and responses

**WebSocket:**
- Secure WebSocket (wss://) for real-time updates
- Used for: transaction notifications, dashboard updates, chat

**Email:**
- SMTP/API integration (SendGrid preferred)
- Used for: verification, notifications, password reset

**SMS:**
- API integration (Twilio preferred)
- Used for: OTP verification, emergency alerts

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

**NFR-PERF-001:** API response time shall be <500ms for 95th percentile under normal load.  
**NFR-PERF-002:** Stellar transactions shall confirm within 5-7 seconds.  
**NFR-PERF-003:** System shall support 1000 concurrent users without degradation.  
**NFR-PERF-004:** Database queries shall execute in <100ms for 99th percentile.  
**NFR-PERF-005:** Frontend pages shall achieve Lighthouse score >90 for performance.  
**NFR-PERF-006:** AI fraud detection shall process applications in <3 seconds.  
**NFR-PERF-007:** System shall support 10,000 transactions per day.  
**NFR-PERF-008:** Dashboard shall load in <2 seconds on 4G connection.

### 5.2 Security Requirements

**NFR-SEC-001:** All passwords shall be hashed using bcrypt with minimum 10 rounds.  
**NFR-SEC-002:** All sensitive data shall be encrypted at rest using AES-256.  
**NFR-SEC-003:** All communications shall use TLS 1.3 encryption.  
**NFR-SEC-004:** System shall implement rate limiting: 100 requests per 15 minutes per IP.  
**NFR-SEC-005:** System shall validate and sanitize all user inputs against XSS and SQL injection.  
**NFR-SEC-006:** System shall implement CORS policies restricting unauthorized domains.  
**NFR-SEC-007:** Stellar private keys shall be stored in hardware security modules (HSM) or encrypted key stores.  
**NFR-SEC-008:** System shall log all security events (failed logins, permission changes).  
**NFR-SEC-009:** System shall implement Content Security Policy (CSP) headers.  
**NFR-SEC-010:** System shall conduct automated security scans in CI/CD pipeline.


### 5.3 Reliability Requirements

**NFR-REL-001:** System shall maintain 99.9% uptime (excluding planned maintenance).  
**NFR-REL-002:** System shall implement automatic failover for database and cache.  
**NFR-REL-003:** System shall gracefully handle Stellar network disruptions with queuing.  
**NFR-REL-004:** System shall perform daily automated backups retained for 30 days.  
**NFR-REL-005:** System shall recover from crashes within 5 minutes (auto-restart).  
**NFR-REL-006:** System shall implement circuit breakers for external API calls.

### 5.4 Availability Requirements

**NFR-AVAIL-001:** System shall be available 24/7 with maintenance windows <2 hours monthly.  
**NFR-AVAIL-002:** System shall provide status page for monitoring uptime.  
**NFR-AVAIL-003:** System shall support horizontal scaling for increased load.  
**NFR-AVAIL-004:** System shall implement health check endpoints for load balancers.

### 5.5 Maintainability Requirements

**NFR-MAINT-001:** Code shall maintain >80% test coverage.  
**NFR-MAINT-002:** All code shall follow TypeScript/Python linting standards.  
**NFR-MAINT-003:** All functions shall include JSDoc/docstring documentation.  
**NFR-MAINT-004:** System shall use semantic versioning for releases.  
**NFR-MAINT-005:** System shall implement structured logging with correlation IDs.  
**NFR-MAINT-006:** System shall provide comprehensive API documentation using Swagger/OpenAPI.

### 5.6 Portability Requirements

**NFR-PORT-001:** System shall run in Docker containers for environment consistency.  
**NFR-PORT-002:** System shall support deployment on AWS, GCP, Azure, or on-premise.  
**NFR-PORT-003:** System shall use environment variables for configuration.  
**NFR-PORT-004:** Database migrations shall be reversible and version-controlled.


### 5.7 Scalability Requirements

**NFR-SCALE-001:** System shall scale to 100,000 registered beneficiaries.  
**NFR-SCALE-002:** System shall scale to 1,000 concurrent merchants.  
**NFR-SCALE-003:** System shall scale to 100 organizations with 10,000 programs.  
**NFR-SCALE-004:** System shall process 50,000 transactions daily at peak.  
**NFR-SCALE-005:** Database shall support sharding for horizontal scaling.

### 5.8 Usability Requirements

**NFR-USABILITY-001:** New beneficiaries shall complete registration in <10 minutes.  
**NFR-USABILITY-002:** Application submission shall require <15 minutes.  
**NFR-USABILITY-003:** System shall support English, Filipino, and Tagalog languages.  
**NFR-USABILITY-004:** Error messages shall be user-friendly, not technical.  
**NFR-USABILITY-005:** System shall provide contextual help and tooltips.  
**NFR-USABILITY-006:** Merchants shall complete payment acceptance in <30 seconds.

---

## 6. Data Requirements

### 6.1 Logical Data Model

**Core Entities:**

1. **User**: id, email, password_hash, role, stellar_public_key, created_at, updated_at
2. **Organization**: id, name, type, registration_number, status, verified_at
3. **Program**: id, organization_id, name, type, budget, distributed, start_date, end_date
4. **Application**: id, program_id, beneficiary_id, status, documents, risk_score, submitted_at
5. **Beneficiary**: id, user_id, full_name, date_of_birth, national_id, phone, address
6. **Wallet**: id, user_id, public_key, encrypted_secret_key, balance, created_at
7. **Transaction**: id, from_wallet, to_wallet, amount, asset, tx_hash, status, created_at
8. **Merchant**: id, user_id, business_name, registration, category, verified_at
9. **AuditLog**: id, user_id, action, entity_type, entity_id, changes, ip_address, timestamp
10. **AIAnalysis**: id, target_id, target_type, analysis_type, score, details, created_at


### 6.2 Data Retention

**DR-001:** Transaction records shall be retained permanently for audit compliance.  
**DR-002:** Audit logs shall be retained for minimum 7 years per regulatory requirements.  
**DR-003:** User documents shall be retained for duration of program + 2 years.  
**DR-004:** Session data shall be retained for 7 days maximum.  
**DR-005:** AI analysis results shall be retained for 5 years.  
**DR-006:** Deleted user accounts shall be anonymized, not permanently deleted.

### 6.3 Data Backup

**DB-001:** Database shall be backed up daily at 2:00 AM UTC.  
**DB-002:** Backups shall be encrypted and stored in geographically separate location.  
**DB-003:** Backup restoration shall be tested monthly.  
**DB-004:** Point-in-time recovery shall be supported for last 30 days.

### 6.4 Data Privacy

**DP-001:** Personal data shall be encrypted at rest using AES-256.  
**DP-002:** System shall implement data minimization principles.  
**DP-003:** Users shall have right to access their personal data.  
**DP-004:** Users shall have right to request data deletion (with retention exceptions).  
**DP-005:** System shall log all access to personally identifiable information.  
**DP-006:** Data transfers shall comply with cross-border data protection regulations.

---

## 7. Appendices

### Appendix A: Glossary

Additional terms and definitions not covered in Section 1.3.

### Appendix B: Analysis Models

Detailed use cases, user stories, and UML diagrams are provided in separate documents:
- `/docs/requirements/use-cases.md`
- `/docs/requirements/user-stories.md`
- `/docs/architecture/diagrams/`

### Appendix C: To Be Determined List

1. Specific KYC provider integration
2. Production AI model fine-tuning approach
3. Mobile app specifications (future phase)
4. International expansion requirements

---

**Document Status:** DRAFT  
**Last Updated:** July 11, 2026  
**Next Review:** Post-hackathon feedback incorporation
