// frontend/src/components/Stage1Cards.jsx
import { useState } from "react";
import { getSocket } from "../socket.js";

const GAMES = [
  { name: "It Takes Two",  emoji: "🧵", desc: "A story of love, trust, and cooperation." },
  { name: "Unravel Two",   emoji: "🧶", desc: "Two yarns, one adventure." },
  { name: "Portal 2",      emoji: "🌀", desc: "Think with portals. Together." },
];

export default function Stage1Cards({ me, state }) {
  const [flipped, setFlipped] = useState([false, false, false]);
  const partnerId = me.id === "A" ? "B" : "A";
  const flip = (i) => setFlipped(f => f.map((v, idx) => idx === i ? !v : v));
  const confirm = () => getSocket()?.emit("stage1:confirm");
  const iDone      = state.stage1[`${me.id}_done`];
  const partnerDone = state.stage1[`${partnerId}_done`];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 fade-in">
      <h2 className="font-display text-4xl text-dn-text mb-2 text-center">Pick your game</h2>
      <p className="text-dn-muted text-sm mb-10 tracking-wide">flip a card to reveal</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 w-full max-w-3xl">
        {GAMES.map((g, i) => (
          <div key={i} onClick={() => flip(i)} className="cursor-pointer h-64"
            style={{ perspective: "1000px" }}>
            <div className="relative w-full h-full transition-transform duration-500"
              style={{ transformStyle: "preserve-3d", transform: flipped[i] ? "rotateY(180deg)" : "none" }}>
              <div className="absolute inset-0 glass flex items-center justify-center text-6xl"
                style={{ backfaceVisibility: "hidden" }}>❓</div>
              <div className="absolute inset-0 glass-rose flex flex-col items-center justify-center p-5 gap-3"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                <div className="text-6xl">{g.emoji}</div>
                <div className="font-display text-xl text-dn-rose text-center">{g.name}</div>
                <div className="text-dn-muted text-xs text-center">{g.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={confirm} disabled={iDone}
        className="px-8 py-3 rounded-pill bg-dn-rose-bright text-dn-bg font-bold disabled:opacity-50 hover:opacity-90 transition mb-4">
        We both finished this game ✓
      </button>
      <p className="text-sm text-dn-muted">
        You {iDone ? "✓" : "…"} · Partner: {partnerDone ? "✓" : "waiting…"}
      </p>
    </div>
  );
}
