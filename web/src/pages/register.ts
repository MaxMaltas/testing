import { apiPost } from "../lib/api";
import { mountPanel } from "../lib/panel";
import { RegisterBody, AuthResponse } from "../types";
import "../styles/register.css"; // usa los estilos de abajo

export default function register() {
  mountPanel(`
    <div class="panel-card">
      <h2 id="panel-title" class="panel-title">Register</h2>
      <form id="form-register" class="form-col" autocomplete="on">
        <label class="field">
          <span class="label">Nickname</span>
          <input id="reg-nickname" type="text" placeholder="Nickname" minlength="3" required autocomplete="nickname" />
        </label>

        <label class="field">
          <span class="label">Email</span>
          <input id="reg-mail" type="email" placeholder="you@example.com" required autocomplete="email" />
        </label>

        <label class="field">
          <span class="label">Password</span>
          <input id="reg-password" type="password" placeholder="••••••••" required autocomplete="new-password" />
        </label>

        <label class="field">
          <span class="label">Confirm password</span>
          <input id="reg-password2" type="password" placeholder="••••••••" required autocomplete="new-password" />
        </label>

        <button class="btn btn-primary" id="btn-register">Create account</button>
      </form>

      <p id="reg-msg" class="panel-msg"></p>

      <div class="panel-actions row">
        <button class="btn" id="to-login">Back to Login</button>
      </div>
    </div>
  `);

  const form = document.getElementById("form-register") as HTMLFormElement;
  const msg = document.getElementById("reg-msg")!;
  const toLogin = document.getElementById("to-login")!;
  // const backHome = document.getElementById("back-home")!;
  const btnRegister = document.getElementById("btn-register") as HTMLButtonElement;

  function setBusy(busy: boolean) {
    btnRegister.disabled = busy;
    btnRegister.textContent = busy ? "Creating..." : "Create account";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    setBusy(true);

    const nickname = (document.getElementById("reg-nickname") as HTMLInputElement).value.trim();
    const mail = (document.getElementById("reg-mail") as HTMLInputElement).value.trim();
    const password = (document.getElementById("reg-password") as HTMLInputElement).value;
    const password2 = (document.getElementById("reg-password2") as HTMLInputElement).value;

    if (!nickname || nickname.length < 3) { msg.textContent = "Nickname too short"; setBusy(false); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { msg.textContent = "Invalid email"; setBusy(false); return; }
    if (!password || password.length < 6) { msg.textContent = "Password too short (min 6)"; setBusy(false); return; }
    if (password !== password2) { msg.textContent = "Passwords do not match"; setBusy(false); return; }

    const payload: RegisterBody = { nickname, mail, password };
    const res = await apiPost<AuthResponse>("/api/auth/register", payload);

    setBusy(false);

    if (!res.ok) {
      msg.textContent = `Register failed: ${res.error}${res.status ? ` (HTTP ${res.status})` : ""}`;
      return;
    }
    if (!res.data.ok) {
      msg.textContent = res.data.error ?? "Register failed";
      return;
    }

    msg.textContent = "Account created. Go to login.";
    setTimeout(() => { location.hash = "#login"; }, 300);
  });

  toLogin.addEventListener("click", () => { location.hash = "#login"; });
  // backHome.addEventListener("click", () => { location.hash = "#"; }); // aqui donava typeerror pq el boto 'back-home' no existeix al html
}
