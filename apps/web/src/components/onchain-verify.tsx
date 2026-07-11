'use client';

import { useState } from 'react';
import { ShieldCheck, ExternalLink, Loader2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api/client';
import { formatAmount } from '@/lib/utils';

interface OnChainProof {
  verified: boolean;
  reason?: string;
  fundingWallet?: string;
  explorerUrl?: string;
  onChainBalances?: Array<{ asset: string; balance: string }>;
  recentOnChainPayments?: Array<{ amount: string; asset?: string; createdAt: string; txHash: string }>;
}

/**
 * Lets anyone verify a program's funds directly against the Stellar ledger.
 * This is the proof that BayanFi's figures are real on-chain state, not
 * numbers in a private database.
 */
export function OnChainVerify({ programId }: { programId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proof, setProof] = useState<OnChainProof | null>(null);

  async function verify() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (proof) return;
    setLoading(true);
    try {
      const res = await api.get<OnChainProof>(`/public/programs/${programId}/onchain`);
      setProof(res);
    } catch {
      setProof({ verified: false, reason: 'Could not reach the ledger right now.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <Button variant="outline" size="sm" onClick={verify} className="gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        {open ? 'Hide on-chain proof' : 'Verify on Stellar'}
      </Button>

      {open && (
        <div className="mt-3 rounded-xl border bg-muted/30 p-4 text-sm animate-fade-in-up">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Reading the Stellar ledger...
            </div>
          )}

          {!loading && proof && !proof.verified && (
            <p className="text-muted-foreground">{proof.reason}</p>
          )}

          {!loading && proof && proof.verified && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="success">Verified on-chain</Badge>
                <span className="text-xs text-muted-foreground">Live from Horizon</span>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Funding wallet balances</p>
                <div className="mt-1 space-y-1">
                  {(proof.onChainBalances ?? []).map((b, i) => (
                    <div key={i} className="flex justify-between font-mono text-xs">
                      <span>{b.asset}</span>
                      <span>{formatAmount(b.balance, b.asset)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {proof.explorerUrl && (
                <a
                  href={proof.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  View this wallet on Stellar Explorer
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}

              {(proof.recentOnChainPayments?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Recent on-chain payments</p>
                  <div className="mt-1 space-y-1">
                    {proof.recentOnChainPayments!.slice(0, 3).map((p, i) => (
                      <div key={i} className="flex justify-between font-mono text-xs">
                        <span>{formatAmount(p.amount, p.asset ?? '')}</span>
                        <span className="text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
