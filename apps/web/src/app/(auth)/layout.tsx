import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0 aurora" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/">
            {/*
              Auth pages are always dark background.
              logo-black.png has white text — correct for dark bg.
            */}
            <Image
              src="/logo-black.png"
              alt="BayanFi"
              width={160}
              height={200}
              className="h-36 w-auto object-contain"
              priority
            />
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
