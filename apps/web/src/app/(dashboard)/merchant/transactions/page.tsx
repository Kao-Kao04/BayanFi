'use client';

import { Receipt } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ComingSoon } from '@/components/coming-soon';
import { merchantNav } from '@/lib/nav';

export default function MerchantTransactionsPage() {
  return (
    <DashboardShell title="Transactions" nav={merchantNav}>
      <ComingSoon
        icon={Receipt}
        title="Transaction history"
        description="Every payment you receive, settled on Stellar with a verifiable hash. Full ledger view with export and refunds coming soon."
      />
    </DashboardShell>
  );
}
