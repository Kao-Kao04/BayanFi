'use client';

import { Search } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ComingSoon } from '@/components/coming-soon';
import { auditorNav } from '@/lib/nav';

export default function AuditorTransactionsPage() {
  return (
    <DashboardShell title="Transactions" nav={auditorNav}>
      <ComingSoon
        icon={Search}
        title="Transaction search"
        description="Search every disbursement and payment by date, program, or amount, each linked to on-chain proof on Stellar. Search console coming soon."
      />
    </DashboardShell>
  );
}
