'use client';

import { FolderKanban } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ComingSoon } from '@/components/coming-soon';
import { adminNav } from '@/lib/nav';

export default function AdminProgramsPage() {
  return (
    <DashboardShell title="Programs" nav={adminNav}>
      <ComingSoon
        icon={FolderKanban}
        title="Program management"
        description="Create, fund, and manage assistance programs with eligibility rules, budgets, and spending restrictions. Full builder UI is on the way."
      />
    </DashboardShell>
  );
}
