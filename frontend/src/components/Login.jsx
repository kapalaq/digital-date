import { useState } from "react";
import { login } from "../api.js";
import { connectSocket } from "../socket.js";

export default function Login({ onAuth }) {
  const [u,setU]=useState(""); const [p,setP]=useState(""); const [err,setErr]=useState("");
  async function submit(e){ e.preventDefault();
    try { const token = await login(u,p); connectSocket(token);
      const me = JSON.parse(atob(token.split(".")[1])); onAuth({ token, id: me.id, name: me.name }); }
    catch { setErr("Invalid credentials"); }
  }
  return (
    <div className="min-h-screen flex items-center justify-center fade-in">
      <form onSubmit={submit} className="bg-navy/60 p-8 rounded-2xl shadow-xl w-80 border border-rosegold/30">
        <h1 className="text-2xl mb-4 text-rosegold">Date Night 💕</h1>
        <input className="w-full mb-3 p-2 rounded bg-cream/10" placeholder="username" value={u} onChange={e=>setU(e.target.value)} />
        <input className="w-full mb-3 p-2 rounded bg-cream/10" type="password" placeholder="password" value={p} onChange={e=>setP(e.target.value)} />
        {err && <p className="text-red-300 text-sm mb-2">{err}</p>}
        <button className="w-full p-2 rounded bg-rosegold text-navy font-bold">Enter</button>
      </form>
    </div>
  );
}
