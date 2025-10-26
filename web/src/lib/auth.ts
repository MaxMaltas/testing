import type { LoginUser } from "../types/auth";

// Exponer para quien aún lo necesite (compat)
export function getAccessToken() {
  return window.currentAccessToken; 
}
export function setAccessToken(token: string | null) {
  window.currentAccessToken = token; // compat con código existente
}

/** Login → backend setea refresh-token (cookie httpOnly) y devuelve { accessToken } */
export async function loginUser(email: string, password: string): Promise<LoginUser> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mail: email, password }),
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Login failed (HTTP ${res.status})`);
  }
  const data = await res.json().catch(() => ({}));
  setAccessToken(data?.accessToken ?? null);
  return data;
}

/** Intenta renovar el access token usando la cookie refresh-token (httpOnly) */
export async function refreshAccessToken(): Promise<string | null | undefined> {
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) { 
    setAccessToken(null); 
    return null; 
  }
  const data = await res.json().catch(() => ({}));
  setAccessToken(data?.accessToken ?? null);
  return getAccessToken();
}

/** Logout unificado */
export async function logout(): Promise<void> {
  try {
    const accessToken = getAccessToken();
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Authorization": `Bearer ${accessToken}` },
      credentials: "include",
    });
  } finally {
    setAccessToken(null);
  }
}

/**
 * fetch con Authorization automático.
 * - Añade Bearer si hay accessToken
 */
export async function fetchWithAuth(url: string, options: RequestInit = {})
{
	const accessToken = window.currentAccessToken; // Obtener el access token almacenado en la variable global
	
	const headers = {
		...(options.headers || {}),
		...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
	};

	let res = await fetch(url, {
		...options,
		headers,
		credentials: "include" // Asegura que las cookies se envíen con la solicitud
	});

	if (res.status === 401) 
	{
		const newAccessToken = await refreshAccessToken();
		if (!newAccessToken) {
			location.hash = "#login"; // Redirige a login si no se puede renovar
			return res;
		}

		return fetch(url, {
			...options,
			headers: {
				...options.headers,
				"Authorization": `Bearer ${newAccessToken}`,
			},
						credentials: "include" // Asegura que las cookies se envíen con la solicitud
				});
		}

		return res;
}

// ---------- Google OAuth ----------
/** Inicia el flujo de OAuth con Google (redirige a backend → 302 a Google) */
export function googleOAuthLogin() {
  window.location.href = "/api/auth/oauth/google";
}

/** Tras volver del callback (si volvéis a la SPA): renueva AT y navega a la ruta deseada */
export async function completeOAuthRedirect(nextHash = "#home") {
  await refreshAccessToken();
  location.hash = nextHash;
}

/** Llamar una vez al arrancar la app para restaurar sesión si hay refresh-token */
export async function initAuth() {
  await refreshAccessToken();
}

//test func
export async function getCurrentUser() 
{
    try 
    {
        // Verificar autenticación
        const token = (window as any).currentAccessToken;
        if (!token) 
        {
            await refreshAccessToken();
            if (!(window as any).currentAccessToken) 
              return null;
        }

        // Extraer ID del token
        const payload = JSON.parse(atob((window as any).currentAccessToken.split('.')[1]));
        const userId = payload.sub;

        // Obtener datos del usuario
        const response = await fetchWithAuth(`/api/user/data/?id=${userId}`);
        
        if (response.ok)
        {
            const data = await response.json();
            return data.user; // Retorna solo el objeto user
        }
        
        return null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}
