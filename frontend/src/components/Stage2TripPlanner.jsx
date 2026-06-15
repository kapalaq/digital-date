// frontend/src/components/Stage2TripPlanner.jsx
import { useState } from "react";
import { getSocket } from "../socket.js";

function DynList({ label, items, onChange }) {
  const [draft, setDraft] = useState("");
  return (
    <div className="mb-5">
      <p className="text-dn-muted text-xs uppercase tracking-widest mb-2">{label}</p>
      <ul className="mb-2 flex flex-col gap-1">
        {items.map((it, i) => (
          <li key={i}
            className="flex justify-between items-center px-4 py-2 text-sm text-dn-text"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9999px" }}>
            <span>{it}</span>
            <button onClick={() => onChange(items.filter((_, x) => x !== i))}
              className="text-dn-muted hover:text-dn-rose ml-2 text-xs">✕</button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          className="glass-input flex-1 text-sm"
          style={{ borderRadius: "1rem" }}
          placeholder="Add…"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && draft.trim()) { onChange([...items, draft.trim()]); setDraft(""); }
          }}
        />
        <button
          className="px-4 py-2 rounded-pill text-sm font-bold transition"
          style={{ background: "rgba(255,176,207,0.15)", border: "1px solid rgba(255,176,207,0.3)", color: "#ffb0cf" }}
          onClick={() => { if (draft.trim()) { onChange([...items, draft.trim()]); setDraft(""); } }}>
          +
        </button>
      </div>
    </div>
  );
}

export default function Stage2TripPlanner({ me, state }) {
  const sock = getSocket();
  const plan = state.stage2.plan;
  const dw   = state.stage2.dontWant;
  const [dontWant, setDontWant] = useState("");

  const updatePlan     = (patch) => sock?.emit("stage2:plan", { plan: { ...plan, ...patch } });
  const submitDontWant = () => sock?.emit("stage2:dontWant", { list: dontWant.split("\n").filter(Boolean) });
  const submitPlan     = () => sock?.emit("stage2:planSubmit");
  const iSubmittedDW   = !!dw[me.id];
  const iSubmittedPlan = state.stage2.planSubmitted[me.id];

  return (
    <div className="mt-8 fade-in">
      <h3 className="font-display text-3xl text-dn-text mb-6">Plan the trip ✈️</h3>

      <div className="glass p-6 mb-4">
        <label className="block mb-4">
          <span className="text-dn-muted text-xs uppercase tracking-widest">Destination</span>
          <input className="glass-input mt-2" style={{ borderRadius: "1rem" }}
            value={plan.destination} readOnly />
        </label>
        <label className="block mb-4">
          <span className="text-dn-muted text-xs uppercase tracking-widest">Hotel 🏨</span>
          <input className="glass-input mt-2" style={{ borderRadius: "1rem" }}
            value={plan.hotel} onChange={e => updatePlan({ hotel: e.target.value })} />
        </label>
        <DynList label="🍽️ Restaurants" items={plan.restaurants} onChange={r => updatePlan({ restaurants: r })} />
        <DynList label="🎯 Activities"   items={plan.activities}  onChange={a => updatePlan({ activities: a })} />
        <label className="block">
          <span className="text-dn-muted text-xs uppercase tracking-widest">📅 Approximate dates</span>
          <input className="glass-input mt-2" style={{ borderRadius: "1rem" }}
            value={plan.dates} onChange={e => updatePlan({ dates: e.target.value })} />
        </label>
      </div>

      <div className="glass p-5 mb-5" style={{ borderColor: "rgba(255,176,207,0.2)" }}>
        <p className="font-semibold text-dn-text mb-1">🚫 Things I do NOT want</p>
        <p className="text-dn-muted text-xs mb-3">Private until both submit</p>
        {iSubmittedDW ? (
          dw.revealed ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-dn-rose text-xs uppercase tracking-widest mb-2">You</p>
                <ul className="flex flex-col gap-1">
                  {dw[me.id].map((x, i) => <li key={i} className="text-dn-text">• {x}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-dn-violet text-xs uppercase tracking-widest mb-2">Partner</p>
                <ul className="flex flex-col gap-1">
                  {dw[me.id === "A" ? "B" : "A"].map((x, i) => <li key={i} className="text-dn-text">• {x}</li>)}
                </ul>
              </div>
            </div>
          ) : <p className="text-sm text-dn-muted">Submitted. Waiting for partner…</p>
        ) : (
          <>
            <textarea
              className="glass-textarea"
              placeholder="One per line…"
              value={dontWant}
              onChange={e => setDontWant(e.target.value)}
            />
            <button
              className="mt-3 px-5 py-2 rounded-pill text-sm font-semibold transition"
              style={{ background: "rgba(255,176,207,0.15)", border: "1px solid rgba(255,176,207,0.3)", color: "#ffb0cf" }}
              onClick={submitDontWant}>
              Lock my list
            </button>
          </>
        )}
      </div>

      <button onClick={submitPlan} disabled={iSubmittedPlan || !dw.revealed}
        className="px-8 py-3 rounded-pill bg-dn-rose-bright text-dn-bg font-bold disabled:opacity-50 hover:opacity-90 transition">
        {iSubmittedPlan ? "Waiting for partner…" : "Submit full plan"}
      </button>
    </div>
  );
}
