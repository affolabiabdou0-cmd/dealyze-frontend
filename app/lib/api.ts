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

// FastAPI returns `detail` as a plain string for HTTPException, but as an array of
// {type, loc, msg, input, ctx} objects for Pydantic request-validation failures (422).
// Rendering that array directly as JSX crashes the page (React error #31: "objects are
// not valid as a React child") — this normalizes either shape into a displayable string.
export function getErrorMessage(err: unknown, fallback: string): string {
  const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const msgs = detail.map((d) => (d && typeof d === "object" && "msg" in d ? String((d as { msg: unknown }).msg) : String(d)));
    return msgs.join(" ");
  }
  return fallback;
}

export interface TokenResponse {
  access_token: string;
  user_id: string;
  email: string;
  full_name: string;
  profile: string;
  plan: string;
  created_at?: string;
}

export interface UsageResponse {
  plan: string;
  usage: Record<string, number>;
  limits: Record<string, number>;
}
