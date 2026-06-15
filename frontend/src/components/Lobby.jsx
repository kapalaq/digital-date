// frontend/src/components/Lobby.jsx
import { useState, useCallback, useRef } from "react";
import { getSocket } from "../socket.js";
import { useCountdown } from "../hooks/useCountdown.js";
import Projectiles from "./Projectiles.jsx";

export default function Lobby({ me, state }) {
  const { label, done } = useCountdown();
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
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      <Projectiles meId={me.id} onHit={onHit} />

      <h2 className="font-display text-4xl text-dn-rose mb-1">The Lobby</h2>
      <p className="text-dn-muted text-sm mb-10">
        Date begins in <span className="text-dn-amber font-semibold">{label}</span>
      </p>

      <div className="flex items-end justify-center gap-8 mb-8 w-full max-w-2xl">
        <AvatarSlot id="A" hit={hitEffects.A} isDodging={me.id === "A" && isDodging} />

        <div className="flex flex-col items-center gap-4 pb-8">
          <button
            onClick={() => throwIt("heart")}
            className="text-5xl hover:scale-125 active:scale-95 transition-transform"
            title="Throw heart">❤️</button>
          <button
            onClick={() => throwIt("pie")}
            className="text-5xl hover:scale-125 active:scale-95 transition-transform"
            title="Throw pie">🥧</button>
          <button
            onClick={dodge}
            disabled={isDodging}
            className={`mt-1 px-4 py-1.5 rounded-pill text-xs font-bold border transition-all
              ${isDodging
                ? "border-dn-rose/20 text-dn-rose/30 cursor-default"
                : "border-dn-rose/50 text-dn-rose hover:bg-dn-rose/10"}`}>
            {isDodging ? "dodging…" : "Dodge 🏃"}
          </button>
        </div>

        <AvatarSlot id="B" hit={hitEffects.B} isDodging={me.id === "B" && isDodging} />
      </div>

      <p className="text-xs text-dn-muted mb-8 tracking-wide">
        throw hearts &amp; pies while you wait
      </p>

      {done && (
        <button
          onClick={begin}
          disabled={iBegan}
          className="px-8 py-3 rounded-pill bg-dn-rose-bright text-dn-bg font-bold disabled:opacity-50 hover:opacity-90 transition">
          {iBegan ? "Waiting for partner…" : "Begin the date 💞"}
        </button>
      )}
    </div>
  );
}

function AvatarSlot({ id, hit, isDodging }) {
  const emoji = id === "A" ? "👩" : "👨";
  const name  = id === "A" ? "User A" : "User B";
  const color = id === "A" ? "#ffb0cf" : "#cabeff";

  return (
    <div className="flex flex-col items-center gap-3 w-28">
      <div className={`relative text-8xl select-none transition-all duration-200
        ${isDodging ? "translate-x-6 -translate-y-4" : ""}
        ${hit ? "scale-90" : "scale-100"}`}>
        {emoji}
        {hit?.kind === "pie" && (
          <span key={hit.ts + "-pie"}
            className="absolute inset-0 flex items-center justify-center text-4xl animate-splat pointer-events-none">
            💥
          </span>
        )}
        {hit?.kind === "heart" && (
          <span key={hit.ts + "-heart"}
            className="absolute -top-4 right-0 text-3xl animate-arrow pointer-events-none">
            💘
          </span>
        )}
      </div>
      <span className="text-xs font-semibold tracking-widest uppercase" style={{ color }}>
        {name}
      </span>
      {isDodging && (
        <span className="text-xs text-dn-amber animate-bounce">dodge!</span>
      )}
    </div>
  );
}
