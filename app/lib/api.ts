import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://dealyze.onrender.com";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("dealyze_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface TokenResponse {
  access_token: string;
  user_id: string;
  email: string;
  full_name: string;
  profile: string;
  plan: string;
}

export interface UsageResponse {
  plan: string;
  usage: Record<string, number>;
  limits: Record<string, number>;
}
