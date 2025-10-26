import pong from "../engine/pong";
import { mountPanel, unmountPanel } from "../lib/panel";

export default function tournament() {
  // Paso 1: configuración del torneo en panel
  mountPanel(`
    <div class="panel-card panel-card--xl">
      <h2 class="panel-title" style="margin-top:0">Create Tournament</h2>

      <form id="tour-form" class="form-col" style="width:min(640px,94vw);margin:0 auto">
        <label class="field">
          <span class="label">Number of players</span>
          <select id="players" required>
            <option value="4">4</option>
            <option value="8" selected>8</option>
            <option value="16">16</option>
            <option value="32">32</option>
          </select>
        </label>

        <label class="field">
          <span class="label">Score to win</span>
          <select id="score" required>
            <option value="5">5</option>
            <option value="11" selected>11</option>
            <option value="15">15</option>
            <option value="21">21</option>
          </select>
        </label>

        <label class="field">
          <span class="label">Game speed</span>
          <select id="speed" required>
            <option value="slow">Slow</option>
            <option value="medium" selected>Medium</option>
            <option value="fast">Fast</option>
          </select>
        </label>

        <div class="panel-actions" style="justify-content:space-between">
          <button type="button" class="btn" id="back-home">Back</button>
          <button class="btn btn-primary" id="next">Next</button>
        </div>
      </form>
    </div>
  `);

  document.querySelectorAll("#tour-form select").forEach((s) => {
    const el = s as HTMLSelectElement;
    el.style.width = "100%";
    el.style.padding = "10px 12px";
    el.style.border = "2px solid yellowgreen";
    el.style.background = "#111";
    el.style.color = "#fff";
    el.style.fontFamily = "'Press Start 2P', monospace";
    el.style.fontSize = "14px";
    el.style.outline = "none";
  });

  document.getElementById("back-home")!.addEventListener("click", () => {
    location.hash = "#home";
  });

  document.getElementById("next")!.addEventListener("click", (e) => {
    e.preventDefault();
    const players = parseInt((document.getElementById("players") as HTMLSelectElement).value, 10);
    const scoreToWin = parseInt((document.getElementById("score") as HTMLSelectElement).value, 10);
    const speed = (document.getElementById("speed") as HTMLSelectElement).value;

    // Paso 2: entrada de nombres (simple).Se puede mejorar
    const defaultNames = Array.from({ length: players }, (_, i) => `PLAYER${i + 1}`);
    const inputs = defaultNames.map((n, i) => `
      <label class="field">
        <span class="label">Player ${i + 1}</span>
        <input type="text" id="p-${i}" value="${n}" />
      </label>`).join("");

    mountPanel(`
      <div class="panel-card panel-card--xl">
        <h2 class="panel-title" style="margin-top:0">Players</h2>
        <form id="names-form" class="form-col" style="width:min(720px,96vw);margin:0 auto">
          ${inputs}
          <div class="panel-actions" style="justify-content:space-between">
            <button type="button" class="btn" id="back-conf">Back</button>
            <button class="btn btn-primary" id="start-tournament">Start Tournament</button>
          </div>
        </form>
      </div>
    `);

    document.getElementById("back-conf")!.addEventListener("click", () => tournament());

    document.getElementById("start-tournament")!.addEventListener("click", (ev) => {
      ev.preventDefault();
      const names: string[] = [];
      for (let i = 0; i < players; i++) {
        const v = (document.getElementById(`p-${i}`) as HTMLInputElement).value.trim() || `PLAYER${i + 1}`;
        names.push(v);
      }

      // Aquí podríamos construir el árbol de emparejamientos y mostrar rondas en panel.
      // De momento, lanzamos el primer partido en el canvas con la config elegida.
      const board = document.getElementById("board") as HTMLCanvasElement;
      board.style.display = "block";
      const ctx = board.getContext("2d")!;
      ctx.clearRect(0, 0, board.width, board.height);

      unmountPanel();

      // TODO: Integrar flujo de torneos real (rondas, bracket, etc.)
      // Por ahora iniciamos un partido normal:
      pong(scoreToWin as any, speed as any);
    });
  });
}
