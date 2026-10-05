import { User, TestSummary, ActiveTestDetails, Submission, AdminStats, Question } from '../types.ts';

const TOKEN_KEY = 'testpro_auth_token';
const USER_KEY = 'testpro_auth_user';

export class ApiClient {
  public static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public static setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  public static clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  public static getCachedUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public static setCachedUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
      credentials: 'include', // for httpOnly cookies
    });

    const data = await res.json();

    if (!res.ok || data.success === false) {
      throw new Error(data.message || `Xatolik yuz berdi (${res.status})`);
    }

    return data.data !== undefined ? data.data : data;
  }

  // Auth
  public static async requestOtp(params: { firstName: string; lastName: string; phone: string; role?: string }) {
    return this.request<{
      requestId: string;
      phone: string;
      firstName: string;
      lastName: string;
      telegramBotUrl: string;
      telegramUsername: string;
      isTelegramBotConfigured: boolean;
      devSimulationOtp?: string;
      expiresInSeconds: number;
    }>('/api/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  public static async verifyOtp(params: { phone: string; code: string; firstName?: string; lastName?: string }) {
    const res = await this.request<{ token: string; user: User }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    this.setToken(res.token);
    this.setCachedUser(res.user);
    return res;
  }

  public static async adminLogin(params: { passCode: string; phone?: string }) {
    const res = await this.request<{ token: string; user: User }>('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    this.setToken(res.token);
    this.setCachedUser(res.user);
    return res;
  }

  public static async getCurrentUser(): Promise<User> {
    const res = await this.request<{ user: User }>('/api/auth/me');
    this.setCachedUser(res.user);
    return res.user;
  }

  public static async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      this.clearSession();
    }
  }

  public static async getTelegramInfo() {
    return this.request<{ username: string; isConfigured: boolean }>('/api/auth/telegram-info');
  }

  // Tests (Student)
  public static async getActiveTests(): Promise<TestSummary[]> {
    return this.request<TestSummary[]>('/api/tests');
  }

  public static async getTestToTake(id: string): Promise<ActiveTestDetails> {
    return this.request<ActiveTestDetails>(`/api/tests/${id}/take`);
  }

  public static async submitTest(
    id: string,
    payload: { answers: Record<string, string>; timeSpentSeconds: number; guestName?: string; guestPhone?: string }
  ): Promise<Submission> {
    return this.request<Submission>(`/api/tests/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public static async getMySubmissions(): Promise<Submission[]> {
    return this.request<Submission[]>('/api/my-submissions');
  }

  public static async getSubmission(id: string): Promise<Submission> {
    return this.request<Submission>(`/api/submissions/${id}`);
  }

  public static async getBlitzChallenge(): Promise<ActiveTestDetails> {
    return this.request<ActiveTestDetails>('/api/blitz-challenge');
  }

  public static async getMyMistakes(): Promise<any[]> {
    return this.request<any[]>('/api/my-mistakes');
  }

  // Teacher / Admin
  public static async getAdminTests(): Promise<any[]> {
    return this.request<any[]>('/api/admin/tests');
  }

  public static async createTest(payload: any): Promise<any> {
    return this.request('/api/admin/tests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public static async updateTest(id: string, payload: any): Promise<any> {
    return this.request(`/api/admin/tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public static async deleteTest(id: string): Promise<void> {
    await this.request(`/api/admin/tests/${id}`, {
      method: 'DELETE',
    });
  }

  public static async getAdminSubmissions(): Promise<Submission[]> {
    return this.request<Submission[]>('/api/admin/submissions');
  }

  public static async getAdminStats(): Promise<AdminStats> {
    return this.request<AdminStats>('/api/admin/stats');
  }
}
