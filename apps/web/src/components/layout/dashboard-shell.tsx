'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, LogOut, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuthStore } from '@/stores/auth.store';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface DashboardShellProps {
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
}

/** Authenticated dashboard chrome: sidebar + top bar + content. */
export function DashboardShell({ title, nav, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isAuthenticated && !user) {
      // Give the persisted store a tick before redirecting.
      const t = setTimeout(() => {
        if (!useAuthStore.getState().isAuthenticated) router.push('/login');
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-card/50 backdrop-blur md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold">
            Bayan<span className="gradient-text">Fi</span>
          </span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  active
                    ? 'gradient-bg text-white shadow-lg shadow-primary/25'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    active ? '' : 'group-hover:scale-110'
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card/50 px-6 backdrop-blur">
          <h1 className="text-lg font-semibold">{title}</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                {user?.email?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="hidden text-sm sm:block">
                <p className="font-medium leading-none">{user?.email}</p>
                <p className="text-xs text-muted-foreground">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="relative flex-1 overflow-auto p-6">
          <div className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
          <div className="relative">{children}</div>
        </main>
      </div>
    </div>
  );
}
