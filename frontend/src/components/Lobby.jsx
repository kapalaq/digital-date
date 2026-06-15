import { useState, useCallback, useRef } from "react";
import { getSocket } from "../socket.js";
import { useCountdown } from "../hooks/useCountdown.js";
import Projectiles from "./Projectiles.jsx";

export default function Lobby({ me, state }) {
  const { label, done } = useCountdown();
  // hit state: { A: { kind, ts } | null, B: { kind, ts } | null }
  const [hitEffects, setHitEffects] = useState({ A: null, B: null });
  const [isDodging, setIsDodging] = useState(false);
  const isDodgingRef = useRef(false);

  const throwIt = (kind) => getSocket()?.emit("lobby:throw", { kind });
  const begin   = () => getSocket()?.emit("lobby:begin");
  const iBegan  = state.begin[me.id];

  const dodge = () => {
    if (isDodgingRef.current) return;
    setIsDodging(true);
    isDodgingRef.current = true;
    setTimeout(() => { setIsDodging(false); isDodgingRef.current = false; }, 1500);
  };

  // stable ref — captures isDodging via ref so Projectiles never re-subscribes
  const onHit = useCallback((kind, target) => {
    if (target === me.id && isDodgingRef.current) return;
    const ts = Date.now();
    setHitEffects(h => ({ ...h, [target]: { kind, ts } }));
    setTimeout(() => setHitEffects(h => {
      if (h[target]?.ts !== ts) return h;
      return { ...h, [target]: null };
    }), 2200);
  }, [me.id]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <Projectiles meId={me.id} onHit={onHit} />

      <h2 className="text-3xl mb-1 text-rosegold font-bold">The Lobby 💕</h2>
      <p className="text-lg mb-8 text-cream/70">Date begins in <span className="text-rosegold font-semibold">{label}</span></p>

      {/* Avatar arena */}
      <div className="flex items-end justify-center gap-6 mb-6 w-full max-w-lg px-4">
        <AvatarSlot id="A" hit={hitEffects.A} isDodging={me.id === "A" && isDodging} />

        <div className="flex flex-col items-center gap-3 pb-6">
          <button onClick={() => throwIt("heart")}
            className="text-4xl hover:scale-125 active:scale-95 transition-transform" title="Throw heart">❤️</button>
          <button onClick={() => throwIt("pie")}
            className="text-4xl hover:scale-125 active:scale-95 transition-transform" title="Throw pie">🥧</button>
          <button onClick={dodge} disabled={isDodging}
            className={`mt-1 px-3 py-1 rounded-full text-xs font-bold border transition-all
              ${isDodging
                ? "border-rosegold/30 text-rosegold/30 bg-rosegold/5 cursor-default"
                : "border-rosegold/60 text-rosegold hover:bg-rosegold/15"}`}>
            {isDodging ? "dodging…" : "Dodge 🏃"}
          </button>
        </div>

        <AvatarSlot id="B" hit={hitEffects.B} isDodging={me.id === "B" && isDodging} />
      </div>

      <p className="text-xs text-cream/40 mb-6">Throw hearts &amp; pies while you wait!</p>

      {done && (
        <button onClick={begin} disabled={iBegan}
          className="px-6 py-3 rounded-full bg-rosegold text-navy font-bold disabled:opacity-50 transition">
          {iBegan ? "Waiting for partner…" : "Begin the date 💞"}
        </button>
      )}
    </div>
  );
}

function AvatarSlot({ id, hit, isDodging }) {
  const emoji = id === "A" ? "👩" : "👨";
  const name  = id === "A" ? "User A" : "User B";
  return (
    <div className="flex flex-col items-center gap-2 w-24">
      <div className={`relative text-7xl select-none transition-all duration-200
        ${isDodging ? "translate-x-5 -translate-y-3" : ""}
        ${hit ? "scale-90" : "scale-100"}`}>
        {emoji}
        {hit?.kind === "pie" && (
          <span key={hit.ts + "-pie"}
            className="absolute inset-0 flex items-center justify-center text-4xl animate-splat pointer-events-none">
            💦
          </span>
        )}
        {hit?.kind === "heart" && (
          <span key={hit.ts + "-heart"}
            className="absolute -top-3 right-0 text-3xl animate-arrow pointer-events-none">
            💘
          </span>
        )}
      </div>
      <span className="text-sm font-semibold text-cream/60">{name}</span>
      {isDodging && <span className="text-xs text-rosegold animate-bounce">dodge!</span>}
    </div>
  );
}
