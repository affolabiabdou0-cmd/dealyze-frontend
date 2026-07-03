import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://dealyze-api.onrender.com";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("dealyze_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (expired or invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("dealyze_token");
      localStorage.removeItem("dealyze_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

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
