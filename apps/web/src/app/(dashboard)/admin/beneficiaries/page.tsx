'use client';

import { Users } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ComingSoon } from '@/components/coming-soon';
import { adminNav } from '@/lib/nav';

export default function AdminBeneficiariesPage() {
  return (
    <DashboardShell title="Beneficiaries" nav={adminNav}>
      <ComingSoon
        icon={Users}
        title="Beneficiary registry"
        description="Search and manage verified beneficiaries, view their assistance history, and flag duplicates detected by AI. Registry view coming soon."
      />
    </DashboardShell>
  );
}
