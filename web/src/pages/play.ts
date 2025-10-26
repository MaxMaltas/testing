import type { SpeedSetting, WinScore } from "../engine/pong";
import pong from "../engine/pong";
import { mountPanel, unmountPanel } from "../lib/panel";

export default function play() {
  // Seleccio partida local/remote
  mountPanel(`
    <div class="panel-card">
      <h2 class="panel-title" style="margin-top:0">Start a Match</h2>

      <form id="play-form" class="form-col" style="width:min(520px,92vw);margin:0 auto">
        <div class="panel-actions" style="justify-content:space-between">
          <button type="button" class="btn btn-primary" id="btnCreate">Create Remote</button>
          <button type="button" class="btn btn-primary" id="btnJoin">Join Remote</button>
          <button type="button" class="btn btn-primary" id="btnLocal">Play Local</button>
        </div>
      </form>

      <p id="play-msg" class="panel-msg"></p>

      <div class="panel-actions row">
        <button class="btn" id="back-home">Back</button>
      </div>
    </div>
  `);

  document.getElementById("back-home")!.addEventListener("click", () => { location.hash = "#home"; });
  document.getElementById("btnLocal")!.addEventListener("click", async () => {
    const { scoreToWin, gameSpeed } = await displaySettings();

    // Mostrar canvas y arrancar juego
    // ALES: Esto hace falta si ya se ejecuta desde pong() ??
    const board = document.getElementById("board") as HTMLCanvasElement;
    board.style.display = "block";
    const ctx = board.getContext("2d")!;
    ctx.clearRect(0, 0, board.width, board.height);

    unmountPanel();
    pong(scoreToWin, gameSpeed);
  });
  document.getElementById("btnCreate")!.addEventListener("click", async () => {
    const { scoreToWin, gameSpeed } = await displaySettings();
    const { matchId } = await createRemote(scoreToWin, gameSpeed);
    if (matchId)
      await joinRemote(matchId);
    
    // tmp debug
    const msg = document.getElementById("play-msg")!;
    msg.style.color = "red";
    msg.style.marginTop = "16px";
    msg.textContent = matchId || "Error";
  });
  document.getElementById("btnJoin")!.addEventListener("click", async () => {
    mountPanel(`
      <div class="panel-card">
        <h2 class="panel-title" style="margin-top:0">Join Remote Match</h2>

        <form id="join-form" class="form-col" style="width:min(520px,92vw);margin:0 auto">
          <label class="field">
            <span class="label">Match ID</span>
            <input id="join-id" type="text" minlength="4" maxlength="4" required pattern="^[A-Z0-9]{4}$" placeholder="****" autocomplete="off" />
          </label>

          <button class="btn btn-primary">Join Match</button>
        </form>

        <p id="play-msg" class="panel-msg"></p>

        <div class="panel-actions" row">
          <button type="button" class="btn" id="btnBack">Back</button>
        </div>
      </div>
    `);

    document.getElementById("btnBack")!.addEventListener("click", () => {
      play();
    });

    document.getElementById("join-form")!.addEventListener("submit", async (e) => {
      e.preventDefault();
      const matchId = (document.getElementById("join-id") as HTMLInputElement).value.trim();
      const msg = document.getElementById("play-msg")!;
      msg.style.color = "red";
      msg.style.marginTop = "16px";

      if (matchId.length !== 4) {
        msg.textContent = "Match ID must be exactly 4 characters.";
        return;
      }

      const res = await joinRemote(matchId);

      if (res && res.status === 200) {
        msg.style.color = "green";
        msg.textContent = "Succesful join";
      }
      else {
        msg.textContent = res.error || "Unexpected error";
      }
    });
  });

  function displaySettings(): Promise<{ scoreToWin: WinScore, gameSpeed: SpeedSetting }> {
    // Form de opciones en el panel
    mountPanel(`
      <div class="panel-card">
        <h2 class="panel-title" style="margin-top:0">Game Settings</h2>

        <form id="play-form" class="form-col" style="width:min(520px,92vw);margin:0 auto">
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

          <button class="btn btn-primary" id="start-game">Start game</button>
        </form>

        <p id="play-msg" class="panel-msg"></p>

        <div class="panel-actions" row">
          <button class="btn" id="btnBack">Back</button>
        </div>
      </div>
    `);

    // Igualamos estilos de <select> a los inputs/botones del panel sin CSS extra
    const form = document.getElementById("play-form") as HTMLFormElement;
    form.querySelectorAll("select").forEach(s => {
      (s as HTMLSelectElement).style.width = "100%";
      (s as HTMLSelectElement).style.padding = "10px 12px";
      (s as HTMLSelectElement).style.border = "2px solid yellowgreen";
      (s as HTMLSelectElement).style.background = "#111";
      (s as HTMLSelectElement).style.color = "#fff";
      (s as HTMLSelectElement).style.fontFamily = "'Press Start 2P', monospace";
      (s as HTMLSelectElement).style.fontSize = "14px";
      (s as HTMLSelectElement).style.outline = "none";
    });

    document.getElementById("btnBack")!.addEventListener("click", () => {
      play();
    });

    return new Promise(resolve => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const scoreSel = document.getElementById("score") as HTMLSelectElement;
        const speedSel = document.getElementById("speed") as HTMLSelectElement;

        const scoreToWin = parseInt(scoreSel.value, 10) as WinScore;   // 5|11|15|21
        const gameSpeed = speedSel.value as SpeedSetting;              // "slow"|"medium"|"fast"

        resolve ({ scoreToWin, gameSpeed });
      });
    });
  }

  async function createRemote(scoreToWin: WinScore, gameSpeed: SpeedSetting) {
    const	res = await fetch("/api/match/create-remote", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scoreToWin, gameSpeed })
    });
    return await res.json();
  }

  async function joinRemote(matchId: string) {
    const	res = await fetch(`/api/match/join-remote?Id=${matchId}`, { method: "POST", credentials: "include" });
    const	data = await res.json();
    return { status: res.status, ...data };
  }

}
