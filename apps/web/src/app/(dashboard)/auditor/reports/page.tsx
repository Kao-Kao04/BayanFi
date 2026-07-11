'use client';

import { FileBarChart } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ComingSoon } from '@/components/coming-soon';
import { auditorNav } from '@/lib/nav';

export default function AuditorReportsPage() {
  return (
    <DashboardShell title="Reports" nav={auditorNav}>
      <ComingSoon
        icon={FileBarChart}
        title="Compliance reports"
        description="Generate and export PDF/Excel compliance reports for regulators, with blockchain-verifiable figures. Report builder coming soon."
      />
    </DashboardShell>
  );
}
