// src/lib/api.ts
import axios, { AxiosError, AxiosHeaders, AxiosRequestConfig } from 'axios';

/** ================== Cấu hình cơ bản ================== */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

axios.defaults.withCredentials = true;

/** ================== State trong bộ nhớ ================== */
let accessToken: string | null = null;
let initialized = false;
let inFlightRefresh: Promise<string> | null = null;

/** ================== Type helpers ================== */
type AccessTokenRoot = { accessToken?: string };
type AccessTokenNested = { data?: { accessToken?: string } };

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}
export async function ensureAccessToken() {
  if (!accessToken && !initialized) {
    initialized = true;
    try {
      const res = await api.post('/auth/refresh', {}, { withCredentials: true });
      const token = extractAccessToken(res.data);
      if (token) {
        accessToken = token;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      console.warn('[API] No valid refresh token');
    }
  }
}

function extractAccessToken(data: unknown): string | null {
  if (isRecord(data) && typeof (data as AccessTokenRoot).accessToken === 'string') {
    return (data as AccessTokenRoot).accessToken!;
  }
  if (
    isRecord(data) &&
    isRecord((data as AccessTokenNested).data) &&
    typeof (data as AccessTokenNested).data!.accessToken === 'string'
  ) {
    return (data as AccessTokenNested).data!.accessToken!;
  }
  return null;
}

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

function setAuthHeader(cfg: AxiosRequestConfig, token: string): void {
  (cfg.headers ??= {})['Authorization'] = `Bearer ${token}`;
}

/** ================== Interceptors ================== */
// Thêm Authorization nếu đã có accessToken trong RAM
api.interceptors.request.use((config) => {
  const token = accessToken || localStorage.getItem('accessToken');

  if (token) {
    // Trường hợp headers chưa được khởi tạo
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    // Nếu là instance của AxiosHeaders
    if (config.headers instanceof AxiosHeaders) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      // Nếu headers là object thường (vẫn xảy ra trong một số runtime)
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  return config;
});

// Tự động lưu accessToken nếu server trả về (ví dụ /auth/signin)
api.interceptors.response.use(
  (response) => {
    const token = extractAccessToken(response.data);
    if (token) {
      accessToken = token;
      // set vào defaults cho các request sau
      const defaults = (api.defaults.headers.common ?? {}) as Record<string, string>;
      defaults.Authorization = `Bearer ${token}`;
      api.defaults.headers.common = defaults;
    }
    return response;
  },
  async (error: AxiosError) => {
    const original = (error.config ?? {}) as RetriableConfig;

    // Nếu 401 và chưa retry → thử refresh
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      inFlightRefresh =
        inFlightRefresh ??
        api
          .post('/auth/refresh', {}, { withCredentials: true })
          .then((res) => {
            const token = extractAccessToken(res.data);
            if (!token) throw new Error('No access token in refresh response');
            accessToken = token;

            const defaults = (api.defaults.headers.common ?? {}) as Record<string, string>;
            defaults.Authorization = `Bearer ${token}`;
            api.defaults.headers.common = defaults;

            return token;
          })
          .finally(() => {
            inFlightRefresh = null;
          });

      try {
        const newToken = await inFlightRefresh;
        if (newToken) {
          setAuthHeader(original, newToken);
          return api(original);
        }
      } catch {
        accessToken = null; // refresh thất bại → xoá token trong RAM
      }
    }

    // Ném lỗi cho caller xử lý (ví dụ: SchedulePage sẽ redirect khi 401)
    return Promise.reject(error);
  }
);

export default api;
