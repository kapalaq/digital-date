import { useState } from "react";
import { getSocket } from "../socket.js";
import { QUESTIONS } from "../data/questions.js";
import Stage2Result from "./Stage2Result.jsx";
import Stage2TripPlanner from "./Stage2TripPlanner.jsx";

// Per-question color maps for the "mirrors your choice" card bg
const Q_COLORS = {
  q1:  { cold: "#0d1f35", mild: "#0e2818", hot: "#2d1500" },
  q2:  { nature: "#0e2818", city: "#1e1035" },
  q3:  { budget: "#1c1c1c", mid: "#2a1c00", luxury: "#2a2000" },
  q5:  { beach: "#082030", mountains: "#181828" },
  q15: { romance: "#2a0d18", adventure: "#2a1800", relaxation: "#0d2020", culture: "#18102a" },
};
const DEFAULT_CARD_BG = "rgba(255,255,255,0.04)";

function cardStyle(q, ans) {
  const val = Array.isArray(ans) ? (ans?.[0] ?? null) : (ans ?? null);
  const color = val && Q_COLORS[q.id]?.[val];
  return {
    backgroundColor: color || DEFAULT_CARD_BG,
    transition: "background-color 0.45s ease",
  };
}

export default function Stage2Quiz({ me, state }) {
  const [ans, setAns] = useState({});
  const mySubmitted  = !!state.stage2.answers[me.id];
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

  const set    = (q, val) => setAns(a => ({ ...a, [q]: val }));
  const toggle = (q, val) => setAns(a => {
    const cur = a[q] || [];
    return { ...a, [q]: cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val] };
  });
  const submit   = () => getSocket()?.emit("stage2:answers", { answers: ans });
  const complete = QUESTIONS.every(q => q.multi ? (ans[q.id]?.length > 0) : ans[q.id]);

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <h2 className="text-3xl my-6 text-rosegold font-bold">Where to next? 🌍</h2>

      {QUESTIONS.map((q, idx) => {
        const cur = ans[q.id];
        return (
          <div key={q.id} className="mb-4 rounded-2xl p-5 border border-white/10"
            style={cardStyle(q, cur)}>
            <p className="text-xs text-rosegold/60 font-semibold mb-1 uppercase tracking-widest">
              {idx + 1} / {QUESTIONS.length}
            </p>
            <p className="mb-3 font-semibold text-cream text-base">{q.text}</p>
            <div className="flex flex-wrap gap-2">
              {q.opts.map(([val, label]) => {
                const active = q.multi
                  ? (cur || []).includes(val)
                  : cur === val;
                return (
                  <button key={val}
                    onClick={() => q.multi ? toggle(q.id, val) : set(q.id, val)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all
                      ${active
                        ? "bg-rosegold text-navy border-rosegold"
                        : "border-rosegold/30 text-cream/80 hover:border-rosegold/60"}`}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <button onClick={submit} disabled={!complete}
        className="px-6 py-3 rounded-full bg-rosegold text-navy font-bold disabled:opacity-40 my-6 transition">
        Submit answers
      </button>
    </div>
  );
}

function Centered({ children }) {
  return <div className="min-h-screen flex items-center justify-center text-xl">{children}</div>;
}
