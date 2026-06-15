import { useState } from "react";
import { getSocket } from "../socket.js";

const GAMES = [
  { name: "It Takes Two", emoji: "🧵", grad: "from-pink-500 to-purple-600" },
  { name: "Unravel Two", emoji: "🧶", grad: "from-amber-500 to-rose-600" },
  { name: "Portal 2", emoji: "🌀", grad: "from-sky-500 to-indigo-700" },
];

export default function Stage1Cards({ me, state }) {
  const [flipped, setFlipped] = useState([false,false,false]);
  const partnerId = me.id === "A" ? "B" : "A";
  const flip = (i) => setFlipped(f => f.map((v,idx)=> idx===i ? !v : v));
  const confirm = () => getSocket()?.emit("stage1:confirm");
  const iDone = state.stage1[`${me.id}_done`];
  const partnerDone = state.stage1[`${partnerId}_done`];
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl mb-6 text-rosegold">Pick your co-op game</h2>
      <div className="flex gap-4 flex-wrap justify-center mb-8">
        {GAMES.map((g,i)=>(
          <div key={i} onClick={()=>flip(i)} className="w-44 h-60 cursor-pointer" style={{ perspective: "1000px" }}>
            <div className="relative w-full h-full transition-transform duration-500"
              style={{ transformStyle: "preserve-3d", transform: flipped[i] ? "rotateY(180deg)" : "none" }}>
              <div className="absolute inset-0 rounded-xl bg-navy border-2 border-rosegold/40 flex items-center justify-center text-6xl"
                style={{ backfaceVisibility: "hidden" }}>❓</div>
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${g.grad} flex flex-col items-center justify-center p-3`}
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                <div className="text-6xl mb-3">{g.emoji}</div>
                <div className="text-center font-bold">{g.name}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={confirm} disabled={iDone}
        className="px-6 py-3 rounded-full bg-rosegold text-navy font-bold disabled:opacity-50 mb-3">
        We both finished this game ✓
      </button>
      <p className="text-sm">You {iDone ? "✓" : "…"} | Partner: {partnerDone ? "✓" : "waiting…"}</p>
    </div>
  );
}
