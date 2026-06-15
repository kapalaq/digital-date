// frontend/src/components/Stage1Cards.jsx
import { useState } from "react";
import { getSocket } from "../socket.js";

const GAMES = [
  { name: "It Takes Two",  emoji: "🧵", desc: "A story of love, trust, and cooperation." },
  { name: "Unravel Two",   emoji: "🧶", desc: "Two yarns, one adventure." },
  { name: "Portal 2",      emoji: "🌀", desc: "Think with portals. Together." },
];

export default function Stage1Cards({ me, state }) {
  const [selected, setSelected] = useState(null);
  const partnerId = me.id === "A" ? "B" : "A";
  const iDone      = state.stage1[`${me.id}_done`];
  const partnerDone = state.stage1[`${partnerId}_done`];
  const confirm = () => getSocket()?.emit("stage1:confirm");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 fade-in">
      <h2 className="font-display text-4xl text-dn-text mb-1 text-center">Pick a Game</h2>
      <p className="text-dn-muted text-sm mb-8 tracking-wide text-center">
        Find a game that sparks your interest. You both must agree!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full max-w-3xl">
        {GAMES.map((g, i) => {
          const isSelected = selected === i;
          return (
            <div key={i}
              onClick={() => setSelected(i)}
              className={`cursor-pointer flex flex-col items-center gap-4 p-6 transition-all
                ${isSelected ? "glass-rose" : "glass hover:border-dn-rose/40"}`}
              style={isSelected ? {
                boxShadow: "0 0 20px rgba(255,176,207,0.2)",
                borderColor: "rgba(255,176,207,0.5)",
              } : {}}>
              <div className="text-5xl">{g.emoji}</div>
              <div className="font-display text-xl text-dn-rose text-center">{g.name}</div>
              <div className="text-dn-muted text-xs text-center">{g.desc}</div>
              <button
                onClick={e => { e.stopPropagation(); setSelected(i); }}
                className={`px-5 py-1.5 rounded-pill text-xs font-bold transition-all mt-auto
                  ${isSelected
                    ? "bg-dn-rose-bright text-dn-bg"
                    : "border border-dn-rose/40 text-dn-rose hover:bg-dn-rose/10"}`}>
                {isSelected ? "Selected ✓" : "Select"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Player status */}
      <div className="flex gap-3 mb-6">
        {["A", "B"].map(pid => {
          const done = state.stage1[`${pid}_done`];
          const isMe = pid === me.id;
          return (
            <div key={pid}
              className="flex items-center gap-2 px-4 py-2 rounded-pill text-xs font-semibold"
              style={{
                background: done ? "rgba(255,176,207,0.15)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${done ? "rgba(255,176,207,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: done ? "#ffb0cf" : "#a28b92",
              }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: done ? "#ffb0cf" : "#555" }} />
              {isMe ? "You" : (pid === "A" ? "User A" : "User B")} — {done ? "Ready ✓" : "Picking…"}
            </div>
          );
        })}
      </div>

      <button onClick={confirm} disabled={iDone || selected === null}
        className="px-8 py-3 rounded-pill bg-dn-rose-bright text-dn-bg font-bold disabled:opacity-50 hover:opacity-90 transition">
        We both finished this game ✓
      </button>
      {partnerDone && !iDone && (
        <p className="text-sm text-dn-violet mt-3 animate-pulse">Partner is ready!</p>
      )}
    </div>
  );
}
