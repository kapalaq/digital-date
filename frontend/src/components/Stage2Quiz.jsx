// frontend/src/components/Stage2Quiz.jsx
import { useState } from "react";
import { getSocket } from "../socket.js";
import { QUESTIONS } from "../data/questions.js";
import Stage2Result from "./Stage2Result.jsx";
import Stage2TripPlanner from "./Stage2TripPlanner.jsx";

// Icon mapping per question
const Q_ICONS = {
  q1:  "thermostat",
  q2:  "park",
  q3:  "payments",
  q4:  "calendar_month",
  q5:  "beach_access",
  q6:  "account_balance",
  q7:  "restaurant",
  q8:  "nightlife",
  q9:  "translate",
  q10: "flight_takeoff",
  q11: "public",
  q12: "luggage",
  q13: "location_on",
  q14: "schedule",
  q15: "favorite",
};

export default function Stage2Quiz({ me, state }) {
  const [ans, setAns] = useState({});

  const mySubmitted  = !!state.stage2.answers[me.id];
  const bothAnswered = state.stage2.answers.A && state.stage2.answers.B;

  if (bothAnswered && state.stage2.result) {
    return (
      <div className="min-h-screen p-6 max-w-2xl mx-auto">
        <Stage2Result result={state.stage2.result} />
        <Stage2TripPlanner me={me} state={state} />
      </div>
    );
  }

  if (mySubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
        {/* Ambient blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-secondary/10 blur-[120px]" />
        </div>

        {/* Header */}
        <header className="bg-surface/80 backdrop-blur-xl border-b border-white/15 fixed top-0 w-full z-50 flex justify-between items-center px-safe-margin h-16 max-w-[600px] mx-auto shadow-[0_0_20px_rgba(255,176,207,0.2)]">
          <div className="w-10 h-10 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </div>
          <h1 className="font-headline-md-mobile text-headline-md-mobile text-primary font-bold tracking-tight">Date Night</h1>
          <div className="w-10 h-10 rounded-full bg-surface-container-high border border-white/20 flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
          </div>
        </header>

        <main className="flex-grow pt-24 pb-32 px-safe-margin flex flex-col items-center justify-center z-10 w-full max-w-[600px] mx-auto">
          <div className="glass-card rounded-xl p-md w-full flex flex-col items-center gap-md text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container-highest border border-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>hourglass_top</span>
            </div>
            <p className="font-headline-md-mobile text-headline-md-mobile text-on-surface">Answers locked in!</p>
            <p className="font-body-md text-body-md text-on-surface-variant">Waiting for your partner to finish…</p>
            <div className="flex items-center gap-xs">
              <div className="w-2 h-2 rounded-full bg-primary animate-pip-pulse" />
              <div className="w-2 h-2 rounded-full bg-primary animate-pip-pulse" style={{ animationDelay: "0.4s" }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-pip-pulse" style={{ animationDelay: "0.8s" }} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  const set    = (q, val) => setAns(a => ({ ...a, [q]: val }));
  const toggle = (q, val) => setAns(a => {
    const cur = a[q] || [];
    return { ...a, [q]: cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val] };
  });
  const submit   = () => getSocket()?.emit("stage2:answers", { answers: ans });
  const complete = QUESTIONS.every(q => q.multi ? (ans[q.id]?.length > 0) : ans[q.id]);

  // Progress: count answered questions
  const answeredCount = QUESTIONS.filter(q => q.multi ? (ans[q.id]?.length > 0) : ans[q.id]).length;
  const myProgressPct = Math.round((answeredCount / QUESTIONS.length) * 100);
  const partnerAnswered = bothAnswered;
  const partnerProgressPct = mySubmitted ? 100 : (partnerAnswered ? 100 : 30);

  const playerA = me.id === "A" ? me : { id: "B", name: "Partner" };
  const playerB = me.id === "B" ? me : { id: "A", name: "Partner" };
  const myName = me.name || (me.id === "A" ? "You" : "Partner");
  const partnerName = me.id === "A" ? (state?.players?.B?.name || "Partner") : (state?.players?.A?.name || "Partner");

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      {/* Fixed header */}
      <header className="bg-surface/80 backdrop-blur-xl border-b border-white/15 fixed top-0 w-full z-50 flex justify-between items-center px-safe-margin h-16 max-w-[600px] mx-auto shadow-[0_0_20px_rgba(255,176,207,0.2)]">
        <div className="w-10 h-10 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </div>
        <h1 className="font-headline-md-mobile text-headline-md-mobile text-primary font-bold tracking-tight">Date Night</h1>
        <div className="w-10 h-10 rounded-full bg-surface-container-high border border-white/20 flex items-center justify-center overflow-hidden">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow pt-24 pb-32 px-safe-margin flex flex-col items-center z-10 w-full max-w-[600px] mx-auto">

        {/* Stage badge + title */}
        <div className="w-full flex flex-col items-center mb-md mt-sm">
          <span className="font-label-caps text-label-caps text-secondary uppercase mb-xs">Stage 2</span>
          <h2 className="font-headline-md-mobile text-headline-md-mobile text-on-surface">Travel Quiz</h2>
        </div>

        {/* Dual progress bar */}
        <div className="w-full mb-md">
          <div className="flex justify-between items-end mb-base">
            <span className="font-label-caps text-label-caps text-primary">{answeredCount}/{QUESTIONS.length} answered</span>
            <span className="font-label-caps text-label-caps text-secondary">
              {myProgressPct}% done
            </span>
          </div>
          <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden flex relative">
            {/* My progress from left */}
            <div
              className="h-full bg-gradient-to-r from-primary-container to-primary rounded-r-full absolute left-0 z-10 transition-all duration-500"
              style={{ width: `${myProgressPct}%`, boxShadow: "0 0 15px rgba(255,176,207,0.5)" }}
            />
            {/* Partner progress from right (static placeholder) */}
            <div
              className="h-full bg-gradient-to-l from-secondary-container to-secondary rounded-l-full absolute right-0 z-10 transition-all duration-500"
              style={{ width: "0%", boxShadow: "0 0 15px rgba(202,190,255,0.5)" }}
            />
          </div>
        </div>

        {/* Question cards */}
        <div className="w-full flex flex-col gap-md">
          {QUESTIONS.map((q, idx) => {
            const cur = ans[q.id];
            const icon = Q_ICONS[q.id] || "help_outline";
            const isAnswered = q.multi ? (cur?.length > 0) : !!cur;

            return (
              <div
                key={q.id}
                className={`glass-card rounded-xl p-md w-full flex flex-col items-center transition-all duration-300 ${isAnswered ? "glow-active" : ""}`}
              >
                {/* Icon badge */}
                <div className="w-16 h-16 rounded-full bg-surface-container-highest border border-white/10 flex items-center justify-center mb-md shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                  <span
                    className="material-symbols-outlined text-primary text-[32px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {icon}
                  </span>
                </div>

                {/* Question number + text */}
                <p className="font-label-caps text-label-caps text-primary mb-xs">
                  {idx + 1} / {QUESTIONS.length}
                </p>
                <h3 className="font-display-lg-mobile text-display-lg-mobile text-center text-on-surface mb-lg">
                  {q.text}
                </h3>

                {/* Options */}
                <div className="w-full flex flex-col gap-base">
                  {q.opts.map(([val, label]) => {
                    const active = q.multi ? (cur || []).includes(val) : cur === val;
                    return (
                      <button
                        key={val}
                        onClick={() => q.multi ? toggle(q.id, val) : set(q.id, val)}
                        className={`w-full py-4 px-gutter rounded-full border transition-all duration-200 flex items-center justify-between group active:scale-95
                          ${active
                            ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(255,176,207,0.2)]"
                            : "border-white/15 bg-surface-container-low hover:bg-surface-container hover:border-primary/50"
                          }`}
                      >
                        <span className={`font-title-sm text-title-sm transition-colors ${active ? "text-primary" : "text-on-surface group-hover:text-primary"}`}>
                          {label}
                        </span>
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors flex-shrink-0
                          ${active ? "border-primary bg-primary" : "border-outline group-hover:border-primary"}`}>
                          <span
                            className={`material-symbols-outlined text-[16px] transition-colors ${active ? "text-on-primary" : "text-transparent"}`}
                            style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}
                          >
                            check
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit button */}
        <button
          onClick={submit}
          disabled={!complete}
          className="w-full mt-lg py-4 px-gutter rounded-full bg-gradient-to-r from-primary-container to-primary text-on-primary font-title-sm text-title-sm font-bold disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all duration-200 shadow-[0_0_20px_rgba(255,176,207,0.3)]"
        >
          Lock in my answers
        </button>

        {/* Player status row */}
        <div className="w-full flex justify-between items-center px-md mt-lg">
          {/* My status (left — primary color) */}
          <div className="flex items-center gap-sm">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-primary shadow-[0_0_10px_rgba(255,176,207,0.4)] flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[18px]">person</span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-background flex items-center justify-center ${complete ? "bg-primary" : "bg-surface-variant"}`}>
                {complete
                  ? <span className="material-symbols-outlined text-on-primary text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  : <div className="w-2 h-2 rounded-full bg-primary animate-pip-pulse" />
                }
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-primary">{myName}</span>
              <span className="text-[10px] text-on-surface-variant">{complete ? "Ready" : "Answering…"}</span>
            </div>
          </div>

          <div className="h-px bg-white/10 flex-grow mx-md" />

          {/* Partner status (right — secondary color) */}
          <div className="flex items-center gap-sm flex-row-reverse">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-surface-variant opacity-60 flex items-center justify-center grayscale">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">person</span>
              </div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-surface-variant rounded-full border border-background flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-on-surface-variant animate-pip-pulse" />
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-label-caps text-label-caps text-secondary">{partnerName}</span>
              <span className="text-[10px] text-on-surface-variant">Thinking…</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
