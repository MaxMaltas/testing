import { mountPanel, unmountPanel } from "../lib/panel";
import { LoginBody, AuthResponse } from "../types";
import { googleOAuthLogin, loginUser} from "../lib/auth";
import "../styles/register.css";

export default function login() {

  mountPanel(`
     <div class="panel-card">
      <h2 id="panel-title" class="panel-title" style="margin-top:0">Login</h2>

      <form id="form-login" class="form-col" autocomplete="on">
        <label class="field">
          <span class="label">Email</span>
          <input id="login-mail" type="email" placeholder="you@example.com" required autocomplete="email" />
        </label>

        <label class="field">
          <span class="label">Password</span>
          <input id="login-password" type="password" placeholder="••••••••" required autocomplete="current-password" />
        </label>

        <button class="btn btn-primary" id="btn-login">Login</button>
      </form>

      <p id="login-msg" class="panel-msg"></p>

      <div class="panel-actions row">
        <button class="btn" id="to-register">Create account</button>
         <button class="btn" id="btn-google">Sign in with Google</button>
      </div>
    </div>
  `);

  const form = document.getElementById("form-login") as HTMLFormElement | null;
  const msg = document.getElementById("login-msg");
  const toRegister = document.getElementById("to-register");
  const btnLogin = document.getElementById("btn-login") as HTMLButtonElement | null;
  const btnGoogle = document.getElementById("btn-google") as HTMLButtonElement | null;

  if (!form) {
    console.warn("login: form-login not found");
    return; // nothing to do
  }
  if (!msg || !toRegister || !btnLogin || !btnGoogle) {
    console.warn("login: UI elements missing", { msg, toRegister, btnLogin, btnGoogle });
    return;
  }

  function setBusy(busy: boolean) {
    if (btnLogin) btnLogin.disabled = busy;
    if (btnGoogle) btnGoogle.disabled = busy;
    if (btnLogin) btnLogin.textContent = busy ? "Logging in..." : "Login";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    setBusy(true);

    const mail = (document.getElementById("login-mail") as HTMLInputElement).value.trim();
    const password = (document.getElementById("login-password") as HTMLInputElement).value;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { msg.textContent = "Invalid email"; setBusy(false); return; }
    if (!password) { msg.textContent = "Password required"; setBusy(false); return; }

    try {
      await loginUser(mail, password);
      msg.textContent = "Login OK!";
      setTimeout(() => { unmountPanel(); location.hash = "#home"; }, 250);
    } catch (err: any) {
      msg.textContent = `Login failed: ${err?.message ?? err}`;  //TODO: fix error message
    } finally {
      setBusy(false);
    }
  });

  btnGoogle.addEventListener("click", () => {
    googleOAuthLogin();
  });

  toRegister.addEventListener("click", () => { location.hash = "#register"; });
}
