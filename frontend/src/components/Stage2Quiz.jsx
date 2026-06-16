// frontend/src/components/Stage2Quiz.jsx
import { useState } from "react";
import { getSocket } from "../socket.js";
import { QUESTIONS } from "../data/questions.js";
import { COUNTRIES, MAX_EXCLUSIONS } from "../data/countries.js";
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
  const [currentQ, setCurrentQ] = useState(0);
  const [excluded, setExcluded] = useState([]);
  const EXCLUSION_STEP = QUESTIONS.length; // step index after all questions

  const mySubmitted  = !!state.stage2.answers[me.id];
  const bothAnswered = state.stage2.answers[state.meta.ida] && state.stage2.answers[state.meta.idb];

  if (bothAnswered && state.stage2.result) {
    return (
      <div className="min-h-screen dn-shell text-on-background relative overflow-x-hidden">
        <header className="dn-topbar fixed top-0 w-full z-50">
          <div className="h-16 max-w-[1200px] mx-auto px-safe-margin md:px-xl flex items-center justify-center">
            <div className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary">
              Date Night
            </div>
          </div>
        </header>
        <main className="pt-24 pb-xl px-safe-margin md:px-xl max-w-[1200px] mx-auto">
          <Stage2Result
            result={state.stage2.result}
            answersA={state.stage2.answers[state.meta.ida]}
            answersB={state.stage2.answers[state.meta.idb]}
            nameA={state.meta.nameA}
            nameB={state.meta.nameB}
          />
          <Stage2TripPlanner me={me} state={state} />
        </main>
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
        <header className="bg-surface/80 backdrop-blur-xl border-b border-white/15 fixed top-0 w-full z-50 shadow-[0_0_20px_rgba(255,176,207,0.2)]">
          <div className="flex items-center justify-center px-safe-margin h-16 max-w-[600px] mx-auto">
            <h1 className="font-headline-md-mobile text-headline-md-mobile text-primary font-bold tracking-tight">Date Night</h1>
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
  const toggleExclusion = (name) => setExcluded(prev =>
    prev.includes(name)
      ? prev.filter(x => x !== name)
      : prev.length < MAX_EXCLUSIONS ? [...prev, name] : prev
  );
  const submit = () => {
    const sock = getSocket();
    sock?.emit("stage2:answers", { answers: ans });
    sock?.emit("stage2:dontWant", { list: excluded });
  };
  const complete = QUESTIONS.every(q => q.multi ? (ans[q.id]?.length > 0) : ans[q.id]);

  // Progress: currentQ across questions + exclusion step
  const totalSteps = QUESTIONS.length + 1;
  const myProgressPct = Math.round((currentQ / totalSteps) * 100);
  const partnerAnswered = bothAnswered;
  const partnerProgressPct = mySubmitted ? 100 : (partnerAnswered ? 100 : 30);
  const partnerDone = partnerAnswered;

  const myName = me.name || "You";
  const partnerName = me.id === state.meta.ida ? state.meta.nameB : state.meta.nameA;

  const isExclusionStep = currentQ === EXCLUSION_STEP;
  const q = !isExclusionStep ? QUESTIONS[currentQ] : null;
  const cur = q ? ans[q.id] : null;
  const icon = q ? (Q_ICONS[q.id] || "help_outline") : "block";
  const isAnswered = isExclusionStep ? true : (q.multi ? (cur?.length > 0) : !!cur);
  const isLast = currentQ === QUESTIONS.length - 1;

  const handleNext = () => {
    if (isExclusionStep) {
      submit();
    } else if (isLast) {
      setCurrentQ(EXCLUSION_STEP);
    } else {
      setCurrentQ(i => i + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      {/* Fixed header */}
      <header className="bg-surface/80 backdrop-blur-xl border-b border-white/15 fixed top-0 w-full z-50 shadow-[0_0_20px_rgba(255,176,207,0.2)]">
        <div className="flex items-center justify-center px-safe-margin h-16 max-w-[600px] mx-auto">
          <h1 className="font-headline-md-mobile text-headline-md-mobile text-primary font-bold tracking-tight">Date Night</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow pt-24 pb-32 px-safe-margin flex flex-col items-center z-10 w-full max-w-[600px] mx-auto">

        {/* Dual progress bar */}
        <div className="w-full mb-md">
          <div className="flex justify-between items-end mb-base">
            <span className="font-label-caps text-label-caps text-primary">
              {isExclusionStep ? "Extra" : `Question ${currentQ + 1}/${QUESTIONS.length}`}
            </span>
            <span className="font-label-caps text-label-caps text-secondary">Stage 2</span>
          </div>
          <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden flex relative">
            {/* My progress from left */}
            <div
              className="h-full bg-gradient-to-r from-primary-container to-primary rounded-r-full absolute left-0 z-10 transition-all duration-500"
              style={{ width: `${myProgressPct}%`, boxShadow: "0 0 15px rgba(255,176,207,0.5)" }}
            />
            {/* Connection glow dot */}
            <div
              className="h-full w-4 absolute rounded-full z-20 opacity-0"
              style={{
                left: `${myProgressPct}%`,
                background: '#df9c33',
                boxShadow: '0 0 25px rgba(223,156,51,0.8)',
                opacity: myProgressPct > 0 && myProgressPct < 100 ? 1 : 0
              }}
            />
            {/* Partner progress from right */}
            <div
              className="h-full bg-gradient-to-l from-secondary-container to-secondary rounded-l-full absolute right-0 z-10 transition-all duration-500"
              style={{ width: `${partnerProgressPct}%`, boxShadow: "0 0 15px rgba(202,190,255,0.5)" }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="w-full flex-grow flex flex-col justify-center">
          {isExclusionStep ? (
            <div className="glass-card rounded-lg p-md w-full flex flex-col items-center mb-xl">
              {/* Icon badge */}
              <div className="w-16 h-16 rounded-full bg-surface-container-highest border border-white/10 flex items-center justify-center mb-md shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  block
                </span>
              </div>
              <p className="font-label-caps text-label-caps text-primary mb-xs">Optional · {excluded.length}/{MAX_EXCLUSIONS}</p>
              <h3 className="font-display-lg-mobile text-display-lg-mobile text-center text-on-surface mb-xs">
                Countries you'd rather skip
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant text-center mb-lg">
                Select up to {MAX_EXCLUSIONS} destinations to exclude from your match.
              </p>
              <div className="w-full grid grid-cols-2 gap-base max-h-[420px] overflow-y-auto pr-1">
                {COUNTRIES.map(({ name, flag }) => {
                  const active = excluded.includes(name);
                  const atLimit = excluded.length >= MAX_EXCLUSIONS && !active;
                  return (
                    <button
                      key={name}
                      onClick={() => toggleExclusion(name)}
                      disabled={atLimit}
                      className={`py-3 px-sm rounded-xl border transition-all duration-200 flex items-center gap-sm active:scale-95 disabled:opacity-30
                        ${active
                          ? "border-error bg-error/10 shadow-[0_0_12px_rgba(255,100,100,0.2)]"
                          : "border-white/15 bg-surface-container-low hover:bg-surface-container hover:border-white/30"
                        }`}
                    >
                      <span className="text-xl flex-shrink-0">{flag}</span>
                      <span className={`font-body-md text-body-md text-left leading-tight ${active ? "text-error" : "text-on-surface"}`}>
                        {name}
                      </span>
                      {active && (
                        <span className="material-symbols-outlined text-error text-[16px] ml-auto flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                          close
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div
              className={`glass-card rounded-lg p-md w-full flex flex-col items-center mb-xl transition-all duration-300 ${isAnswered ? "glow-active" : ""}`}
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
                {currentQ + 1} / {QUESTIONS.length}
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
          )}
        </div>

        {/* Next / Submit button */}
        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className="w-full py-4 px-gutter rounded-full bg-gradient-to-r from-primary-container to-primary text-on-primary font-title-sm text-title-sm font-bold disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all duration-200 shadow-[0_0_20px_rgba(255,176,207,0.3)]"
        >
          {isExclusionStep ? "Lock in my answers" : "Next"}
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
                {partnerDone
                  ? <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                  : <span className="material-symbols-outlined text-on-surface-variant/50 text-sm">more_horiz</span>
                }
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-label-caps text-label-caps text-secondary">{partnerName}</span>
              <span className="text-[10px] text-on-surface-variant">{partnerDone ? "Ready" : "Thinking…"}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
