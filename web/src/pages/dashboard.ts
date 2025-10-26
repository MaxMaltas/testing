import { mountPanel } from "../lib/panel";
import { getCurrentUser } from "../lib/auth";

export default function dashboard() {
  const user = getCurrentUser();

  mountPanel(`
    <div class="panel-card panel-card--xl">
      <h2 class="panel-title" style="margin-top:0">Dashboard</h2>

      <div style="width:min(1080px,94vw);margin:0 auto">
        <p><strong>Player:</strong> "\${user?.nickname ?? user?.mail ?? -}"</p>

        <!-- Tabs simples (sin framework) -->
        <div class="panel-actions" style="justify-content:flex-start;margin:12px 0 16px">
          <button class="btn btn-primary" id="tab-user">My Stats</button>
          <button class="btn" id="tab-game">Game Stats</button>
          <button class="btn" id="tab-history">Match History</button>
        </div>

        <!-- Contenedor de contenido -->
        <div id="dash-content" style="text-align:left;line-height:1.8">
          <ul>
            <li>Total matches: <strong>—</strong></li>
            <li>Wins / Losses: <strong>— / —</strong></li>
            <li>Win rate: <strong>—%</strong></li>
            <li>Best streak: <strong>—</strong></li>
          </ul>
        </div>

        <div class="panel-actions" style="margin-top:16px">
          <button class="btn btn-primary" id="back-home">Back</button>
        </div>
      </div>
    </div>
  `);

  const content = document.getElementById("dash-content")!;
  document.getElementById("tab-user")!.addEventListener("click", () => {
    content.innerHTML = `
      <ul>
        <li>Total matches: <strong>—</strong></li>
        <li>Wins / Losses: <strong>— / —</strong></li>
        <li>Win rate: <strong>—%</strong></li>
        <li>Best streak: <strong>—</strong></li>
      </ul>`;
  });
  document.getElementById("tab-game")!.addEventListener("click", () => {
    content.innerHTML = `
      <p>Game-wide stats (top players, global WR, heatmaps, etc.).</p>
      <ul><li>Top 10 players —</li><li>Avg match length —</li></ul>`;
  });
  document.getElementById("tab-history")!.addEventListener("click", () => {
    content.innerHTML = `
      <p>Recent matches:</p>
      <ol>
        <li>2025-10-01 vs Alice — W 5–3</li>
        <li>2025-09-30 vs Bob — L 4–5</li>
      </ol>`;
  });

  document.getElementById("back-home")!.addEventListener("click", () => { location.hash = "#home"; });
}
