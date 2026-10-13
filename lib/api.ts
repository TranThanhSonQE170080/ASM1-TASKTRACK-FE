// Central API client. All calls go through this module.
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
export const API_URL = (configuredApiUrl ?? (process.env.NODE_ENV === "development"
  ? "http://localhost:5000/api"
  : "")).replace(/\/+$/, "");

const TOKEN_KEY = "tasktrack_token";

export function setAuthToken(token: string | null | undefined) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

async function handleResponse<T>(res: Response) {
  const raw = res.status === 204 ? "" : await res.text();
  let data: unknown;
  try {
    data = raw ? JSON.parse(raw) : undefined;
  } catch {
    data = undefined;
  }

  if (res.status === 401) {
    // Clear a stale token, but keep the API's useful explanation for the user.
    setAuthToken(null);
  }

  if (!res.ok) {
    const body = data as { message?: string; errors?: Record<string, string[]> } | undefined;
    const plainText = raw.trim() && !raw.trimStart().startsWith("<") ? raw.trim() : undefined;
    const detail = body?.errors
      ? Object.values(body.errors).flat().join(", ")
      : body?.message ?? plainText ?? (res.status === 401 ? "Email or password is incorrect." : res.statusText);
    throw new Error(detail || `Request failed (HTTP ${res.status}).`);
  }

  return data as T;
}

async function send(url: string, init: RequestInit) {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured for this frontend deployment.");
  }

  try {
    return await fetch(url, init);
  } catch {
    throw new Error("Could not reach the API. Check NEXT_PUBLIC_API_URL, backend status, and CORS settings.");
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> | undefined = token
    ? { Authorization: `Bearer ${token}` }
    : undefined;

  const res = await send(`${API_URL}${path}`, { cache: "no-store", headers });
  return handleResponse<T>(res);
}

export async function apiSend<T>(path: string, method: "POST" | "PUT" | "DELETE", body?: unknown): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";

  const res = await send(`${API_URL}${path}`, {
    method,
    headers: Object.keys(headers).length ? headers : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(res);
}
