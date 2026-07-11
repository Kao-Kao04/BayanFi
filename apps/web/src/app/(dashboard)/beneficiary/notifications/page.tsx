'use client';

import { useQuery } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { beneficiaryNav } from '@/lib/nav';
import { api } from '@/lib/api/client';
import { cn } from '@/lib/utils';

interface Notif {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<Notif[]>('/notifications'),
  });

  return (
    <DashboardShell title="Notifications" nav={beneficiaryNav}>
      {isLoading && <div className="h-40 animate-pulse rounded-2xl bg-muted/40" />}

      {!isLoading && (!notifications || notifications.length === 0) && (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 ring-1 ring-inset ring-primary/10">
              <Bell className="h-7 w-7 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              You are all caught up. Updates about your applications and funds will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {(notifications ?? []).map((n) => (
          <Card key={n.id} className={cn('glass-card', !n.isRead && 'ring-1 ring-primary/30')}>
            <CardContent className="flex items-start gap-3 p-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                {n.isRead ? (
                  <CheckCheck className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Bell className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{n.title}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
