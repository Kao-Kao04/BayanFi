# BayanFi

**Transparent Public Money. Powered by Stellar.**

BayanFi is a production-ready, AI-powered public finance platform that enables governments, NGOs, universities, disaster relief organizations, and foundations to distribute financial assistance using the Stellar blockchain.

## 🌟 Vision

BayanFi is the operating system for public money. Instead of cash, paper forms, spreadsheets, and manual verification, organizations can distribute assistance digitally through Stellar with full transparency and fraud prevention.

## 🎯 Problems We Solve

- ⚡ Slow financial assistance distribution
- 🔄 Duplicate claims and ghost beneficiaries
- 🛡️ Fraud and lack of transparency
- 📋 Manual approval processes
- 👁️ No spending visibility
- 📊 Difficult auditing

## 🚀 Key Features

### For Organizations
- **Program Management**: Create and manage assistance programs (scholarships, medical aid, disaster relief, etc.)
- **Smart Distribution**: AI-powered eligibility verification and fraud detection
- **Real-time Tracking**: Monitor fund distribution and beneficiary spending
- **Audit Trail**: Complete blockchain-based transparency

### For Beneficiaries
- **Easy Application**: Simple application process with document upload
- **Digital Wallet**: Receive and manage funds via Stellar
- **QR Payments**: Spend funds at verified merchants
- **Real-time Updates**: Track application status and transaction history

### For Merchants
- **Accept Aid Payments**: Receive payments from beneficiaries
- **Instant Settlement**: Fast settlement via Stellar
- **Sales Dashboard**: Track revenue and transaction history

### AI-Powered Features
- 🤖 Duplicate beneficiary detection
- 🔍 Fraud pattern recognition
- 📄 Document verification
- 💬 Smart chatbot assistant
- 📈 Budget forecasting
- ⚠️ Spending anomaly detection

## 🏗️ Architecture

### Tech Stack

**Frontend**
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS + Shadcn UI
- Zustand (State Management)

**Backend**
- NestJS
- PostgreSQL
- Redis
- Prisma ORM
- Bull Queue

**Blockchain**
- Stellar SDK
- Soroban Smart Contracts
- Freighter Wallet Integration

**AI Services**
- Python FastAPI
- OpenAI GPT-4
- Ollama (Local LLM Support)
- TensorFlow (Document Verification)

**DevOps**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Nginx (Reverse Proxy)

## 📁 Project Structure

```
bayanfi/
├── apps/
│   ├── web/                 # Next.js frontend
│   ├── backend/             # NestJS API server
│   └── ai-service/          # Python AI/ML service
├── packages/
│   ├── stellar/             # Stellar SDK wrapper
│   ├── ui/                  # Shared UI components
│   └── types/               # Shared TypeScript types
├── contracts/               # Soroban smart contracts
├── docs/                    # Documentation
│   ├── requirements/        # SRS and specifications
│   ├── architecture/        # Architecture diagrams
│   ├── api/                 # API documentation
│   └── guides/              # User guides
└── infrastructure/          # Docker, K8s, deployment configs
```

## 🚦 Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose
- Stellar Account (Testnet)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/bayanfi.git
cd bayanfi
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up the database — Supabase (recommended, no local install)**

Create a free project at [supabase.com](https://supabase.com), then copy the
**direct** connection string (Project Settings → Database → URI, port **5432**,
Session mode) into `.env` as `DATABASE_URL`:
```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.<ref>.supabase.co:5432/postgres?sslmode=require"
```

> Prefer local Docker? Run `docker compose up -d postgres` instead and use the
> local `DATABASE_URL`. Redis is optional and not needed for the MVP.

5. **Run migrations and seed demo data**
```bash
npm run db:migrate
npm run db:seed
```

6. **Start development servers**
```bash
npm run dev
```

The services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- AI Service: http://localhost:8000
- API Docs: http://localhost:4000/api

## 🔐 Security

BayanFi implements enterprise-grade security:

- ✅ End-to-end encryption for sensitive data
- ✅ Role-based access control (RBAC)
- ✅ JWT + Refresh token authentication
- ✅ Rate limiting and DDoS protection
- ✅ Comprehensive audit logging
- ✅ OWASP Top 10 compliance
- ✅ Stellar wallet signature verification
- ✅ Multi-signature support for high-value transactions

## 🌍 Use Cases

1. **Government Social Programs**: Distribute cash transfers, scholarships, and subsidies
2. **Disaster Relief**: Emergency fund distribution with instant deployment
3. **NGO Aid Programs**: Transparent humanitarian assistance
4. **University Scholarships**: Automated scholarship disbursement and tracking
5. **Local Government**: Barangay-level assistance programs
6. **Healthcare Assistance**: Medical aid and insurance support

## 🎨 Design Philosophy

- **Modern Government SaaS**: Professional, trustworthy interface
- **Accessibility First**: WCAG 2.1 AA compliant
- **Mobile Responsive**: Works on all devices
- **Dark Mode**: Reduce eye strain
- **Glassmorphism**: Modern, clean aesthetic

## 📊 Why Stellar?

1. **Fast & Low-Cost**: 3-5 second finality, minimal fees
2. **Built for Payments**: Native asset support, anchors, and compliance
3. **Financial Inclusion**: Accessible to unbanked populations
4. **Transparency**: All transactions on public ledger
5. **Programmable**: Soroban smart contracts for complex logic
6. **Regulatory Friendly**: Designed with compliance in mind

## 🗺️ Roadmap

### Phase 1: MVP (Current)
- ✅ Core authentication and RBAC
- ✅ Organization and program management
- ✅ Beneficiary application and wallet
- ✅ Stellar payment integration
- ✅ Basic AI fraud detection
- ✅ Merchant system
- ✅ Public transparency dashboard

### Phase 2: Enhanced AI
- 🔄 Advanced document verification
- 🔄 Predictive analytics for fraud
- 🔄 Budget optimization AI
- 🔄 Multi-language support

### Phase 3: Scale
- 🔄 Mobile apps (iOS & Android)
- 🔄 Advanced Soroban contracts
- 🔄 Multi-chain support
- 🔄 API marketplace for integrations

### Phase 4: Ecosystem
- 🔄 Partner with Stellar anchors
- 🔄 Government partnerships
- 🔄 Regional expansion (APAC → Global)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🏆 Stellar APAC Hackathon

BayanFi is built for the Stellar APAC Hackathon with a focus on:
- Real financial utility for underserved populations
- Production-quality architecture and code
- Meaningful blockchain integration (not blockchain for blockchain's sake)
- Scalability to serve millions of users
- Beautiful, intuitive user experience

## 📞 Contact

- Website: https://bayanfi.io
- Email: hello@bayanfi.io
- Twitter: @bayanfi
- Discord: [Join our community](https://discord.gg/bayanfi)

---

**Built with ❤️ for financial inclusion and transparency**
