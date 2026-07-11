'use client';

import { ShieldAlert } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ComingSoon } from '@/components/coming-soon';
import { auditorNav } from '@/lib/nav';

export default function AuditorAnomaliesPage() {
  return (
    <DashboardShell title="AI Anomalies" nav={auditorNav}>
      <ComingSoon
        icon={ShieldAlert}
        title="AI-detected anomalies"
        description="Spending patterns and applications the AI flagged as needing review, ranked by risk. Anomaly dashboard coming soon."
      />
    </DashboardShell>
  );
}
