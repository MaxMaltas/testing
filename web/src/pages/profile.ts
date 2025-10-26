import { mountPanel } from "../lib/panel";
import { apiAuthUpload } from "../lib/upload";
import { logout , refreshAccessToken} from "../lib/auth";
import "../styles/profile.css";

window.addEventListener("load", () => {
  const token = window.currentAccessToken;
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

export default function profile() {

  mountPanel(`
    <div class="panel-card panel-card--xl">
      <h2 class="panel-title" style="margin-top:0">Profile</h2>

      <section class="profile-grid">
        <div class="avatar-col">
          <div class="avatar-wrap">
            <img id="avatar-img" class="avatar-img" src="\${user?.avatarUrl ?? "/avatar-placeholder.png"}" alt="Avatar" />
          </div>
          <label class="btn" for="avatar-file">Choose image</label>
          <input id="avatar-file" type="file" accept="image/*" style="display:none" />
          <button class="btn btn-primary" id="avatar-save">Save avatar</button>
          <p id="avatar-msg" class="panel-msg"></p>
        </div>

        <div class="info-col">
            <p><strong>Email:</strong> "\${user?.mail ?? "-"}"</p>
            <p><strong>Nickname:</strong> "\${user?.nickname ?? "(not set)"}" </p>

            <hr style="border:none;border-top:1px solid yellowgreen;opacity:.6;margin:12px 0">

            <h3 style="margin:8px 0">Stats</h3>
            <ul style="line-height:1.7;margin:0 0 8px 16px">
                <li>Total matches: <strong>—</strong></li>
                <li>Wins / Losses: <strong>— / —</strong></li>
                <li>Win rate: <strong>—%</strong></li>
            </ul>

            <h3 style="margin:8px 0">Recent Matches</h3>
            <ol style="line-height:1.7;margin:0 0 8px 18px">
                <li>2025-10-01 vs Alice — W 5–3</li>
                <li>2025-09-30 vs Bob — L 4–5</li>
            </ol>

            <div class="panel-actions" style="margin-top:1rem">
                <button class="btn btn-primary" id="back-home">Back</button>
                <button class="btn" id="do-logout">Logout</button>
            </div>
        </div>
      </section>
    </div>
  `);

  const img = document.getElementById("avatar-img") as HTMLImageElement | null;
  const fileInput = document.getElementById("avatar-file") as HTMLInputElement | null;
  const saveBtn = document.getElementById("avatar-save") as HTMLButtonElement | null;
  const msg = document.getElementById("avatar-msg") as HTMLParagraphElement | null;

  if (!img || !fileInput || !saveBtn || !msg) {
    console.warn("profile: UI elements missing", { img, fileInput, saveBtn, msg });
    return;
  }

  fileInput.addEventListener("change", () => {
    const f = fileInput.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { msg.textContent = "Select an image"; return; }
    if (f.size > 2 * 1024 * 1024) { msg.textContent = "Max 2MB"; return; }

    const url = URL.createObjectURL(f);
    img.src = url;
    msg.textContent = "Preview ready. Click Save avatar.";
  });

  // Guardar avatar (subida al backend)
  saveBtn.addEventListener("click", async () => {
    const f = fileInput.files?.[0];
    if (!f) { msg.textContent = "Choose an image first"; return; }

    msg.textContent = "Uploading...";
    saveBtn.disabled = true;

    const fd = new FormData();
    fd.append("avatar", f);
    // Si backend necesita userId o algo más, añadimo aquí:
    // fd.append("userId", "...");

    // TODO: crea este endpoint en el backend (ej. user service)
    // Devuélvenos { ok: true, avatarUrl: "https://..." }
    const res = await apiAuthUpload<{ ok: boolean; avatarUrl?: string; error?: string }>("/api/user/avatar", fd);

    saveBtn.disabled = false;

    if (!res.ok || !res.data.ok) {
      msg.textContent = res.ok ? (res.data.error ?? "Upload failed") : res.error;
      return;
    }

  });

  const backHome = document.getElementById("back-home");
  if (backHome) backHome.addEventListener("click", () => { location.hash = "#home"; });

  const doLogout = document.getElementById("do-logout");
  if (doLogout) doLogout.addEventListener("click", async () => {
    await logout();
    location.hash = "#login";
  });
}
