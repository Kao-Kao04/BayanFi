'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Wallet as WalletIcon, Plus, Copy, Loader2 } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { beneficiaryNav } from '@/lib/nav';
import { api } from '@/lib/api/client';
import { formatAmount, shortenKey } from '@/lib/utils';

interface WalletDto {
  id: string;
  publicKey: string;
  balanceXlm: string;
  balanceUsdc: string;
  isFunded: boolean;
  label?: string;
}

export default function BeneficiaryWalletPage() {
  const qc = useQueryClient();
  const { data: wallets, isLoading } = useQuery({
    queryKey: ['wallets', 'me'],
    queryFn: () => api.get<WalletDto[]>('/wallets/me'),
  });

  const create = useMutation({
    mutationFn: () => api.post('/wallets', {}),
    onSuccess: () => {
      toast.success('Wallet created and funded on Stellar testnet');
      qc.invalidateQueries({ queryKey: ['wallets', 'me'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.error?.message ?? 'Could not create wallet'),
  });

  const hasWallet = wallets && wallets.length > 0;

  return (
    <DashboardShell title="My Wallet" nav={beneficiaryNav}>
      {isLoading && <div className="h-40 animate-pulse rounded-2xl bg-muted/40" />}

      {!isLoading && !hasWallet && (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 ring-1 ring-inset ring-primary/10">
              <WalletIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Create your Stellar wallet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                A secure wallet to receive and spend your assistance funds.
              </p>
            </div>
            <Button variant="gradient" disabled={create.isPending} onClick={() => create.mutate()}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create wallet
            </Button>
          </CardContent>
        </Card>
      )}

      {hasWallet && (
        <div className="grid gap-4 md:grid-cols-2">
          {wallets!.map((w) => (
            <Card key={w.id} className="glass-card glow-border overflow-hidden">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <WalletIcon className="h-5 w-5 text-primary" />
                  {w.label ?? 'Wallet'}
                </CardTitle>
                {w.isFunded && <Badge variant="success">Funded</Badge>}
              </CardHeader>
              <CardContent>
                <div className="rounded-xl bg-muted/40 p-4">
                  <p className="text-xs text-muted-foreground">USDC Balance</p>
                  <p className="text-3xl font-bold gradient-text">{formatAmount(w.balanceUsdc)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatAmount(w.balanceXlm, 'XLM')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(w.publicKey);
                    toast.success('Address copied');
                  }}
                  className="mt-4 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <span className="font-mono text-xs">{shortenKey(w.publicKey)}</span>
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
