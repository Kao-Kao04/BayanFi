// Shared API envelope and helper types.

export interface StandardResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
  requestId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PublicStats {
  totalPrograms: number;
  totalBudget: string;
  totalDistributed: string;
  totalBeneficiaries: number;
  totalTransactions: number;
  activeOrganizations: number;
}

export interface ChatResponse {
  reply: string;
  confidence: number;
  suggestedActions?: Array<{ type: string; [key: string]: unknown }>;
}
