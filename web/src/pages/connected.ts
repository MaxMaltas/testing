import { fetchWithAuth, refreshAccessToken } from "../lib/auth";

export default async function connected() {

  try {
    console.log("\x1b[32m%s\x1b[0m", "Pasa por connected()");
    //  Solicita un nuevo access token usando la cookie refresh
    window.currentAccessToken = await refreshAccessToken();

    if (!window.currentAccessToken) {
      console.log("\x1b[31m%s\x1b[0m", "Error al renovar el access token");
      setTimeout(() => (location.hash = "#login"), 200);
      return;
    }

    console.log("\x1b[32m%s\x1b[0m", "Access token renovado correctamente");
    // Redirige al perfil
    setTimeout(() => (location.hash = "#profile"), 500);
  } catch (err) {
    console.error("\x1b[31m%s\x1b[0m", "Error en connected():", err);
  }
}
