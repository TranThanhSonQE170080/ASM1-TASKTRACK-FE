// Central API client. All calls go through this module.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

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
  if (res.status === 401) {
    // clear stored token when the backend rejects with Unauthorized
    setAuthToken(null);
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const detail = (data as { message?: string; errors?: Record<string, string[]> }).errors
      ? Object.values((data as { errors: Record<string, string[]> }).errors).flat().join(", ")
      : (data as { message?: string }).message ?? res.statusText;
    throw new Error(detail);
  }

  return res.status === 204 ? (undefined as T) : res.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> | undefined = token
    ? { Authorization: `Bearer ${token}` }
    : undefined;

  const res = await fetch(`${API_URL}${path}`, { cache: "no-store", headers });
  return handleResponse<T>(res);
}

export async function apiSend<T>(path: string, method: "POST" | "PUT" | "DELETE", body?: unknown): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: Object.keys(headers).length ? headers : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(res);
}
