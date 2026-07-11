import {
  UserRole,
  OrganizationType,
  ProgramType,
  ProgramStatus,
  ApplicationStatus,
  TransactionType,
  TransactionStatus,
  MerchantCategory,
  MerchantStatus,
  AnalysisType,
  AnalysisResult,
} from './enums';

export interface Address {
  line1: string;
  line2?: string;
  barangay?: string;
  city: string;
  province: string;
  region: string;
  postalCode?: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  stellarPublicKey?: string;
  phone?: string;
  isEmailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  registrationNumber?: string;
  contactEmail: string;
  status: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED';
  stellarPublicKey?: string;
  createdAt: string;
}

export interface EligibilityCriteria {
  age?: { min?: number; max?: number };
  income?: { max?: number };
  location?: string[];
  employmentStatus?: string[];
  customRules?: unknown[];
}

export interface SpendingRestrictions {
  allowedCategories?: MerchantCategory[];
  dailyLimit?: number;
  transactionLimit?: number;
  blockedMerchants?: string[];
}

export interface Program {
  id: string;
  organizationId: string;
  name: string;
  type: ProgramType;
  description?: string;
  budgetAmount: string;
  budgetAsset: string;
  distributedAmount: string;
  maxAmountPerBeneficiary?: string;
  startDate: string;
  endDate?: string;
  eligibilityCriteria: EligibilityCriteria;
  requiredDocuments: string[];
  spendingRestrictions: SpendingRestrictions;
  status: ProgramStatus;
  isEmergency: boolean;
  createdAt: string;
}

export interface Application {
  id: string;
  programId: string;
  beneficiaryId: string;
  status: ApplicationStatus;
  requestedAmount?: string;
  approvedAmount?: string;
  riskScore?: number;
  eligibilityScore?: number;
  flags: string[];
  submittedAt?: string;
  disbursedAt?: string;
  disbursementTxHash?: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  publicKey: string;
  balanceXlm: string;
  balanceUsdc: string;
  isFunded: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  fromWalletId: string;
  toWalletId: string;
  programId?: string;
  transactionType: TransactionType;
  amount: string;
  assetCode: string;
  stellarTxHash: string;
  status: TransactionStatus;
  merchantId?: string;
  createdAt: string;
}

export interface Merchant {
  id: string;
  businessName: string;
  category: MerchantCategory;
  status: MerchantStatus;
  totalSales: string;
  totalTransactions: number;
  createdAt: string;
}

export interface AIAnalysis {
  id: string;
  targetId: string;
  targetType: string;
  analysisType: AnalysisType;
  score: number;
  result: AnalysisResult;
  explanation?: string;
  flags: string[];
  createdAt: string;
}
