'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText, ArrowRight, Loader2 } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { beneficiaryNav } from '@/lib/nav';
import { usePublicPrograms } from '@/lib/api/queries';
import { api } from '@/lib/api/client';
import { formatAmount, utilization } from '@/lib/utils';

export default function BeneficiaryProgramsPage() {
  const { data: programs, isLoading } = usePublicPrograms();

  const apply = useMutation({
    mutationFn: (programId: string) => api.post('/applications', { programId }),
    onSuccess: () => toast.success('Application draft created. Complete it from your dashboard.'),
    onError: (e: any) =>
      toast.error(e?.response?.data?.error?.message ?? 'Could not start application'),
  });

  return (
    <DashboardShell title="Available Programs" nav={beneficiaryNav}>
      <p className="mb-6 text-sm text-muted-foreground">
        Browse active assistance programs and apply to the ones you qualify for.
      </p>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted/40" />
          ))}
        </div>
      )}

      {!isLoading && (!programs || programs.length === 0) && (
        <Card className="glass-card">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No active programs right now. Check back soon.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {(programs ?? []).map((p) => (
          <Card key={p.id} className="glass-card card-hover glow-border group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 ring-1 ring-inset ring-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="secondary">{p.type.replace(/_/g, ' ')}</Badge>
              </div>
              <h3 className="mt-4 font-semibold">{p.name}</h3>
              <p className="text-xs text-muted-foreground">{p.organization.name}</p>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full gradient-bg"
                  style={{ width: `${utilization(p.distributedAmount, p.budgetAmount)}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>{formatAmount(p.remainingAmount, p.budgetAsset)} left</span>
                <span>{utilization(p.distributedAmount, p.budgetAmount)}% used</span>
              </div>

              <Button
                variant="gradient"
                className="mt-5 w-full"
                disabled={apply.isPending}
                onClick={() => apply.mutate(p.id)}
              >
                {apply.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Apply now <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
