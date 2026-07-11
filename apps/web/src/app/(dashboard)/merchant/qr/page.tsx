'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QrCode, Loader2 } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { merchantNav } from '@/lib/nav';
import { api } from '@/lib/api/client';

export default function MerchantQrPage() {
  const [amount, setAmount] = useState('');
  const [qr, setQr] = useState<string | null>(null);

  const gen = useMutation({
    mutationFn: (amt?: string) =>
      api.post<{ qrCode: string; uri: string }>(`/merchants/me/qr${amt ? `?amount=${amt}` : ''}`),
    onSuccess: (res) => {
      setQr(res.qrCode);
      toast.success('Payment QR generated');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error?.message ?? 'Could not generate QR'),
  });

  return (
    <DashboardShell title="Receive Payment" nav={merchantNav}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Generate a payment QR</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (optional, USDC)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Leave blank for open amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button
              variant="gradient"
              className="w-full"
              disabled={gen.isPending}
              onClick={() => gen.mutate(amount || undefined)}
            >
              {gen.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
              Generate QR
            </Button>
            <p className="text-xs text-muted-foreground">
              Beneficiaries scan this to pay you. Funds settle on Stellar in seconds.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Your QR code</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt="Payment QR" className="h-56 w-56 rounded-2xl border bg-white p-2" />
            ) : (
              <div className="flex h-56 w-56 items-center justify-center rounded-2xl border-2 border-dashed">
                <QrCode className="h-16 w-16 text-muted-foreground/40" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
