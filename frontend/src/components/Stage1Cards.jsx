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
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[120px] opacity-20" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-white/15 shadow-[0_0_20px_rgba(255,176,207,0.2)]">
        <div className="flex justify-between items-center px-safe-margin h-16 max-w-[600px] mx-auto">
          {/* Fix #1: menu icon button */}
          <button className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined text-xl">menu</span>
          </button>
          <h1 className="font-headline-md-mobile text-headline-md-mobile text-primary">Date Night</h1>
          {/* Fix #2: avatar token bg-surface-bright border-white/20 */}
          <div className="w-8 h-8 rounded-full bg-surface-bright border border-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">person</span>
          </div>
        </div>
      </header>

      <main className="flex-1 mt-16 px-safe-margin pt-md pb-xl max-w-[600px] mx-auto w-full z-10 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] relative">
        {/* Stage + title */}
        <div className="text-center mb-lg w-full">
          {/* Fix #4: stage badge shadow */}
          <span className="inline-block px-3 py-1 bg-surface-bright border border-white/10 rounded-full text-secondary font-label-caps text-label-caps mb-sm tracking-widest shadow-[0_0_10px_rgba(202,190,255,0.2)]">
            STAGE 1
          </span>
          {/* Fix #3: heading color text-primary-fixed */}
          <h2 className="font-display-lg-mobile text-display-lg-mobile text-primary-fixed drop-shadow-[0_0_15px_rgba(255,176,207,0.3)] mb-xs">
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
                  {/* Front — Fix #5: hover states */}
                  <div className={`flip-card-front absolute w-full h-full rounded-xl bg-surface-container-high/40 backdrop-blur-md border border-white/15 flex items-center justify-center overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-primary/50 hover:shadow-[0_0_25px_rgba(255,176,207,0.2)] transition-all duration-300`}>
                    <span className={`material-symbols-outlined ${COLOR_TEXT[g.color]} opacity-30 text-[64px]`} style={{ fontVariationSettings: "'FILL' 1" }}>{g.icon}</span>
                    {/* Fix #5: dot pattern overlay */}
                    <div className="absolute inset-0 opacity-50 rounded-xl" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,0.3)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat"}} />
                  </div>
                  {/* Back */}
                  <div className={`flip-card-back absolute w-full h-full rounded-xl bg-surface-container-high/90 backdrop-blur-xl border ${g.border} flex flex-col items-center justify-center p-sm text-center ${g.shadow}`}>
                    {/* Fix #6: icon in circular container */}
                    <div className={`w-12 h-12 rounded-full bg-${g.color}-container/20 flex items-center justify-center mb-sm shadow-[0_0_15px_rgba(255,126,185,0.3)]`}>
                      <span className={`material-symbols-outlined ${COLOR_TEXT[g.color]} text-[28px]`}>{g.icon}</span>
                    </div>
                    <h3 className="font-title-sm text-title-sm text-on-surface mb-xs">{g.name}</h3>
                    <p className="text-[14px] text-on-surface-variant leading-tight mb-sm">{g.desc}</p>
                    {/* Fix #7: glow shadow on select button */}
                    <button
                      onClick={e => { e.stopPropagation(); setSelected(isSelected ? null : i); }}
                      className={`px-4 py-2 rounded-full font-label-caps text-label-caps hover:opacity-90 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,176,207,0.4)] ${
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

        {/* Fix #8: Player status pills with animated pulsing dot */}
        <div className="w-full max-w-[300px] flex flex-col gap-4 mt-auto">
          {["A", "B"].map(pid => {
            const done  = state.stage1[`${pid}_done`];
            const isMe  = pid === me.id;
            const color = pid === "A" ? "primary" : "secondary";
            return (
              <div key={pid} className="flex items-center justify-between bg-surface-container/60 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center border ${pid === "A" ? "border-primary/40" : "border-secondary/40"}`}>
                    <span className="material-symbols-outlined text-xs text-on-surface-variant" style={{fontSize: "14px"}}>person</span>
                  </div>
                  <span className={`font-body-md text-body-md ${COLOR_TEXT[color]}`}>
                    {isMe ? "You" : pid === "A" ? "User A" : "User B"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-label-caps text-label-caps ${done ? COLOR_TEXT[color] : "text-on-surface-variant"}`}>
                    {done ? "Ready" : "Picking…"}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${done ? (pid === "A" ? "bg-primary" : "bg-secondary") : "bg-on-surface-variant/40"} ${done ? "animate-pip-pulse shadow-[0_0_8px_rgba(255,176,207,0.8)]" : ""}`} />
                </div>
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
