// frontend/src/components/Lobby.jsx
import { useState, useCallback, useRef } from "react";
import { getSocket } from "../socket.js";
import { useCountdown } from "../hooks/useCountdown.js";
import Projectiles from "./Projectiles.jsx";

export default function Lobby({ me, state }) {
  const { label, done } = useCountdown();
  const { ida, idb, nameA, nameB } = state.meta;
  const [hitEffects, setHitEffects]   = useState(() => ({ [ida]: null, [idb]: null }));
  const [isDodging,  setIsDodging]    = useState(false);
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

  const bothOnline = state.presence[ida].online && state.presence[idb].online;
  const hitA = hitEffects[ida];
  const hitB = hitEffects[idb];

  return (
    <div className="min-h-screen bg-background text-on-background relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <Projectiles meId={me.id} ida={ida} idb={idb} onHit={onHit} />

      {/* Fixed top header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-white/15 shadow-[0_0_20px_rgba(255,176,207,0.2)]">
        <div className="flex items-center justify-center px-safe-margin h-16 max-w-[600px] mx-auto">
          <h1 className="font-headline-md-mobile text-headline-md-mobile text-primary">Date Night</h1>
        </div>
      </header>

      <main className="max-w-[600px] mx-auto pt-24 px-safe-margin flex flex-col gap-md relative min-h-[calc(100vh-160px)]">
        {/* Status header */}
        <div className="text-center mb-4">
          <h2 className="font-display-lg-mobile text-display-lg-mobile text-on-surface mb-2">The Lobby</h2>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center justify-center gap-2">
            {done ? "Ready to begin" : `Date begins in ${label}`}
            <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pip-pulse" />
          </p>
        </div>

        {/* Avatar arena */}
        <div className="relative h-64 glass-panel rounded-xl flex items-center justify-between px-8 mb-8 overflow-hidden" id="arena">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-surface to-background" />

          {/* Player A (left) */}
          <div className={`flex flex-col items-center gap-4 z-10 animate-float transition-all duration-200 ${isDodging && me.id === ida ? "translate-x-6 -translate-y-4" : ""}`}>
            <div className={`w-24 h-24 rounded-full border-2 border-primary p-1 glow-primary relative glass-card flex items-center justify-center text-6xl select-none ${hitA ? "scale-90" : "scale-100"} transition-transform`}>
              👩
              {hitA?.kind === "pie" && <span key={hitA.ts + "-pie"} className="absolute inset-0 flex items-center justify-center text-4xl animate-splat pointer-events-none">💥</span>}
              {hitA?.kind === "heart" && <span key={hitA.ts + "-heart"} className="absolute -top-4 right-0 text-3xl animate-arrow pointer-events-none">💘</span>}
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-full border-2 border-surface animate-pip-pulse" />
            </div>
            <span className="font-label-caps text-label-caps text-primary px-3 py-1 glass-panel rounded-full">
              {me.id === ida ? "You" : nameA}
            </span>
            {isDodging && me.id === ida && <span className="text-xs text-tertiary animate-bounce">dodge!</span>}
          </div>

          {/* Center */}
          <div className="z-10 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined">compare_arrows</span>
            </div>
          </div>

          {/* Player B (right) */}
          <div className={`flex flex-col items-center gap-4 z-10 animate-float-delayed transition-all duration-200 ${isDodging && me.id === idb ? "-translate-x-6 -translate-y-4" : ""}`}>
            <div className={`w-24 h-24 rounded-full border-2 border-secondary p-1 glow-secondary relative glass-card flex items-center justify-center text-6xl select-none ${hitB ? "scale-90" : "scale-100"} transition-transform`}>
              👨
              {hitB?.kind === "pie" && <span key={hitB.ts + "-pie"} className="absolute inset-0 flex items-center justify-center text-4xl animate-splat pointer-events-none">💥</span>}
              {hitB?.kind === "heart" && <span key={hitB.ts + "-heart"} className="absolute -top-4 right-0 text-3xl animate-arrow pointer-events-none">💘</span>}
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-secondary rounded-full border-2 border-surface animate-pip-pulse" />
            </div>
            <span className="font-label-caps text-label-caps text-secondary px-3 py-1 glass-panel rounded-full">
              {me.id === idb ? "You" : nameB}
            </span>
            {isDodging && me.id === idb && <span className="text-xs text-tertiary animate-bounce">dodge!</span>}
          </div>
        </div>

        {/* Warmup + Dodge */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="col-span-2 glass-panel rounded-xl p-4">
            <h3 className="font-title-sm text-title-sm text-on-surface mb-4">Warmup Actions</h3>
            <div className="flex justify-around">
              {[["❤️","heart"],["🥧","pie"],["✨","heart"]].map(([emoji, kind]) => (
                <button key={emoji}
                  onClick={() => throwIt(kind)}
                  className="w-16 h-16 rounded-full glass-panel hover:bg-white/10 active:scale-90 transition-all flex items-center justify-center text-2xl">
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={dodge}
            disabled={isDodging}
            className="col-span-2 py-4 glass-panel rounded-xl border-secondary text-secondary font-title-sm text-title-sm hover:bg-secondary/10 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40">
            <span className="material-symbols-outlined">shield</span>
            {isDodging ? "Dodging..." : "Dodge"}
          </button>
        </div>

        {/* Start button */}
        <div className="mt-auto pb-4">
          <button
            onClick={begin}
            disabled={iBegan || !bothOnline}
            className={`w-full h-16 rounded-xl font-title-sm text-title-sm flex items-center justify-center gap-2 transition-all duration-300 ${
              iBegan
                ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed"
                : bothOnline
                  ? "bg-gradient-to-r from-primary to-secondary text-on-primary shadow-[0_0_20px_rgba(255,176,207,0.4)] hover:opacity-90 active:scale-95"
                  : "bg-surface-container-highest text-on-surface-variant cursor-not-allowed"
            }`}>
            <span className="material-symbols-outlined">{iBegan ? "hourglass_top" : "play_arrow"}</span>
            {iBegan ? "Waiting for partner…" : "Start Date"}
          </button>
          <p className="text-center font-label-caps text-label-caps text-on-surface-variant mt-3">
            {bothOnline ? "Both players connected" : "Waiting for both players..."}
          </p>
        </div>
      </main>
    </div>
  );
}
