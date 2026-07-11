import { useQuery } from '@tanstack/react-query';
import { api } from './client';

export interface PublicStats {
  totalPrograms: number;
  totalBudget: string;
  totalDistributed: string;
  totalBeneficiaries: number;
  totalTransactions: number;
  activeOrganizations: number;
}

export interface PublicProgram {
  id: string;
  name: string;
  type: string;
  budgetAmount: string;
  distributedAmount: string;
  remainingAmount: string;
  budgetAsset: string;
  organization: { name: string; type: string };
}

export interface DailyTxn {
  date: string;
  count: number;
  volume: string;
}

export interface RegionDistribution {
  region: string;
  beneficiaries: number;
  distributed: string;
}

// --- Public transparency queries (no auth) ---

export function usePublicStats() {
  return useQuery({
    queryKey: ['public', 'stats'],
    queryFn: () => api.get<PublicStats>('/public/stats'),
  });
}

export function usePublicPrograms() {
  return useQuery({
    queryKey: ['public', 'programs'],
    queryFn: () => api.get<PublicProgram[]>('/public/programs'),
  });
}

export function useDailyTransactions() {
  return useQuery({
    queryKey: ['public', 'daily'],
    queryFn: () => api.get<DailyTxn[]>('/public/transactions/daily'),
  });
}

export function useDistributionMap() {
  return useQuery({
    queryKey: ['public', 'map'],
    queryFn: () => api.get<RegionDistribution[]>('/public/map'),
  });
}
