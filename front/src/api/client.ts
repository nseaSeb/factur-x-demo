// API responses carry absolute hrefs (http://localhost:3200/...) since the
// server builds them from APP_BASE_URL, not the request. Stripping that
// origin before fetching routes every hypermedia-driven call back through
// Vite's dev proxy (same-origin, no CORS) instead of hitting :3200 directly.
const API_ORIGIN = 'http://localhost:3200';

export function toPath(hrefOrPath: string): string {
  return hrefOrPath.startsWith(API_ORIGIN) ? hrefOrPath.slice(API_ORIGIN.length) : hrefOrPath;
}

// The PDF and conformance links take an optional profile override.
export function withProfile(href: string, profile: string): string {
  return `${href}?profile=${encodeURIComponent(profile)}`;
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`API error ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(hrefOrPath: string, init?: RequestInit): Promise<T> {
  const res = await fetch(toPath(hrefOrPath), init);
  const text = await res.text();
  const body = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    throw new ApiError(res.status, body);
  }
  return body as T;
}

// Binary responses (the generated PDF) can't go through request(), which
// parses JSON. Error bodies are still JSON, so they're parsed for ApiError.
async function requestBlob(hrefOrPath: string): Promise<Blob> {
  const res = await fetch(toPath(hrefOrPath));
  if (!res.ok) {
    const text = await res.text();
    let body: unknown = text;
    try {
      body = JSON.parse(text);
    } catch {
      // keep raw text
    }
    throw new ApiError(res.status, body);
  }
  return res.blob();
}

export const api = {
  get: <T>(hrefOrPath: string): Promise<T> => request<T>(hrefOrPath),
  getBlob: requestBlob,
  post: <T>(hrefOrPath: string, payload: unknown): Promise<T> =>
    request<T>(hrefOrPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  postForm: <T>(hrefOrPath: string, formData: FormData): Promise<T> =>
    request<T>(hrefOrPath, { method: 'POST', body: formData }),
  patch: <T>(hrefOrPath: string, payload: unknown): Promise<T> =>
    request<T>(hrefOrPath, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  delete: <T>(hrefOrPath: string): Promise<T> => request<T>(hrefOrPath, { method: 'DELETE' }),
};
