
// export async function loginUser(email: string, password: string) {
//     const reply = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ mail: email, password }),
//         credentials: "include" // Asegura que las cookies se envíen con la solicitud
//     });
    
//     if (!reply.ok) {
//         throw new Error("Login failed");
//     }
//     const data = await reply.json();
//     window.currentAccessToken = data.accessToken; // Guarda el access token en una variable global
// }

// export async function refreshAccessToken() {
//     const reply = await fetch("/api/auth/refresh", {
//         method: "POST",
//         credentials: "include" // Asegura que las cookies se envíen con la solicitud
//     });

//     if (!reply.ok) {
//          window.currentAccessToken = null; // Limpia el access token si la renovación falla
//         return null;
//     }

//     const data = await reply.json();
//      window.currentAccessToken = data.accessToken; // Actualiza el access token
//     return  window.currentAccessToken;
// }

// export async function logoutUser() {
//     const accessToken = window.currentAccessToken;
//     await fetch("/api/auth/logout", {
//         method: "POST",
//         headers: {
//             "Authorization": `Bearer ${accessToken}`
//         },
//         credentials: "include" // Asegura que las cookies se envíen con la solicitud
//     });
//      window.currentAccessToken = null; // Limpia el access token al cerrar sesión
// }

// // Helper para hacer peticiones con autentificacion automatica
// export async function fetchWithAuth(url: string, options: RequestInit = {}) {
//     const accessToken = window.currentAccessToken; // Obtener el access token almacenado en la variable global
//     const reply = await fetch(url, {
//         ...options,
//         headers: {
//             ...options.headers,
//             "Authorization": `Bearer ${accessToken}`
//         },
//         credentials: "include" // Asegura que las cookies se envíen con la solicitud
//     });

//     if (reply.status === 401) { // Si el access token ha expirado
//         const newToken = await refreshAccessToken();
//         if (!newToken) {
//             location.hash = "#login"; // Redirige a login si no se puede renovar
//             return reply;
//         }

//         return fetch(url, {
//             ...options,
//             headers: {
//                 ...options.headers,
//                 "Authorization": `Bearer ${newToken}`,
//             },
//             credentials: "include" // Asegura que las cookies se envíen con la solicitud
//         });
//     }

//     return reply;
// }

// export async function googleOAuthLogin()
// {
//     const reply = await fetch("/api/auth/oauth/google", {
//         method: "GET",
//         credentials: "include" // Asegura que las cookies se envíen con la solicitud
//     });
//     if (!reply.ok) {
//         throw new Error("Google OAuth login failed");
//     }
// }

// //test func
// export async function getCurrentUser() 
// {
//     try 
//     {
//         // Verificar autenticación
//         const token = (window as any).currentAccessToken;
//         if (!token) 
//         {
//             await refreshAccessToken();
//             if (!(window as any).currentAccessToken) 
//             	return null;
//         }

//         // Extraer ID del token
//         const payload = JSON.parse(atob((window as any).currentAccessToken.split('.')[1]));
//         const userId = payload.sub;

//         // Obtener datos del usuario
//         const response = await fetchWithAuth(`/api/user/data/?id=${userId}`);
        
//         if (response.ok)
// 		{
//             const data = await response.json();
//             return data.user; // Retorna solo el objeto user
//         }
        
//         return null;
//     } catch (error) {
//         console.error('Error getting current user:', error);
//         return null;
//     }
// }

// /**
//  * Inicializa sesión automáticamente si existe cookie válida.
//  */

// export async function initAuth() {
//   // intenta renovar el token al cargar la web
//   await refreshAccessToken();
// }