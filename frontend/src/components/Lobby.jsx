import { getSocket } from "../socket.js";
import { useCountdown } from "../hooks/useCountdown.js";
import Projectiles from "./Projectiles.jsx";

export default function Lobby({ me, state }) {
  const { label, done } = useCountdown();
  const throwIt = (kind) => getSocket()?.emit("lobby:throw", { kind });
  const begin = () => getSocket()?.emit("lobby:begin");
  const iBegan = state.begin[me.id];
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      <Projectiles />
      <h2 className="text-3xl mb-2 text-rosegold">The Lobby</h2>
      <p className="text-xl mb-6">Date begins in {label}</p>
      <div className="flex gap-6 mb-8">
        <button onClick={()=>throwIt("heart")} className="text-5xl hover:scale-125 transition">❤️</button>
        <button onClick={()=>throwIt("pie")} className="text-5xl hover:scale-125 transition">🥧</button>
      </div>
      <p className="text-sm text-cream/60 mb-4">Throw hearts & pies at your partner while you wait!</p>
      {done && (
        <button onClick={begin} disabled={iBegan}
          className="px-6 py-3 rounded-full bg-rosegold text-navy font-bold disabled:opacity-50">
          {iBegan ? "Waiting for partner…" : "Begin the date 💞"}
        </button>
      )}
    </div>
  );
}
