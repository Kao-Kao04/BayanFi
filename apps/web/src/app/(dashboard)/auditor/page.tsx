'use client';

import { Search, Flag, FileBarChart, ShieldAlert } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auditorNav } from '@/lib/nav';

export default function AuditorDashboard() {
  return (
    <DashboardShell title="Auditor Dashboard" nav={auditorNav}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Transactions" value="0" icon={Search} />
        <StatCard label="Flagged" value="0" icon={Flag} />
        <StatCard label="AI Anomalies" value="0" icon={ShieldAlert} />
        <StatCard label="Reports" value="0" icon={FileBarChart} />
      </div>

      <Card className="glass-card mt-6">
        <CardHeader>
          <CardTitle>Transaction Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-12 text-center text-sm text-muted-foreground">
            Search and verify any transaction against the Stellar public ledger. AI-flagged
            anomalies appear under the Anomalies tab for investigation.
          </p>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
