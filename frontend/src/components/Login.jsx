// frontend/src/components/Login.jsx
import { useState } from "react";
import { login } from "../api.js";
import { connectSocket } from "../socket.js";

export function restoreSession(onAuth) {
  const token = sessionStorage.getItem("dn_token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      sessionStorage.removeItem("dn_token");
      return false;
    }
    connectSocket(token);
    onAuth({ token, id: payload.id, name: payload.name });
    return true;
  } catch {
    sessionStorage.removeItem("dn_token");
    return false;
  }
}

export default function Login({ onAuth }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      const token = await login(u, p);
      const me = JSON.parse(atob(token.split(".")[1]));
      sessionStorage.setItem("dn_token", token);
      connectSocket(token);
      onAuth({ token, id: me.id, name: me.name });
    } catch {
      setErr("Invalid credentials");
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex items-center justify-center glow-bg p-safe-margin font-body-md">
      <main className="w-full max-w-[600px] flex flex-col items-center gap-xl relative z-10 fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center gap-md text-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-[0_0_30px_rgba(255,176,207,0.3)] border border-white/10 bg-surface flex items-center justify-center">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 64, fontVariationSettings: "'FILL' 1" }}>favorite</span>
          </div>
          <div>
            <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-2">Date Night</h1>
            <p className="font-body-md text-body-md text-on-surface-variant/80">Your private digital sanctuary.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="w-full flex flex-col gap-md">
          {/* Username */}
          <div className="bg-white/[0.08] backdrop-blur-md border border-white/20 rounded-full px-md py-sm flex items-center gap-sm transition-all focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(255,176,207,0.1)]">
            <span className="material-symbols-outlined text-primary/70">person</span>
            <input
              className="bg-transparent border-none outline-none w-full text-on-surface placeholder:text-on-surface-variant/50 font-body-md text-body-md"
              placeholder="Username"
              type="text"
              value={u}
              onChange={e => setU(e.target.value)}
              autoComplete="username"
            />
          </div>
          {/* Password */}
          <div className="bg-white/[0.08] backdrop-blur-md border border-white/20 rounded-full px-md py-sm flex items-center gap-sm transition-all focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(255,176,207,0.1)]">
            <span className="material-symbols-outlined text-primary/70">lock</span>
            <input
              className="bg-transparent border-none outline-none w-full text-on-surface placeholder:text-on-surface-variant/50 font-body-md text-body-md"
              placeholder="Password"
              type="password"
              value={p}
              onChange={e => setP(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {err && <p className="text-error text-sm text-center">{err}</p>}
          <button
            type="submit"
            className="mt-sm w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-title-sm text-title-sm py-sm rounded-full shadow-[0_4px_20px_rgba(255,176,207,0.4)] hover:shadow-[0_6px_25px_rgba(255,176,207,0.6)] active:scale-95 transition-all duration-300 h-12 flex items-center justify-center">
            Enter
          </button>
        </form>
      </main>
    </div>
  );
}
