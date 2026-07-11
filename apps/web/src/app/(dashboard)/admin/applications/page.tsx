'use client';

import { FileCheck } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ComingSoon } from '@/components/coming-soon';
import { adminNav } from '@/lib/nav';

export default function AdminApplicationsPage() {
  return (
    <DashboardShell title="Applications" nav={adminNav}>
      <ComingSoon
        icon={FileCheck}
        title="Application review queue"
        description="Review applications with AI risk scores, duplicate and fraud flags, then approve to trigger on-chain disbursement. Review workspace coming soon."
      />
    </DashboardShell>
  );
}
