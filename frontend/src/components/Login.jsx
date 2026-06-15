// frontend/src/components/Login.jsx
import { useState } from "react";
import { login } from "../api.js";
import { connectSocket } from "../socket.js";

export default function Login({ onAuth }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      const token = await login(u, p);
      connectSocket(token);
      const me = JSON.parse(atob(token.split(".")[1]));
      onAuth({ token, id: me.id, name: me.name });
    } catch {
      setErr("Invalid credentials");
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center fade-in px-safe-margin relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center border border-primary/30 bg-primary/10">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          </div>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary text-center drop-shadow-[0_0_15px_rgba(255,176,207,0.3)]">
            Date Night
          </h1>
          <p className="font-label-caps text-label-caps text-on-surface-variant">Your private digital sanctuary.</p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="glass-card w-full p-8 flex flex-col gap-md">
          <div>
            <label className="font-label-caps text-label-caps text-on-surface-variant block mb-xs">Username</label>
            <input
              className="glass-input"
              placeholder="username"
              value={u}
              onChange={e => setU(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="font-label-caps text-label-caps text-on-surface-variant block mb-xs">Password</label>
            <input
              className="glass-input"
              type="password"
              placeholder="password"
              value={p}
              onChange={e => setP(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {err && <p className="text-error text-sm text-center">{err}</p>}
          <button
            type="submit"
            className="w-full py-sm rounded-full bg-primary text-on-primary font-title-sm text-title-sm tracking-wide hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,176,207,0.3)] mt-2">
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
