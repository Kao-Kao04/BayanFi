import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  className?: string;
}

/** Compact metric card used across dashboards, with hover lift + gradient icon. */
export function StatCard({ label, value, icon: Icon, change, className }: StatCardProps) {
  return (
    <Card className={cn('glass-card card-hover glow-border group overflow-hidden', className)}>
      <CardContent className="relative flex items-center justify-between p-6">
        {/* Decorative gradient blob */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
        <div className="relative">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight">{value}</p>
          {change && <p className="mt-1 text-xs font-medium text-emerald-500">{change}</p>}
        </div>
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 ring-1 ring-inset ring-primary/10 transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
