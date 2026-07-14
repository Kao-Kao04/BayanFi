import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0 aurora" />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex flex-col items-center gap-3">
          <Image
            src="/icon.png"
            alt="BayanFi"
            width={72}
            height={72}
            className="h-16 w-16 object-contain"
            priority
          />
          <span className="text-2xl font-bold tracking-tight">
            Bayan<span className="gradient-text">Fi</span>
          </span>
        </Link>
        {children}
      </div>
    </div>
  );
}
