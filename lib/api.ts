// Central API client. All calls go through this module.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiSend<T>(path: string, method: "POST" | "PUT" | "DELETE", body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    // surface field-level validation errors from the API
    const detail = (data as { message?: string; errors?: Record<string, string[]> }).errors
      ? Object.values((data as { errors: Record<string, string[]> }).errors).flat().join(", ")
      : (data as { message?: string }).message ?? res.statusText;
    throw new Error(detail);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}
