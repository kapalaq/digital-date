// frontend/src/components/Stage4Goals.jsx
import { useState } from "react";
import { getSocket } from "../socket.js";

function buildMarkdown(username, goals, date) {
  return `# My 100 Goals — ${username} — ${date}\n\n` +
    goals.map((g, i) => `${i + 1}. ${g}`).join("\n") + "\n";
}

export default function Stage4Goals({ me, state }) {
  const sock       = getSocket();
  const myGoals    = state.stage4.goals[me.id];
  const myShared   = state.stage4.sharedGoals[me.id] || [];
  const partnerId  = me.id === "A" ? "B" : "A";
  const partnerGoals  = state.stage4.goals[partnerId];
  const partnerShared = state.stage4.sharedGoals[partnerId] || [];
  const partnerAllowsFewer = state.stage4.allowFewer[partnerId];
  const [draft, setDraft]  = useState("");
  const [editIdx, setEditIdx] = useState(null);

  const push      = (next) => sock?.emit("stage4:goals", { goals: next });
  const add       = () => { if (draft.trim()) { push([...myGoals, draft.trim()]); setDraft(""); } };
  const del       = (i) => {
    const goal = myGoals[i];
    // also remove from shared if present
    const newShared = myShared.filter(g => g !== goal);
    push(myGoals.filter((_, x) => x !== i));
    sock?.emit("stage4:sharedGoals", { sharedGoals: newShared });
  };
  const saveEdit  = (i, val) => {
    const old = myGoals[i];
    // update shared if old value was shared
    const newShared = myShared.map(g => g === old ? val : g);
    push(myGoals.map((g, x) => x === i ? val : g));
    sock?.emit("stage4:sharedGoals", { sharedGoals: newShared });
    setEditIdx(null);
  };
  const toggleShared = (goal) => {
    const next = myShared.includes(goal)
      ? myShared.filter(g => g !== goal)
      : [...myShared, goal];
    sock?.emit("stage4:sharedGoals", { sharedGoals: next });
  };
  const toggleAllow = (e) => sock?.emit("stage4:allowFewer", { value: e.target.checked });

  const canSubmit = myGoals.length > 0 && (partnerAllowsFewer || myGoals.length >= 100);
  const download  = () => {
    const date = new Date().toISOString().slice(0, 10);
    const blob = new Blob([buildMarkdown(me.name, myGoals, date)], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `100-goals-${me.id}.md`;
    a.click();
    sock?.emit("stage4:downloaded");
  };

  const myColor      = me.id === "A" ? "primary" : "secondary";
  const partnerColor = me.id === "A" ? "secondary" : "primary";
  const progress = Math.min(100, myGoals.length);
  const circumference = 282.7;
  const dashOffset = circumference - (circumference * progress) / 100;

  // Partner visible goals = only goals partner has shared
  const visiblePartnerGoals = partnerGoals.filter(g => partnerShared.includes(g));

  return (
    <div className="min-h-screen dn-shell text-on-background fade-in overflow-x-hidden">
      <header className="dn-topbar fixed top-0 w-full z-50">
        <div className="h-16 max-w-[1200px] mx-auto px-xl flex items-center justify-center">
          <div className="font-display-lg text-display-lg text-primary">Date Night</div>
        </div>
      </header>

      <main className="relative z-10 pt-24 p-safe-margin md:p-xl max-w-[1200px] mx-auto min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_24rem] gap-lg">
        <section className="flex flex-col gap-lg">
          <div>
            <p className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-on-background mb-xs">
              Our 100 Goals
            </p>
            <p className="text-on-surface-variant">What experiences do we want to share? Add them below.</p>
          </div>

          <div className="glass-panel rounded-xl p-md flex items-center gap-sm">
            <span className="material-symbols-outlined text-secondary">add_task</span>
            <input
              className="w-full bg-transparent border-none text-on-background placeholder:text-on-surface-variant/50 focus:ring-0 focus:outline-none py-3 font-body-md"
              placeholder="e.g., Take a cooking class together..."
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === "Enter" && add()}
            />
            <button onClick={add} className="px-6 py-3 rounded-full bg-surface-variant/50 hover:bg-surface-variant text-primary font-bold transition-colors">
              Add
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-md">
            <div className="glass-panel rounded-xl p-md md:p-lg" style={{ borderColor: myColor === "primary" ? "rgba(255,176,207,0.3)" : "rgba(202,190,255,0.3)" }}>
              <div className="flex items-center justify-between mb-sm">
                <h2 className={`font-label-caps text-label-caps ${myColor === "primary" ? "text-primary" : "text-secondary"}`}>Your Goals</h2>
                <span className="text-sm text-on-surface-variant">{myGoals.length} / 100</span>
              </div>
              <div className="w-full rounded-full h-2 mb-md bg-white/10">
                <div className={`h-2 rounded-full transition-all ${myColor === "primary" ? "bg-primary" : "bg-secondary"}`}
                  style={{ width: `${progress}%` }} />
              </div>
              <div className="grid grid-cols-1 gap-sm max-h-[28rem] overflow-y-auto pr-1">
            {myGoals.map((g, i) => {
              const isShared = myShared.includes(g);
              return (
                <div key={i} className={`goal-chip flex items-center gap-sm px-3 py-2 rounded-lg text-sm border ${isShared ? "bg-primary/10 border-primary/30" : "bg-white/[0.06] border-white/10"}`}>
                  <input
                    type="checkbox"
                    checked={isShared}
                    onChange={() => toggleShared(g)}
                    title="Share with partner"
                    className="flex-shrink-0 cursor-pointer accent-dn-rose w-4 h-4"
                  />
                  <span className={`text-xs flex-shrink-0 ${myColor === "primary" ? "text-primary" : "text-secondary"}`}>{i + 1}.</span>
                  {editIdx === i
                    ? <input autoFocus defaultValue={g}
                        className="min-w-0 flex-1 bg-transparent outline-none text-on-surface text-sm"
                        onBlur={e => saveEdit(i, e.target.value)}
                        onKeyDown={e => e.key === "Enter" && saveEdit(i, e.target.value)} />
                    : <span className="min-w-0 flex-1 cursor-pointer text-on-surface truncate" onClick={() => setEditIdx(i)}>{g}</span>}
                  <button onClick={() => del(i)}
                    aria-label={`Delete ${g}`}
                    className="text-on-surface-variant/50 hover:text-error flex-shrink-0">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              );
            })}
              </div>
              <p className="text-on-surface-variant text-xs mt-sm">Check a goal to share it with your partner.</p>
            </div>

            <div className="glass-panel rounded-xl p-md md:p-lg" style={{ borderColor: partnerColor === "primary" ? "rgba(255,176,207,0.3)" : "rgba(202,190,255,0.3)" }}>
              <div className="flex items-center justify-between mb-md">
                <h2 className={`font-label-caps text-label-caps ${partnerColor === "primary" ? "text-primary" : "text-secondary"}`}>Partner&apos;s Goals</h2>
                <span className="text-sm text-on-surface-variant">{visiblePartnerGoals.length} shared</span>
              </div>
              <div className="grid grid-cols-1 gap-sm max-h-[28rem] overflow-y-auto pr-1">
            {visiblePartnerGoals.length === 0
              ? <p className="text-on-surface-variant text-sm text-center py-8 sm:col-span-2">No shared goals yet.</p>
              : visiblePartnerGoals.map((g, i) => (
                  <div key={i} className="goal-chip flex items-center gap-sm px-3 py-2 rounded-lg text-sm bg-secondary/10 border border-secondary/20">
                    <span className={`text-xs flex-shrink-0 ${partnerColor === "primary" ? "text-primary" : "text-secondary"}`}>{i + 1}.</span>
                    <span className="min-w-0 flex-1 text-on-surface truncate">{g}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="glass-panel rounded-xl p-lg h-fit flex flex-col items-center text-center glow-active sticky top-28">
          <h2 className="font-title-sm text-title-sm text-secondary mb-sm">Progress</h2>
          <div className="relative w-36 h-36 my-md flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
              <circle cx="50" cy="50" fill="transparent" r="45" stroke="#ffb0cf" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" strokeWidth="6" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display-lg text-display-lg text-primary leading-none">{myGoals.length}</span>
              <span className="text-on-surface-variant text-sm">/ 100</span>
            </div>
          </div>
          <p className="text-sm text-on-surface-variant mb-md">{myGoals.length} goals added. Keep dreaming.</p>
          <button onClick={download} disabled={!canSubmit}
            className="w-full py-4 rounded-full btn-primary-glow font-title-sm flex items-center justify-center gap-sm">
            <span className="material-symbols-outlined">done_all</span>
            Finish List
          </button>
          <button onClick={download} disabled={!canSubmit}
            className="mt-sm w-full py-3 rounded-full btn-secondary-glass font-title-sm flex items-center justify-center gap-sm disabled:opacity-40 disabled:cursor-not-allowed">
            <span className="material-symbols-outlined">download</span>
            Download
          </button>
          {state.stage4.downloaded[me.id] && (
            <p className="text-sm text-primary mt-sm">Downloaded. Waiting for partner...</p>
          )}
          <label className="mt-md flex items-start gap-sm text-xs text-on-surface-variant cursor-pointer text-left">
          <input type="checkbox"
            checked={state.stage4.allowFewer[me.id]}
            onChange={toggleAllow}
            className="accent-dn-rose mt-0.5" />
          Allow partner to submit with fewer than 100
        </label>
        </aside>
      </main>
    </div>
  );
}
