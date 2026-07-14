import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Zap,
  Eye,
  Brain,
  Users,
  Wallet,
  QrCode,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  { icon: Brain, title: 'AI Fraud Detection', desc: 'Duplicate detection, document verification, and spending anomaly analysis flag risk before funds move.' },
  { icon: Zap, title: 'Instant Disbursement', desc: 'Approved aid reaches beneficiaries in 3-5 seconds on Stellar, at a fraction of a cent per transfer.' },
  { icon: Eye, title: 'Public Transparency', desc: 'Every peso is traceable on-chain. Citizens and auditors can verify distribution independently.' },
  { icon: Wallet, title: 'Digital Wallets', desc: 'Beneficiaries receive a Stellar wallet automatically — no bank account required.' },
  { icon: QrCode, title: 'QR Payments', desc: 'Spend aid at verified merchants with a simple QR scan, with on-chain settlement.' },
  { icon: TrendingUp, title: 'Budget Forecasting', desc: 'AI predicts future fund requirements so programs never run dry unexpectedly.' },
];

const stats = [
  { value: '3-5s', label: 'Settlement time' },
  { value: '<$0.01', label: 'Per transaction' },
  { value: '100%', label: 'On-chain traceable' },
  { value: '24/7', label: 'AI assistant' },
];

const audiences = [
  'Government Agencies', 'Barangays & LGUs', 'NGOs', 'Universities',
  'Disaster Relief', 'Foundations', 'Farmers & PWD', 'Local Merchants',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 aurora" />
        <div className="pointer-events-none absolute inset-0 grid-overlay opacity-60" />
        {/* Floating gradient orbs */}
        <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -right-16 top-40 h-72 w-72 rounded-full bg-accent/20 blur-3xl animate-float delay-300" />

        <div className="container relative py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex animate-fade-in-up items-center gap-2 rounded-full border border-primary/20 bg-background/60 px-4 py-1.5 text-sm shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Built for the Stellar APAC Hackathon
            </div>
            <div className="mb-6 flex animate-fade-in-up justify-center">
              <Image
                src="/icon.png"
                alt="BayanFi"
                width={96}
                height={96}
                className="h-24 w-24 object-contain drop-shadow-2xl animate-float"
                priority
              />
            </div>
            <h1 className="animate-fade-in-up delay-100 text-4xl font-bold tracking-tight sm:text-6xl">
              Transparent Public Money.
              <br />
              <span className="gradient-text animate-gradient">Powered by Stellar.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl animate-fade-in-up delay-200 text-lg text-muted-foreground">
              BayanFi is the operating system for public money. Distribute financial assistance
              digitally, prevent fraud with AI, and give every citizen proof of where funds go.
            </p>
            <div className="mt-8 flex animate-fade-in-up flex-col items-center justify-center gap-3 delay-300 sm:flex-row">
              <Button size="lg" variant="gradient" asChild>
                <Link href="/register">
                  Start distributing aid <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/transparency">View live transparency</Link>
              </Button>
            </div>
          </div>

          {/* Stat band */}
          <div className="mx-auto mt-16 grid max-w-4xl animate-fade-in-up grid-cols-2 gap-4 delay-500 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="glass-card card-hover p-6 text-center">
                <div className="text-3xl font-bold gradient-text">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">The end of cash, paper forms, and ghost beneficiaries</h2>
          <p className="mt-4 text-muted-foreground">
            Traditional aid distribution is slow, opaque, and vulnerable to fraud. BayanFi replaces
            spreadsheets and manual verification with programmable, transparent money.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
          {[
            'Eliminate duplicate claims & ghost beneficiaries',
            'Cut distribution costs by 60-80%',
            'Instant emergency disaster relief',
            'Immutable, auditable transaction trails',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-xl border p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Everything a public finance program needs</h2>
          <p className="mt-4 text-muted-foreground">
            Meaningful AI and blockchain — not buzzwords. Each feature answers: why is Stellar essential?
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="glass-card card-hover glow-border group">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 ring-1 ring-inset ring-primary/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Stellar */}
      <section id="stellar" className="container py-20">
        <Card className="glass-card overflow-hidden">
          <CardContent className="grid gap-8 p-10 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-bold">Why Stellar is essential</h2>
              <p className="mt-4 text-muted-foreground">
                Public money demands trust that a private database cannot provide. Stellar gives
                BayanFi properties no centralized system can match.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Immutable, publicly verifiable proof of every disbursement',
                  'Native multi-signature for high-value approvals',
                  'Soroban escrow enforces budget caps at the protocol level',
                  'Financial inclusion for the unbanked via stablecoins & anchors',
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border bg-muted/30 p-6">
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-muted-foreground">Asset</span>
                  <span className="font-mono">USDC / XLM</span>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-muted-foreground">Finality</span>
                  <span className="font-mono">3-5 seconds</span>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="font-mono">~0.00001 XLM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Verification</span>
                  <span className="font-mono">Public ledger</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Audiences */}
      <section id="how" className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Built for everyone in the aid chain</h2>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {audiences.map((a) => (
            <div key={a} className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
              <Users className="h-4 w-4 text-primary" />
              {a}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="gradient-bg animate-gradient relative overflow-hidden rounded-3xl p-12 text-center text-white shadow-2xl shadow-primary/30">
          <div className="pointer-events-none absolute inset-0 grid-overlay opacity-20" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold">Ready to modernize public finance?</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/90">
              Join governments, NGOs, and foundations building a transparent future for financial
              assistance across Southeast Asia.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">Create an account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-10">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2026 BayanFi. Transparent Public Money. Powered by Stellar.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/transparency">Transparency</Link>
            <Link href="/login">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
