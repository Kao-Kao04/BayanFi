'use client';

import { Wallet, Users, Building2, Activity, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import { Navbar } from '@/components/layout/navbar';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatAmount, formatNumber, utilization } from '@/lib/utils';
import {
  usePublicStats,
  usePublicPrograms,
  useDailyTransactions,
  useDistributionMap,
} from '@/lib/api/queries';

export default function TransparencyPage() {
  const { data: stats } = usePublicStats();
  const { data: programs } = usePublicPrograms();
  const { data: daily } = useDailyTransactions();
  const { data: regions } = useDistributionMap();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-12">
        <div className="mb-8">
          <Badge variant="success" className="mb-3">
            Live · On-chain verified
          </Badge>
          <h1 className="text-3xl font-bold">Public Transparency Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Real-time view of public fund distribution. No personal information is ever exposed —
            every figure is backed by verifiable Stellar transactions.
          </p>
        </div>

        {/* Headline stats */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total Budget" value={stats ? formatAmount(stats.totalBudget) : '—'} icon={Wallet} />
          <StatCard label="Distributed" value={stats ? formatAmount(stats.totalDistributed) : '—'} icon={TrendingUp} />
          <StatCard label="Beneficiaries" value={stats ? formatNumber(stats.totalBeneficiaries) : '—'} icon={Users} />
          <StatCard label="Transactions" value={stats ? formatNumber(stats.totalTransactions) : '—'} icon={Activity} />
          <StatCard label="Organizations" value={stats ? formatNumber(stats.activeOrganizations) : '—'} icon={Building2} />
          <StatCard label="Programs" value={stats ? formatNumber(stats.totalPrograms) : '—'} icon={Wallet} />
        </div>

        {/* Charts */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Daily Distribution Volume</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily ?? []}>
                  <defs>
                    <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => String(d).slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="volume" stroke="hsl(221 83% 53%)" fill="url(#vol)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Distribution by Region</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regions ?? []}>
                  <XAxis dataKey="region" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="beneficiaries" fill="hsl(199 89% 48%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Programs table */}
        <Card className="glass-card mt-8">
          <CardHeader>
            <CardTitle>Active Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(programs ?? []).map((p) => (
                <div key={p.id} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.organization.name} · {p.type}
                      </p>
                    </div>
                    <Badge variant="outline">{utilization(p.distributedAmount, p.budgetAmount)}% used</Badge>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full gradient-bg"
                      style={{ width: `${utilization(p.distributedAmount, p.budgetAmount)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>{formatAmount(p.distributedAmount, p.budgetAsset)} distributed</span>
                    <span>{formatAmount(p.remainingAmount, p.budgetAsset)} remaining</span>
                  </div>
                </div>
              ))}
              {(!programs || programs.length === 0) && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No active programs yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
