'use client';

import { LayoutDashboard, FileText, Wallet } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { beneficiaryNav } from '@/lib/nav';

export default function BeneficiaryDashboard() {
  return (
    <DashboardShell title="My Dashboard" nav={beneficiaryNav}>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Wallet Balance" value="0.00 USDC" icon={Wallet} />
        <StatCard label="Active Applications" value="0" icon={FileText} />
        <StatCard label="Funds Received" value="0.00 USDC" icon={LayoutDashboard} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle>My Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-12 text-center">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                You have no applications yet. Browse available programs to apply.
              </p>
              <Button variant="gradient" className="mt-4">
                Browse programs
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Complete my profile
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Create my wallet
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Ask the assistant
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Recent Transactions <Badge variant="outline">On-chain</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            No transactions yet. Received funds and payments will appear here with links to Stellar
            proof.
          </p>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
