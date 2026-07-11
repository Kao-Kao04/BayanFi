'use client';

import { QrCode, Receipt, TrendingUp, Wallet } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { merchantNav } from '@/lib/nav';

export default function MerchantDashboard() {
  return (
    <DashboardShell title="Merchant Dashboard" nav={merchantNav}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Sales" value="0.00 USDC" icon={TrendingUp} />
        <StatCard label="This Week" value="0.00 USDC" icon={TrendingUp} />
        <StatCard label="Total Sales" value="0.00 USDC" icon={Wallet} />
        <StatCard label="Transactions" value="0" icon={Receipt} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Accept a Payment</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-40 w-40 items-center justify-center rounded-2xl border-2 border-dashed">
              <QrCode className="h-16 w-16 text-muted-foreground/40" />
            </div>
            <Button variant="gradient">Generate QR code</Button>
          </CardContent>
        </Card>

        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="py-8 text-center text-sm text-muted-foreground">
              Payments from beneficiaries will appear here, settled on Stellar within seconds.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
