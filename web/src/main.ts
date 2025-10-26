import play from "./pages/play";
import home from "./pages/home";
import tournament from "./pages/tournament";
import login from "./pages/login";
import register from "./pages/register";
import "./styles/pong.css";
import "./styles/panel.css";
import { unmountPanel } from "./lib/panel";
import profile from "./pages/profile";
import dashboard from "./pages/dashboard";
import { initAuth, refreshAccessToken } from "./lib/auth";
import connected from "./pages/connected";
import matchSim from "./pages/match-sim";

const PUBLIC_ROUTES = new Set(["#login", "#register", ""]);

async function guard() {
  if (!PUBLIC_ROUTES.has(location.hash)) {
    const token = (window as any).currentAccessToken ?? null;
    if (!token) {
      await refreshAccessToken();
      if (!(window as any).currentAccessToken) {
        location.hash = "#login";
        return false; // para que router pueda abortar
      }
    }
  }
  return true;
}

async function router() {
  const ok = await guard();
  if (!ok) return;

  const app = document.getElementById("app")!;
  app.querySelectorAll(".menu-btn").forEach(btn => btn.remove());

  const board = document.getElementById("board") as HTMLCanvasElement;
  const onPlay = location.hash === "#play";
  board.style.display = onPlay ? "block" : "none";

  switch (location.hash) {
    case "#play":
      unmountPanel();
      play();
      break;
    case "#tournament":
      unmountPanel();
      tournament();
      break;
    case "#match-sim":
      matchSim();
      break;
    case "#login":
      login();
      break;
    case "#register":
      register();
      break;
    case "#profile":
      profile();
      break;
    case "#dashboard":
      dashboard();
      break;
    case "#home":
      home();
      break;
    default:
      ((window as any).currentAccessToken) ? location.hash = "#home" : location.hash = "#login";
  }
}

window.addEventListener("hashchange", router);

// intenta restaurar sesión al arrancar (si hay refresh-cookie)
initAuth().then(router);
