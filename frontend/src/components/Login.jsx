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
    <div className="min-h-screen flex items-center justify-center fade-in px-4">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <h1 className="font-display text-5xl text-dn-rose text-center">Date Night</h1>
        <p className="text-dn-muted text-xs tracking-widest uppercase">your private sanctuary</p>
        <form onSubmit={submit} className="glass w-full p-8 flex flex-col gap-4">
          <input
            className="glass-input"
            placeholder="username"
            value={u}
            onChange={e => setU(e.target.value)}
          />
          <input
            className="glass-input"
            type="password"
            placeholder="password"
            value={p}
            onChange={e => setP(e.target.value)}
          />
          {err && <p className="text-red-400 text-sm text-center">{err}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-pill bg-dn-rose-bright text-dn-bg font-bold text-sm tracking-wide hover:opacity-90 transition mt-2">
            Begin the night
          </button>
        </form>
      </div>
    </div>
  );
}
