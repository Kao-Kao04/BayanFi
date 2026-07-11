import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merges Tailwind class names, resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a numeric string/amount as a currency-like display. */
export function formatAmount(amount: string | number, asset = 'USDC'): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${asset}`;
}

/** Formats a number with thousands separators. */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/** Shortens a Stellar public key for display: GABC...WXYZ */
export function shortenKey(key: string): string {
  if (!key || key.length < 12) return key;
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

/** Computes a program budget utilization percentage. */
export function utilization(distributed: string | number, budget: string | number): number {
  const d = typeof distributed === 'string' ? parseFloat(distributed) : distributed;
  const b = typeof budget === 'string' ? parseFloat(budget) : budget;
  return b > 0 ? Math.round((d / b) * 100) : 0;
}
