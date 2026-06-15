import { useState } from "react";
import { getSocket } from "../socket.js";

function DynList({ label, items, onChange }) {
  const [draft,setDraft]=useState("");
  return (
    <div className="mb-4">
      <p className="font-semibold mb-1">{label}</p>
      <ul className="mb-2">{items.map((it,i)=>(
        <li key={i} className="flex justify-between bg-cream/10 rounded px-2 py-1 mb-1">
          <span>{it}</span>
          <button onClick={()=>onChange(items.filter((_,x)=>x!==i))}>✕</button>
        </li>))}
      </ul>
      <div className="flex gap-2">
        <input className="flex-1 p-1 rounded bg-cream/10" value={draft} onChange={e=>setDraft(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter"&&draft.trim()){ onChange([...items,draft.trim()]); setDraft(""); }}} />
        <button className="px-3 bg-rosegold text-navy rounded" onClick={()=>{ if(draft.trim()){onChange([...items,draft.trim()]); setDraft("");}}}>+</button>
      </div>
    </div>
  );
}

export default function Stage2TripPlanner({ me, state }) {
  const sock = getSocket();
  const plan = state.stage2.plan;
  const dw = state.stage2.dontWant;
  const [dontWant,setDontWant]=useState("");
  const updatePlan = (patch) => sock?.emit("stage2:plan", { plan: { ...plan, ...patch } });
  const submitDontWant = () => sock?.emit("stage2:dontWant", { list: dontWant.split("\n").filter(Boolean) });
  const submitPlan = () => sock?.emit("stage2:planSubmit");
  const iSubmittedDW = !!dw[me.id];
  const iSubmittedPlan = state.stage2.planSubmitted[me.id];

  return (
    <div className="mt-6">
      <h3 className="text-2xl text-rosegold mb-4">Plan the trip ✈️</h3>
      <label className="block mb-3">Destination
        <input className="w-full p-2 rounded bg-cream/10 mt-1" value={plan.destination} readOnly /></label>
      <label className="block mb-3">Hotel 🏨
        <input className="w-full p-2 rounded bg-cream/10 mt-1" value={plan.hotel}
          onChange={e=>updatePlan({ hotel: e.target.value })} /></label>
      <DynList label="🍽️ Restaurants" items={plan.restaurants} onChange={r=>updatePlan({ restaurants: r })} />
      <DynList label="🎯 Activities" items={plan.activities} onChange={a=>updatePlan({ activities: a })} />
      <label className="block mb-4">📅 Approximate dates
        <input className="w-full p-2 rounded bg-cream/10 mt-1" value={plan.dates}
          onChange={e=>updatePlan({ dates: e.target.value })} /></label>

      <div className="p-4 rounded-xl bg-navy/60 border border-rosegold/30 mb-4">
        <p className="font-semibold mb-2">🚫 Things I do NOT want my partner to do (private until both submit)</p>
        {iSubmittedDW ? (
          dw.revealed ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-rosegold">You</p><ul>{dw[me.id].map((x,i)=><li key={i}>• {x}</li>)}</ul></div>
              <div><p className="text-rosegold">Partner</p><ul>{dw[me.id==="A"?"B":"A"].map((x,i)=><li key={i}>• {x}</li>)}</ul></div>
            </div>
          ) : <p className="text-sm text-cream/60">Submitted. Waiting for partner to reveal…</p>
        ) : (
          <>
            <textarea className="w-full p-2 rounded bg-cream/10 h-24" placeholder="One per line…"
              value={dontWant} onChange={e=>setDontWant(e.target.value)} />
            <button className="mt-2 px-4 py-1 rounded bg-rosegold text-navy" onClick={submitDontWant}>Lock my list</button>
          </>
        )}
      </div>

      <button onClick={submitPlan} disabled={iSubmittedPlan || !dw.revealed}
        className="px-6 py-3 rounded-full bg-rosegold text-navy font-bold disabled:opacity-50">
        {iSubmittedPlan ? "Waiting for partner…" : "Submit full plan"}
      </button>
    </div>
  );
}
