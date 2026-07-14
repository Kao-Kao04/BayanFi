import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0 aurora" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/">
            {/* dark background → white logo */}
            <Image
              src="/logo-white.png"
              alt="BayanFi"
              width={180}
              height={60}
              className="hidden dark:block h-14 w-auto object-contain"
              priority
            />
            <Image
              src="/logo-black.png"
              alt="BayanFi"
              width={180}
              height={60}
              className="block dark:hidden h-14 w-auto object-contain"
              priority
            />
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
