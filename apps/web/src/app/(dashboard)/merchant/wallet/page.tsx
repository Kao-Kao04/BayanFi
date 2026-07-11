'use client';

import { Wallet } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ComingSoon } from '@/components/coming-soon';
import { merchantNav } from '@/lib/nav';

export default function MerchantWalletPage() {
  return (
    <DashboardShell title="Wallet" nav={merchantNav}>
      <ComingSoon
        icon={Wallet}
        title="Merchant wallet"
        description="Track your settled balance and cash out through Stellar anchors. Balance and payout view coming soon."
      />
    </DashboardShell>
  );
}
