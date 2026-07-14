import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: 'BayanFi — Transparent Public Money. Powered by Stellar.',
  description:
    'BayanFi is an AI-powered public finance platform that lets governments, NGOs, and foundations distribute financial assistance transparently on the Stellar blockchain.',
  keywords: ['Stellar', 'public finance', 'blockchain', 'financial inclusion', 'government'],
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'BayanFi — Transparent Public Money',
    description: 'Distribute financial assistance transparently on Stellar.',
    type: 'website',
    images: ['/icon.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
