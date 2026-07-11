'use client';

import { Siren } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ComingSoon } from '@/components/coming-soon';
import { adminNav } from '@/lib/nav';

export default function AdminDisasterPage() {
  return (
    <DashboardShell title="Disaster Mode" nav={adminNav}>
      <ComingSoon
        icon={Siren}
        title="Emergency fund release"
        description="Select an affected region and instantly disburse relief to all verified beneficiaries there, on-chain and fully auditable. Emergency console coming soon."
      />
    </DashboardShell>
  );
}
