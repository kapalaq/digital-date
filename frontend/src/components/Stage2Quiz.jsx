import { useState } from "react";
import { getSocket } from "../socket.js";
import { QUESTIONS } from "../data/questions.js";
import Stage2Result from "./Stage2Result.jsx";
import Stage2TripPlanner from "./Stage2TripPlanner.jsx";

export default function Stage2Quiz({ me, state }) {
  const [ans, setAns] = useState({});
  const mySubmitted = !!state.stage2.answers[me.id];
  const bothAnswered = state.stage2.answers.A && state.stage2.answers.B;

  if (bothAnswered && state.stage2.result) {
    return (
      <div className="min-h-screen p-4 max-w-2xl mx-auto">
        <Stage2Result result={state.stage2.result} />
        <Stage2TripPlanner me={me} state={state} />
      </div>
    );
  }
  if (mySubmitted) return <Centered>Answers locked in. Waiting for partner…</Centered>;

  const set = (q, val) => setAns(a => ({ ...a, [q]: val }));
  const toggle = (q, val) => setAns(a => {
    const cur = a[q] || []; return { ...a, [q]: cur.includes(val) ? cur.filter(x=>x!==val) : [...cur, val] };
  });
  const submit = () => getSocket()?.emit("stage2:answers", { answers: ans });
  const complete = QUESTIONS.every(q => q.multi ? (ans[q.id]?.length>0) : ans[q.id]);

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <h2 className="text-3xl my-4 text-rosegold">Where to next? 🌍</h2>
      {QUESTIONS.map(q => (
        <div key={q.id} className="mb-5">
          <p className="mb-2 font-semibold">{q.text}</p>
          <div className="flex flex-wrap gap-2">
            {q.opts.map(([val,label]) => {
              const active = q.multi ? (ans[q.id]||[]).includes(val) : ans[q.id]===val;
              return <button key={val} onClick={()=> q.multi ? toggle(q.id,val) : set(q.id,val)}
                className={`px-3 py-1 rounded-full border ${active ? "bg-rosegold text-navy" : "border-rosegold/40"}`}>{label}</button>;
            })}
          </div>
        </div>
      ))}
      <button onClick={submit} disabled={!complete}
        className="px-6 py-3 rounded-full bg-rosegold text-navy font-bold disabled:opacity-50 my-4">Submit answers</button>
    </div>
  );
}
function Centered({ children }) {
  return <div className="min-h-screen flex items-center justify-center text-xl">{children}</div>;
}
