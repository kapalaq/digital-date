// frontend/src/components/AnswerComparison.jsx
import { QUESTIONS } from "../data/questions.js";

function getLabel(q, val) {
  const opt = q.opts.find(([v]) => v === val);
  return opt ? opt[1] : val;
}

function answerLabel(q, val) {
  if (Array.isArray(val)) {
    return val.length > 0 ? val.map(v => getLabel(q, v)).join(", ") : "—";
  }
  return val ? getLabel(q, val) : "—";
}

function isMatch(q, a, b) {
  if (q.multi) {
    const setA = new Set(a || []);
    return (b || []).some(v => setA.has(v));
  }
  return a != null && a === b;
}

export default function AnswerComparison({ answersA, answersB, nameA, nameB }) {
  return (
    <section className="mt-lg fade-in glass-panel rounded-xl p-md md:p-lg">
      <p className="font-label-caps text-label-caps text-secondary mb-md">Your Answers</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left font-label-caps text-label-caps text-on-surface-variant pb-sm pr-md w-[35%]">
                Question
              </th>
              <th className="text-left font-label-caps text-label-caps text-primary pb-sm pr-md w-[32%]">
                {nameA}
              </th>
              <th className="text-left font-label-caps text-label-caps text-secondary pb-sm w-[33%]">
                {nameB}
              </th>
            </tr>
          </thead>
          <tbody>
            {QUESTIONS.map(q => {
              const a = answersA?.[q.id];
              const b = answersB?.[q.id];
              const match = isMatch(q, a, b);
              return (
                <tr
                  key={q.id}
                  className={`border-t border-white/5 ${match ? "bg-primary/5" : "bg-secondary/5"}`}
                >
                  <td className="py-sm pr-md text-on-surface-variant">{q.text}</td>
                  <td className={`py-sm pr-md font-medium ${match ? "text-primary" : "text-on-surface"}`}>
                    {answerLabel(q, a)}
                  </td>
                  <td className={`py-sm font-medium ${match ? "text-primary" : "text-on-surface"}`}>
                    {answerLabel(q, b)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
