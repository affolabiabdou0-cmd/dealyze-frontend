import { api, type TokenResponse } from "./api";

export interface User {
  id: string;
  email: string;
  full_name: string;
  profile: string;
  plan: string;
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
  }));
}

export function clearAuth(): void {
  localStorage.removeItem("dealyze_token");
  localStorage.removeItem("dealyze_user");
}

export function isAuthenticated(): boolean {
  return !!getToken();
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
