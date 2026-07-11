import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Typed API client with automatic access-token injection and transparent
 * refresh-token rotation on 401 responses.
 */
class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private refreshQueue: Array<(token: string) => void> = [];

  constructor() {
    this.instance = axios.create({
      baseURL: `${API_URL}/v1`,
      headers: { 'Content-Type': 'application/json' },
    });

    this.instance.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.instance.interceptors.response.use(
      (res) => res,
      async (error: AxiosError) => this.handleError(error)
    );
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('bayanfi_access_token');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('bayanfi_refresh_token');
  }

  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('bayanfi_access_token', accessToken);
    localStorage.setItem('bayanfi_refresh_token', refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('bayanfi_access_token');
    localStorage.removeItem('bayanfi_refresh_token');
  }

  private async handleError(error: AxiosError) {
    const original = error.config as any;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        this.clearTokens();
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post(`${API_URL}/v1/auth/refresh`, { refreshToken });
        const tokens = data.data ?? data;
        this.setTokens(tokens.accessToken, tokens.refreshToken);
        original.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return this.instance(original);
      } catch (refreshErr) {
        this.clearTokens();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }

  /** Unwraps the standard { success, data } envelope. */
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const res = await this.instance.get(url, { params });
    return (res.data.data ?? res.data) as T;
  }

  async post<T>(url: string, body?: unknown): Promise<T> {
    const res = await this.instance.post(url, body);
    return (res.data.data ?? res.data) as T;
  }

  async patch<T>(url: string, body?: unknown): Promise<T> {
    const res = await this.instance.patch(url, body);
    return (res.data.data ?? res.data) as T;
  }

  async delete<T>(url: string): Promise<T> {
    const res = await this.instance.delete(url);
    return (res.data.data ?? res.data) as T;
  }
}

export const api = new ApiClient();
