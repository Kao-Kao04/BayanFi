import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0 aurora" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">
              Bayan<span className="gradient-text">Fi</span>
            </span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
