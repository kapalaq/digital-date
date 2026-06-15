// frontend/src/components/Stage2TripPlanner.jsx
import { useState } from "react";
import { getSocket } from "../socket.js";

function DynList({ label, items, onChange }) {
  const [draft, setDraft] = useState("");
  return (
    <div>
      <p className="font-label-caps text-label-caps text-on-surface-variant mb-sm">{label}</p>
      <ul className="mb-sm flex flex-wrap gap-sm">
        {items.map((it, i) => (
          <li key={i}
            className="goal-chip flex items-center gap-sm px-4 py-2 text-sm text-on-surface bg-white/[0.06] border border-white/10 rounded-full">
            <span className="truncate max-w-[14rem]">{it}</span>
            <button onClick={() => onChange(items.filter((_, x) => x !== i))}
              aria-label={`Remove ${it}`}
              className="text-on-surface-variant/60 hover:text-error">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          className="glass-input flex-1 text-sm rounded-lg"
          placeholder="Add..."
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && draft.trim()) { onChange([...items, draft.trim()]); setDraft(""); }
          }}
        />
        <button
          className="dn-icon-button text-primary"
          aria-label={`Add ${label}`}
          onClick={() => { if (draft.trim()) { onChange([...items, draft.trim()]); setDraft(""); } }}>
          <span className="material-symbols-outlined">add</span>
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
    <section className="mt-lg fade-in grid grid-cols-1 xl:grid-cols-[1fr_22rem] gap-lg">
      <div className="flex flex-col gap-md">
        <div>
          <p className="font-label-caps text-label-caps text-secondary mb-xs">Trip Planner</p>
          <h3 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-on-surface">
            Build the first draft together
          </h3>
        </div>

        <div className="glass-panel rounded-xl p-md md:p-lg flex flex-col gap-md">
          <label className="block">
          <span className="font-label-caps text-label-caps text-on-surface-variant">Destination</span>
          <input className="glass-input mt-sm rounded-lg"
            value={plan.destination} readOnly />
        </label>
        <label className="block">
          <span className="font-label-caps text-label-caps text-on-surface-variant">Hotel</span>
          <input className="glass-input mt-sm rounded-lg"
            value={plan.hotel} onChange={e => updatePlan({ hotel: e.target.value })} />
        </label>
        <DynList label="Restaurants" items={plan.restaurants} onChange={r => updatePlan({ restaurants: r })} />
        <DynList label="Activities"   items={plan.activities}  onChange={a => updatePlan({ activities: a })} />
        <label className="block">
          <span className="font-label-caps text-label-caps text-on-surface-variant">Approximate dates</span>
          <input className="glass-input mt-sm rounded-lg"
            value={plan.dates} onChange={e => updatePlan({ dates: e.target.value })} />
        </label>
      </div>
      </div>

      <aside className="glass-panel rounded-xl p-md md:p-lg h-fit border-primary/30">
        <div className="flex items-center gap-sm mb-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">visibility_off</span>
          </div>
          <div>
            <p className="font-title-sm text-title-sm text-on-surface">No-go list</p>
            <p className="text-sm text-on-surface-variant">Private until both submit</p>
          </div>
        </div>
        {iSubmittedDW ? (
          dw.revealed ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-sm text-sm">
              <div>
                <p className="font-label-caps text-label-caps text-primary mb-xs">You</p>
                <ul className="flex flex-col gap-1">
                  {dw[me.id].map((x, i) => <li key={i} className="text-on-surface">{x}</li>)}
                </ul>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-secondary mb-xs">Partner</p>
                <ul className="flex flex-col gap-1">
                  {dw[me.id === "A" ? "B" : "A"].map((x, i) => <li key={i} className="text-on-surface">{x}</li>)}
                </ul>
              </div>
            </div>
          ) : <p className="text-sm text-on-surface-variant">Submitted. Waiting for partner...</p>
        ) : (
          <>
            <textarea
              className="glass-textarea min-h-[8rem]"
              placeholder="One per line..."
              value={dontWant}
              onChange={e => setDontWant(e.target.value)}
            />
            <button
              className="mt-sm px-5 py-2 rounded-full text-sm font-semibold btn-secondary-glass text-primary"
              onClick={submitDontWant}>
              Lock my list
            </button>
          </>
        )}
        <button onClick={submitPlan} disabled={iSubmittedPlan || !dw.revealed}
          className="mt-md w-full px-8 py-3 rounded-full btn-primary-glow font-bold">
          {iSubmittedPlan ? "Waiting for partner..." : "Submit full plan"}
        </button>
      </aside>

    </section>
  );
}
