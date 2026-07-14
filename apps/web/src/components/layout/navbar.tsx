'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-2">
          <Image
            src="/icon.png"
            alt="BayanFi"
            width={40}
            height={40}
            className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-105"
            priority
          />
          <span className="text-lg font-bold tracking-tight">
            Bayan<span className="gradient-text">Fi</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground">
            Features
          </Link>
          <Link href="/#how" className="text-sm text-muted-foreground hover:text-foreground">
            How it works
          </Link>
          <Link href="/#stellar" className="text-sm text-muted-foreground hover:text-foreground">
            Why Stellar
          </Link>
          <Link href="/transparency" className="text-sm text-muted-foreground hover:text-foreground">
            Transparency
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button variant="gradient" asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
