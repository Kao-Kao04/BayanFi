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
          {/*
            Both logos are tall/portrait PNGs.
            In the navbar we show only the top (shield) portion by
            clipping the container and shifting the image up.
            dark bg  → logo-black.png (white text)
            light bg → logo-white.png (dark text)
          */}
          <div className="relative h-10 w-10 overflow-hidden rounded-lg">
            {/* Dark mode */}
            <Image
              src="/logo-black.png"
              alt="BayanFi"
              width={120}
              height={120}
              className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 h-[52px] w-auto object-contain"
              priority
            />
            {/* Light mode */}
            <Image
              src="/logo-white.png"
              alt="BayanFi"
              width={120}
              height={120}
              className="block dark:hidden absolute top-0 left-1/2 -translate-x-1/2 h-[52px] w-auto object-contain"
              priority
            />
          </div>
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
