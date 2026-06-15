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

  const myColor      = me.id === "A" ? "#ffb0cf" : "#cabeff";
  const partnerColor = me.id === "A" ? "#cabeff" : "#ffb0cf";

  // Partner visible goals = only goals partner has shared
  const visiblePartnerGoals = partnerGoals.filter(g => partnerShared.includes(g));

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto fade-in">
      <h2 className="font-display text-4xl text-dn-text my-6 text-center">100 Goals ✨</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* My goals column */}
        <div className="glass p-5" style={{ borderColor: `${myColor}30` }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: myColor }}>
              Your Goals
            </h3>
            <span className="text-xs text-dn-muted">{myGoals.length} / 100</span>
          </div>
          <div className="w-full rounded-full h-1.5 mb-4" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, myGoals.length)}%`, background: myColor }} />
          </div>
          <div className="flex flex-col gap-2 mb-4 max-h-80 overflow-y-auto pr-1">
            {myGoals.map((g, i) => {
              const isShared = myShared.includes(g);
              return (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-pill text-sm"
                  style={{
                    background: isShared ? "rgba(255,176,207,0.08)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${isShared ? "rgba(255,176,207,0.3)" : "rgba(255,255,255,0.1)"}`,
                  }}>
                  {/* Share checkbox */}
                  <input
                    type="checkbox"
                    checked={isShared}
                    onChange={() => toggleShared(g)}
                    title="Share with partner"
                    className="flex-shrink-0 cursor-pointer accent-dn-rose w-3.5 h-3.5"
                  />
                  <span className="text-xs flex-shrink-0" style={{ color: myColor }}>{i + 1}.</span>
                  {editIdx === i
                    ? <input autoFocus defaultValue={g}
                        className="flex-1 bg-transparent outline-none text-dn-text text-sm"
                        onBlur={e => saveEdit(i, e.target.value)}
                        onKeyDown={e => e.key === "Enter" && saveEdit(i, e.target.value)} />
                    : <span className="flex-1 cursor-pointer text-dn-text" onClick={() => setEditIdx(i)}>{g}</span>}
                  <button onClick={() => del(i)}
                    className="text-dn-muted hover:text-dn-rose text-xs ml-1 flex-shrink-0">✕</button>
                </div>
              );
            })}
          </div>
          <p className="text-dn-muted text-xs mb-2 text-center opacity-60">
            ☑ check a goal to share it with your partner
          </p>
          <input
            className="glass-input text-sm w-full"
            style={{ borderRadius: "1rem" }}
            placeholder="Type a goal, press Enter…"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
          />
        </div>

        {/* Partner goals column — only shows shared goals */}
        <div className="glass p-5" style={{ borderColor: `${partnerColor}30` }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: partnerColor }}>
              Partner&apos;s Goals
            </h3>
            {/* No count shown */}
          </div>
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
            {visiblePartnerGoals.length === 0
              ? <p className="text-dn-muted text-sm text-center py-8">No shared goals yet…</p>
              : visiblePartnerGoals.map((g, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-pill text-sm"
                    style={{ background: "rgba(202,190,255,0.06)", border: "1px solid rgba(202,190,255,0.15)" }}>
                    <span className="text-xs flex-shrink-0" style={{ color: partnerColor }}>{i + 1}.</span>
                    <span className="flex-1 text-dn-text">{g}</span>
                  </div>
                ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button onClick={download} disabled={!canSubmit}
          className="px-8 py-3 rounded-pill bg-dn-rose-bright text-dn-bg font-bold disabled:opacity-50 hover:opacity-90 transition">
          Finish &amp; Download ⬇️
        </button>
        {state.stage4.downloaded[me.id] && (
          <p className="text-sm text-dn-rose">Downloaded. Waiting for partner…</p>
        )}
        <label className="flex items-center gap-2 text-xs text-dn-muted cursor-pointer">
          <input type="checkbox"
            checked={state.stage4.allowFewer[me.id]}
            onChange={toggleAllow}
            className="accent-dn-rose" />
          Allow partner to submit with fewer than 100
        </label>
      </div>
    </div>
  );
}
