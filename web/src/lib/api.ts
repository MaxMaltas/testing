import { fetchWithAuth } from "./auth";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

type Query = Record<string, string | number | boolean | null | undefined>;

function qs(query?: Query): string {
  if (!query) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) {
      continue;
    }
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

async function parseSafe<T>(res: Response): Promise<T | any> {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

export async function apiGet<T>( url: string, opts?: { credentials?: RequestCredentials; query?: Query }): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${url}${qs(opts?.query)}`, {
      method: "GET",
      credentials: opts?.credentials ?? "include",
    });
    const data = await parseSafe<T>(res);
    if (!res.ok) {
      return { ok: false, error: (data as any)?.error ?? "Request failed", status: res.status };
    }
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Network error" };
  }
}

export async function apiPost<T>( url: string, body: unknown, opts?: { credentials?: RequestCredentials }): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: opts?.credentials ?? "include",
    });
    const data = await parseSafe<T>(res);
    if (!res.ok) {
      return { ok: false, error: (data as any)?.error ?? "Request failed", status: res.status };
    }
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Network error" };
  }
}

export async function apiPut<T>( url: string, body: unknown, opts?: { credentials?: RequestCredentials }): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: opts?.credentials ?? "include",
    });
    const data = await parseSafe<T>(res);
    if (!res.ok) {
      return { ok: false, error: (data as any)?.error ?? "Request failed", status: res.status };
    }
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Network error" };
  }
}

export async function apiDelete<T>( url: string, opts?: { credentials?: RequestCredentials; query?: Query }): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${url}${qs(opts?.query)}`, {
      method: "DELETE",
      credentials: opts?.credentials ?? "include",
    });
    const data = await parseSafe<T>(res);
    if (!res.ok) {
       return { ok: false, error: (data as any)?.error ?? "Request failed", status: res.status };
    }
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Network error" };
  }
}








export async function apiAuthGet<T>( url: string, opts?: { query?: Query }): Promise<ApiResult<T>> {
  try {
    const res = await fetchWithAuth(`${url}${qs(opts?.query)}`, { method: "GET" });
    const data = await parseSafe<T>(res);
    if (!res.ok) {
      return { ok: false, error: (data as any)?.error ?? "Request failed", status: res.status };
    }
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Network error" };
  }
}

export async function apiAuthPost<T>(url: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetchWithAuth(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await parseSafe<T>(res);
    if (!res.ok) {
      return { ok: false, error: (data as any)?.error ?? "Request failed", status: res.status };
    }
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Network error" };
  }
}

export async function apiAuthPut<T>(url: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetchWithAuth(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await parseSafe<T>(res);
    if (!res.ok) {
      return { ok: false, error: (data as any)?.error ?? "Request failed", status: res.status };
    }
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Network error" };
  }
}

export async function apiAuthDelete<T>( url: string, opts?: { query?: Query }): Promise<ApiResult<T>> {
  try {
    const res = await fetchWithAuth(`${url}${qs(opts?.query)}`, { method: "DELETE" });
    const data = await parseSafe<T>(res);
    if (!res.ok) {
      return { ok: false, error: (data as any)?.error ?? "Request failed", status: res.status };
    }
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Network error" };
  }
}
