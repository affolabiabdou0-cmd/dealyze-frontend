import { api, type TokenResponse } from "./api";

export interface User {
  id: string;
  email: string;
  full_name: string;
  profile: string;
  plan: string;
  created_at?: string;
  email_verified?: boolean;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("dealyze_token");
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("dealyze_user");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function saveAuth(data: TokenResponse): void {
  localStorage.setItem("dealyze_token", data.access_token);
  localStorage.setItem("dealyze_user", JSON.stringify({
    id: data.user_id,
    email: data.email,
    full_name: data.full_name,
    profile: data.profile,
    plan: data.plan,
    created_at: data.created_at,
  }));
}

export function clearAuth(): void {
  localStorage.removeItem("dealyze_token");
  localStorage.removeItem("dealyze_user");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

const TRIAL_DURATION_DAYS = 14;

/** Jours restants sur l'essai gratuit de 14 jours (0 si expiré). */
export function trialDaysRemaining(user: User | null): number {
  if (!user?.created_at) return TRIAL_DURATION_DAYS;
  const elapsedMs = Date.now() - new Date(user.created_at).getTime();
  const elapsedDays = Math.floor(elapsedMs / (24 * 60 * 60 * 1000));
  return Math.max(0, TRIAL_DURATION_DAYS - elapsedDays);
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  const res = await api.post<TokenResponse>("/auth/login", form.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  saveAuth(res.data);
  return res.data;
}

export async function register(
  email: string,
  password: string,
  full_name: string,
  profile: "pme" | "investisseur"
): Promise<TokenResponse> {
  const res = await api.post<TokenResponse>("/auth/register", {
    email, password, full_name, profile,
  });
  saveAuth(res.data);
  return res.data;
}

interface MeResponse {
  user_id: string;
  email: string;
  full_name: string;
  profile: string;
  plan: string;
  created_at: string;
  email_verified?: boolean;
}

/** Re-fetches the authoritative user profile (plan included) and refreshes the local cache. */
export async function refreshUser(): Promise<User | null> {
  try {
    const res = await api.get<MeResponse>("/auth/me");
    const updated: User = {
      id: res.data.user_id,
      email: res.data.email,
      full_name: res.data.full_name,
      profile: res.data.profile,
      plan: res.data.plan,
      created_at: res.data.created_at,
      email_verified: res.data.email_verified,
    };
    localStorage.setItem("dealyze_user", JSON.stringify(updated));
    return updated;
  } catch {
    return null;
  }
}
