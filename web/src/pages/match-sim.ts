import { mountPanel } from "../lib/panel";

export default function matchSim() {
  mountPanel(`
    <div class="panel-card panel-card--xl">
      <h2 class="panel-title" style="margin-top:0">Match Simulator</h2>

      <div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr));gap:16px">
        <form id="create" class="panel card" style="padding:12px">
          <h3 style="margin:0 0 8px">Create match</h3>
          <label class="form-field">
            <span>User 1 ID</span>
            <input id="u1" type="number" min="1" required class="input">
          </label>
          <label class="form-field">
            <span>Target</span>
            <input id="tg" type="number" min="1" value="5" required class="input">
          </label>
          <button type="submit" class="btn btn-primary" style="margin-top:8px">Create</button>
        </form>

        <form id="attach" class="panel card" style="padding:12px">
          <h3 style="margin:0 0 8px">Attach & start</h3>
          <label class="form-field">
            <span>Match ID</span>
            <input id="attach-id" type="number" min="1" required class="input">
          </label>
          <button type="submit" class="btn" style="margin-top:8px">Attach & Start</button>
        </form>

        <form id="addp2" class="panel card" style="padding:12px">
          <h3 style="margin:0 0 8px">Add Player 2</h3>
          <label class="form-field">
            <span>Match ID</span>
            <input id="p2-mid" type="number" min="1" required class="input">
          </label>
          <label class="form-field">
            <span>Player 2 ID</span>
            <input id="p2-id" type="number" min="1" required class="input">
          </label>
          <button type="submit" class="btn" style="margin-top:8px">Add Player 2</button>
        </form>
      </div>

      <div id="live" style="display:none;margin-top:16px">
        <div style="margin:.25rem 0 .5rem">Match ID: <strong><span id="mid"></span></strong></div>
        <div class="panel-actions" style="justify-content:flex-start;margin:.25rem 0 .5rem">
          <button id="start" class="btn btn-primary">Start</button>
          <button id="back" class="btn">Back</button>
        </div>
        <div style="font-size:1.25rem;margin:.5rem 0;">
          Score: <span id="s1">0</span> - <span id="s2">0</span>
        </div>
        <div class="panel-actions" style="justify-content:flex-start">
          <button id="p1" class="btn">+1 User 1</button>
          <button id="p2" class="btn">+1 User 2</button>
        </div>
        <div id="msg" style="margin-top:.5rem;color:#888;"></div>
      </div>
    </div>
  `);

  const base = "/api/match";

  const createForm = document.getElementById("create") as HTMLFormElement;
  const u1 = document.getElementById("u1") as HTMLInputElement;
  const tg = document.getElementById("tg") as HTMLInputElement;

  const attachForm = document.getElementById("attach") as HTMLFormElement;
  const attachId = document.getElementById("attach-id") as HTMLInputElement;

  const addP2Form = document.getElementById("addp2") as HTMLFormElement;
  const p2Mid = document.getElementById("p2-mid") as HTMLInputElement;
  const p2Id = document.getElementById("p2-id") as HTMLInputElement;

  const live = document.getElementById("live") as HTMLDivElement;
  const mid = document.getElementById("mid") as HTMLSpanElement;
  const s1 = document.getElementById("s1") as HTMLSpanElement;
  const s2 = document.getElementById("s2") as HTMLSpanElement;
  const startBtn = document.getElementById("start") as HTMLButtonElement;
  const backBtn = document.getElementById("back") as HTMLButtonElement;
  const p1 = document.getElementById("p1") as HTMLButtonElement;
  const p2 = document.getElementById("p2") as HTMLButtonElement;
  const msg = document.getElementById("msg") as HTMLDivElement;

  let currentMatchId: number | null = null;
  let score1 = 0;
  let score2 = 0;

  function note(t: string) {
    msg.textContent = t;
    setTimeout(() => (msg.textContent = ""), 1500);
  }

async function postJSON(url: string, body?: unknown) {
  const opts: RequestInit = { method: "POST" };
  if (body !== undefined && body !== null) {
    opts.headers = { "Content-Type": "application/json" };
    opts.body = JSON.stringify(body);
  }
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(String(r.status));
  try { return await r.json(); } catch { return {}; }
}

  function attachToMatch(id: number) {
    currentMatchId = id;
    mid.textContent = String(id);
    score1 = 0; score2 = 0;
    s1.textContent = "0"; s2.textContent = "0";
    live.style.display = "block";
  }

  // Create with ONLY player1 + target
  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const payload = {
        user1_id: Number(u1.value),
        target_score: Number(tg.value),
      };
      const res = await postJSON(`${base}/new`, payload);
      const id = Number((res as any).id ?? 0);
      if (!id) throw new Error("no id");
      attachToMatch(id);
      note("Match created");
    } catch (err) {
      note("Error creating match");
      console.error(err);
    }
  });

  // Attach by ID and immediately start it
  attachForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = Number(attachId.value);
    if (!id) { note("Invalid ID"); return; }
    attachToMatch(id);
    try {
      await postJSON(`${base}/${id}/start`);
      note("Attached and started");
    } catch (err) {
      note("Attached, but failed to start");
      console.error(err);
    }
  });

  // Add Player 2 later
  addP2Form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = Number(p2Mid.value);
    const player = Number(p2Id.value);
    if (!id || !player) { note("Invalid inputs"); return; }
    try {
      await postJSON(`${base}/${id}/add-player`, { player2_id: player }); // expects backend route
      note("Player 2 added");
    } catch (err) {
      note("Error adding player 2");
      console.error(err);
    }
  });

  // Manual Start (if you created now)
  startBtn.addEventListener("click", async () => {
    if (!currentMatchId) return;
    try {
      await postJSON(`${base}/${currentMatchId}/start`);
      note("Match started");
    } catch (err) {
      note("Error starting match");
      console.error(err);
    }
  });

  // Score buttons
p1.addEventListener("click", async () => {
  if (!currentMatchId) return;
  try {
    await postJSON(`${base}/${currentMatchId}/score/1`); // no body needed
    s1.textContent = String(++score1);
  } catch (err) { note("Error scoring"); console.error(err); }
});

p2.addEventListener("click", async () => {
  if (!currentMatchId) return;
  try {
    await postJSON(`${base}/${currentMatchId}/score/2`); // no body needed
    s2.textContent = String(++score2);
  } catch (err) { note("Error scoring"); console.error(err); }
});


  backBtn.addEventListener("click", () => { location.hash = "#home"; });
}
