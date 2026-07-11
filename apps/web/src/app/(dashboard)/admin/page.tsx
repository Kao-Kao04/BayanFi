'use client';

import { FolderKanban, Wallet, FileCheck, TrendingUp } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminNav } from '@/lib/nav';

export default function AdminDashboard() {
  return (
    <DashboardShell title="Organization Dashboard" nav={adminNav}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Budget" value="0.00 USDC" icon={Wallet} />
        <StatCard label="Distributed" value="0.00 USDC" icon={TrendingUp} />
        <StatCard label="Active Programs" value="0" icon={FolderKanban} />
        <StatCard label="Pending Reviews" value="0" icon={FileCheck} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Programs</CardTitle>
            <Button variant="gradient" size="sm">
              New program
            </Button>
          </CardHeader>
          <CardContent>
            <div className="py-12 text-center">
              <FolderKanban className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                Create your first assistance program to start distributing funds.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Applications Requiring Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="py-8 text-center text-sm text-muted-foreground">
              No applications pending. AI-flagged applications will surface here first.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
