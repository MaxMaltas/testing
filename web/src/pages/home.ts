import { mountPanel } from "../lib/panel";
import { logout, getCurrentUser, refreshAccessToken } from "../lib/auth";
import "../styles/home.css";

window.addEventListener("load", async () => {
  const token = await refreshAccessToken();
  if (!token) {
    const newToken = refreshAccessToken();
    if (!newToken) {
      console.log("\x1b[31m%s\x1b[0m", "Error al renovar el access token en /home");
      window.location.href = "#login";
    }
    console.log("\x1b[32m%s\x1b[0m", "Access token renovado automáticamente en /home");
    (window as any).currentAccessToken = newToken;
  }
});

//test
export default async function home() {
  const user = await getCurrentUser();

  const displayName = user?.display_name || "Loading...";

  mountPanel(`
    <div class="panel-card panel-card--xl">
      <header class="home-header">
        <h1 class="home-title">42_PONG</h1>

        <div class="home-userbar">
          <div class="home-user">
            <span class="user-label">Signed in as</span>
            <strong class="user-name">${displayName}</strong>
          </div>
          <div class="home-actions-right">
            <button class="btn btn-ghost" id="go-profile">Profile</button>
            <button class="btn btn-ghost" id="btn-logout">Logout</button>
          </div>
        </div>
      </header>

      <main class="home-cta">
        <button class="btn btn-primary btn-lg" id="go-play">PLAY GAME</button>
        <button class="btn btn-lg" id="go-tournament">CREATE TOURNAMENT</button>
        <button class="btn btn-lg" id="go-dashboard">VIEW DASHBOARD</button>
      </main>
    </div>
  `);

  document.getElementById("go-play")!.addEventListener("click", () => { location.hash = "#play"; });
  document.getElementById("go-tournament")!.addEventListener("click", () => { location.hash = "#tournament"; });
  document.getElementById("go-dashboard")!.addEventListener("click", () => { location.hash = "#dashboard"; });

  document.getElementById("go-profile")!.addEventListener("click", () => { location.hash = "#profile"; });
  document.getElementById("btn-logout")!.addEventListener("click", async () => {
     await logout();
     location.hash = "#login";
   });
}
