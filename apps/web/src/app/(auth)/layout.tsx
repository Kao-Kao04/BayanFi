import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0 aurora" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <Image
              src="/logo-full.png"
              alt="BayanFi"
              width={180}
              height={60}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
