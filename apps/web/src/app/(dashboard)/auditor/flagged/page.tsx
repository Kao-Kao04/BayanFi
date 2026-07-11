'use client';

import { Flag } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ComingSoon } from '@/components/coming-soon';
import { auditorNav } from '@/lib/nav';

export default function AuditorFlaggedPage() {
  return (
    <DashboardShell title="Flagged Transactions" nav={auditorNav}>
      <ComingSoon
        icon={Flag}
        title="Flagged for investigation"
        description="Transactions you or the AI have flagged for review, with full context and audit trail. Investigation view coming soon."
      />
    </DashboardShell>
  );
}
