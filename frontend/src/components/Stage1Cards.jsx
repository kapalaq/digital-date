// frontend/src/components/Stage1Cards.jsx
import { useState } from "react";
import { getSocket } from "../socket.js";

const GAMES = [
  {
    name: "It Takes Two",
    desc: "A story of love, trust, and cooperation.",
    icon: "favorite",
    color: "primary",
    border: "border-primary/40",
    shadow: "shadow-[0_0_30px_rgba(255,176,207,0.15)]",
  },
  {
    name: "Unravel Two",
    desc: "Two yarns, one adventure.",
    icon: "auto_awesome",
    color: "secondary",
    border: "border-secondary/40",
    shadow: "shadow-[0_0_30px_rgba(202,190,255,0.15)]",
  },
  {
    name: "Portal 2",
    desc: "Think with portals. Together.",
    icon: "local_fire_department",
    color: "tertiary",
    border: "border-tertiary/40",
    shadow: "shadow-[0_0_30px_rgba(255,185,81,0.15)]",
  },
];

const COLOR_TEXT = { primary: "text-primary", secondary: "text-secondary", tertiary: "text-tertiary" };
const COLOR_BG   = { primary: "bg-primary", secondary: "bg-secondary", tertiary: "bg-tertiary" };
const COLOR_ON   = { primary: "text-on-primary", secondary: "text-on-secondary", tertiary: "text-on-tertiary" };

export default function Stage1Cards({ me, state }) {
  const [flipped,  setFlipped]  = useState(null);
  const [selected, setSelected] = useState(null);
  const partnerId  = me.id === "A" ? "B" : "A";
  const iDone      = state.stage1[`${me.id}_done`];
  const partnerDone = state.stage1[`${partnerId}_done`];
  const confirm = () => { if (selected !== null) getSocket()?.emit("stage1:confirm"); };

  return (
    <div className="min-h-screen bg-background text-on-background relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-white/15 shadow-[0_0_20px_rgba(255,176,207,0.2)]">
        <div className="flex justify-between items-center px-safe-margin h-16 max-w-[600px] mx-auto">
          <div className="w-8" />
          <h1 className="font-headline-md-mobile text-headline-md-mobile text-primary">Date Night</h1>
          <div className="w-8 h-8 rounded-full bg-surface-container border border-white/15 flex items-center justify-center">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">person</span>
          </div>
        </div>
      </header>

      <main className="flex-1 mt-16 px-safe-margin pt-md pb-xl max-w-[600px] mx-auto w-full z-10 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] relative">
        {/* Stage + title */}
        <div className="text-center mb-lg w-full">
          <span className="inline-block px-3 py-1 bg-surface-bright border border-white/10 rounded-full text-secondary font-label-caps text-label-caps mb-sm tracking-widest">
            STAGE 1
          </span>
          <h2 className="font-display-lg-mobile text-display-lg-mobile text-on-surface drop-shadow-[0_0_15px_rgba(255,176,207,0.3)] mb-xs">
            Pick a Card
          </h2>
          <p className="text-on-surface-variant font-body-md text-body-md max-w-[280px] mx-auto">
            Find a game that sparks your interest. You both must agree!
          </p>
        </div>

        {/* Flip cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md w-full mb-lg" style={{ perspective: "1000px" }}>
          {GAMES.map((g, i) => {
            const isFlipped  = flipped === i;
            const isSelected = selected === i;
            return (
              <div
                key={i}
                className={`flip-card w-full h-[220px] md:h-[280px] cursor-pointer ${isFlipped ? "flipped" : ""}`}
                onClick={() => setFlipped(isFlipped ? null : i)}>
                <div className="flip-card-inner w-full h-full relative">
                  {/* Front */}
                  <div className={`flip-card-front absolute w-full h-full rounded-xl bg-surface-container-high/40 backdrop-blur-md border border-white/15 flex items-center justify-center overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300`}>
                    <span className={`material-symbols-outlined ${COLOR_TEXT[g.color]} opacity-30 text-[64px]`} style={{ fontVariationSettings: "'FILL' 1" }}>{g.icon}</span>
                  </div>
                  {/* Back */}
                  <div className={`flip-card-back absolute w-full h-full rounded-xl bg-surface-container-high/90 backdrop-blur-xl border ${g.border} flex flex-col items-center justify-center p-sm text-center ${g.shadow}`}>
                    <span className={`material-symbols-outlined ${COLOR_TEXT[g.color]} text-[40px] mb-sm`}>{g.icon}</span>
                    <h3 className="font-title-sm text-title-sm text-on-surface mb-xs">{g.name}</h3>
                    <p className="text-[14px] text-on-surface-variant leading-tight mb-sm">{g.desc}</p>
                    <button
                      onClick={e => { e.stopPropagation(); setSelected(isSelected ? null : i); }}
                      className={`px-4 py-2 rounded-full font-label-caps text-label-caps shadow-lg hover:opacity-90 active:scale-95 transition-all ${
                        isSelected
                          ? `${COLOR_BG[g.color]} ${COLOR_ON[g.color]}`
                          : `border ${g.border} ${COLOR_TEXT[g.color]}`
                      }`}>
                      {isSelected ? "Selected ✓" : "Select"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Player status */}
        <div className="w-full max-w-[300px] flex flex-col gap-4 mt-auto">
          {["A", "B"].map(pid => {
            const done  = state.stage1[`${pid}_done`];
            const isMe  = pid === me.id;
            const color = pid === "A" ? "primary" : "secondary";
            return (
              <div key={pid}
                className="flex items-center justify-between bg-surface-container/60 backdrop-blur-md rounded-full px-4 py-2 border"
                style={{ borderColor: done ? `rgba(${pid === "A" ? "255,176,207" : "202,190,255"},0.4)` : "rgba(255,255,255,0.1)" }}>
                <span className={`font-label-caps text-label-caps ${COLOR_TEXT[color]}`}>
                  {isMe ? "You" : pid === "A" ? "User A" : "User B"}
                </span>
                <span className={`font-label-caps text-label-caps ${done ? COLOR_TEXT[color] : "text-on-surface-variant"}`}>
                  {done ? "Ready ✓" : "Picking…"}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={confirm}
          disabled={iDone || selected === null}
          className="mt-6 px-8 py-3 rounded-full bg-primary text-on-primary font-title-sm text-title-sm shadow-[0_0_20px_rgba(255,176,207,0.3)] hover:opacity-90 active:scale-95 transition-all disabled:opacity-40">
          We both finished this game ✓
        </button>
        {partnerDone && !iDone && (
          <p className="text-sm text-secondary mt-3 animate-pulse">Partner is ready!</p>
        )}
      </main>
    </div>
  );
}
