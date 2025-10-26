import type { ApiResult } from "./api";
import { fetchWithAuth } from "./auth";

/**
 * Subida autenticada (multipart/form-data).
 * NO seteamos Content-Type: el navegador pone boundary automáticamente.
 */
export async function apiAuthUpload<T>(url: string, formData: FormData): Promise<ApiResult<T>> {
  try {
    const res = await fetchWithAuth(url, {
      method: "POST",
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: (data as any)?.error ?? "Upload failed", status: res.status };
    }
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Network error" };
  }
}
