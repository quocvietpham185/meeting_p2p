// src/lib/api.ts
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// ======================================
// Types
// ======================================

interface RefreshResponse {
  accessToken?: string;
  data?: { accessToken?: string };
}

interface TokenCallback {
  (token: string): void;
}

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

// ======================================
// STATE IN MEMORY
// ======================================
let isRefreshing = false;
let refreshQueue: TokenCallback[] = [];

// ======================================
// TYPE GUARD: kiểm tra object
// ======================================
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// ======================================
// Helper: Lấy accessToken từ response
// ======================================
function extractAccessToken(data: unknown): string | null {
  if (!isObject(data)) return null;

  // case 1: { accessToken: "..." }
  if (typeof data.accessToken === "string") return data.accessToken;

  // case 2: { data: { accessToken: "..." } }
  if (isObject(data.data) && typeof data.data.accessToken === "string") {
    return data.data.accessToken;
  }

  return null;
}

// ======================================
// REQUEST interceptor: luôn gắn Authorization
// ======================================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

// ======================================
// RESPONSE interceptor: refresh token tự động
// ======================================
api.interceptors.response.use(
  (response: AxiosResponse<RefreshResponse>) => {
    const token = extractAccessToken(response.data);

    if (token) {
      localStorage.setItem("accessToken", token);
    }

    return response;
  },

  async (error: AxiosError) => {
    const original = error.config as RetriableConfig;

    // Không phải lỗi 401 -> throw
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Tránh retry nhiều lần
    if (original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    // Nếu đang refresh → request chờ
    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((accessToken) => {
          original.headers = original.headers || {};
          original.headers["Authorization"] = `Bearer ${accessToken}`;
          resolve(api(original));
        });
      });
    }

    // Thực hiện refresh
    isRefreshing = true;

    try {
      const res = await api.post<RefreshResponse>(
        "/auth/refresh",
        {},
        { withCredentials: true }
      );

      const newToken = extractAccessToken(res.data);
      if (!newToken) throw new Error("Refresh không trả về accessToken");

      localStorage.setItem("accessToken", newToken);

      // Retry các request đang đợi
      refreshQueue.forEach((cb) => cb(newToken));
      refreshQueue = [];
      isRefreshing = false;

      original.headers = original.headers || {};
      original.headers["Authorization"] = `Bearer ${newToken}`;

      return api(original);
    } catch (refreshError) {
      isRefreshing = false;
      refreshQueue = [];

      localStorage.removeItem("accessToken");

      return Promise.reject(refreshError);
    }
  }
);

export default api;
