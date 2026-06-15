import { useState } from "react";
import { getSocket } from "../socket.js";

function buildMarkdown(username, goals, date) {
  return `# My 100 Goals — ${username} — ${date}\n\n` + goals.map((g,i)=>`${i+1}. ${g}`).join("\n") + "\n";
}

export default function Stage4Goals({ me, state }) {
  const sock = getSocket();
  const goals = state.stage4.goals[me.id];
  const partnerId = me.id === "A" ? "B" : "A";
  const partnerAllowsFewer = state.stage4.allowFewer[partnerId];
  const [draft,setDraft]=useState("");
  const [editIdx,setEditIdx]=useState(null);

  const push = (next) => sock?.emit("stage4:goals", { goals: next });
  const add = () => { if(draft.trim()){ push([...goals, draft.trim()]); setDraft(""); } };
  const del = (i) => push(goals.filter((_,x)=>x!==i));
  const saveEdit = (i,val) => { push(goals.map((g,x)=> x===i?val:g)); setEditIdx(null); };
  const toggleAllow = (e) => sock?.emit("stage4:allowFewer", { value: e.target.checked });

  const canSubmit = goals.length>0 && (partnerAllowsFewer || goals.length>=100);
  const download = () => {
    const date = new Date().toISOString().slice(0,10);
    const blob = new Blob([buildMarkdown(me.name, goals, date)], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `100-goals-${me.id}.md`; a.click();
    sock?.emit("stage4:downloaded");
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto relative">
      <h2 className="text-3xl my-4 text-rosegold">Your 100 Goals ✨</h2>
      <div className="w-full bg-cream/10 rounded-full h-3 mb-2">
        <div className="bg-rosegold h-3 rounded-full" style={{ width: `${Math.min(100,goals.length)}%` }} />
      </div>
      <p className="text-sm mb-4">{goals.length} / 100 goals added</p>

      <div className="flex flex-col-reverse gap-2 mb-4">
        {goals.map((g,i)=>(
          <div key={i} className="flex items-center gap-2 bg-cream/10 rounded px-3 py-2">
            <span className="text-rosegold">{i+1}.</span>
            {editIdx===i
              ? <input autoFocus defaultValue={g} className="flex-1 bg-cream/10 rounded px-1"
                  onBlur={e=>saveEdit(i,e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveEdit(i,e.target.value)} />
              : <span className="flex-1 cursor-pointer" onClick={()=>setEditIdx(i)}>{g}</span>}
            <button onClick={()=>del(i)}>🗑️</button>
          </div>
        ))}
      </div>

      <input className="w-full p-2 rounded bg-cream/10 mb-4" placeholder="Type a goal, press Enter…"
        value={draft} onChange={e=>setDraft(e.target.value)}
        onKeyDown={e=>e.key==="Enter"&&add()} />

      <button onClick={download} disabled={!canSubmit}
        className="px-6 py-3 rounded-full bg-rosegold text-navy font-bold disabled:opacity-50">
        Finish & Download ⬇️
      </button>
      {state.stage4.downloaded[me.id] && <p className="text-sm mt-2 text-rosegold">Downloaded. Waiting for partner…</p>}

      <label className="fixed bottom-3 right-3 bg-black/70 p-2 rounded text-xs flex items-center gap-2 z-30">
        <input type="checkbox" checked={state.stage4.allowFewer[me.id]} onChange={toggleAllow} />
        Allow partner to submit with fewer than 100
      </label>
    </div>
  );
}
