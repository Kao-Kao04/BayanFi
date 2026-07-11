import { LucideIcon, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ComingSoonProps {
  icon?: LucideIcon;
  title: string;
  description: string;
}

/** Polished placeholder for dashboard sections still under construction. */
export function ComingSoon({ icon: Icon = Sparkles, title, description }: ComingSoonProps) {
  return (
    <Card className="glass-card">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 ring-1 ring-inset ring-primary/10">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" />
          In active development
        </span>
      </CardContent>
    </Card>
  );
}
