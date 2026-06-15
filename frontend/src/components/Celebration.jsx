// frontend/src/components/Celebration.jsx
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function Celebration({ state }) {
  useEffect(() => {
    const end = Date.now() + 4000;
    (function frame() {
      confetti({
        particleCount: 5,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#ffb0cf", "#cabeff", "#ffb951"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  const country = state.stage2.result?.country || "—";

  const s5 = state.stage5;
  const culinaryWinner = (() => {
    if (!s5) return "Culinary game";
    const aHits = Object.values(s5.approvals?.A || {}).filter(Boolean).length;
    const bHits = Object.values(s5.approvals?.B || {}).filter(Boolean).length;
    const aExtra = (s5.bonusItems?.B || []).length;
    const bExtra = (s5.bonusItems?.A || []).length;
    const aPct = (aHits + aExtra) > 0 ? Math.round(aHits / (aHits + aExtra) * 100) : 0;
    const bPct = (bHits + bExtra) > 0 ? Math.round(bHits / (bHits + bExtra) * 100) : 0;
    if (aPct === bPct) return "Tie!";
    return aPct > bPct ? `A wins (${aPct}% vs ${bPct}%)` : `B wins (${bPct}% vs ${aPct}%)`;
  })();

  const achievements = [
    ["sports_esports", "Game Picked", "Co-op game session"],
    ["public", "Trip Chosen", country],
    ["self_improvement", "Activity Completed", "Couples yoga"],
    ["auto_awesome", "Goals Saved", "100 goals list"],
    ["restaurant", "Culinary Recall", culinaryWinner],
  ];

  return (
    <div className="min-h-screen dn-shell text-on-background flex flex-col items-center justify-center text-center p-safe-margin md:p-xl fade-in relative overflow-hidden">
      <main className="relative z-10 w-full max-w-[1200px] flex flex-col items-center">
        <header className="mb-xl">
          <span className="material-symbols-outlined text-tertiary text-6xl mb-md" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-sm">
            What a Night
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
            Another beautiful memory added to your shared journey.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-md w-full mb-xl">
          {achievements.map(([icon, title, value], index) => (
            <div key={title} className={`glass-panel rounded-xl p-md text-left ${index === 1 ? "md:col-span-2" : ""}`}>
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-primary">{icon}</span>
              </div>
              <p className="font-label-caps text-label-caps text-secondary mb-xs">{title}</p>
              <p className="font-title-sm text-title-sm text-on-surface">{value}</p>
            </div>
          ))}
        </section>

        <div className="glass-panel rounded-xl p-md md:p-lg max-w-xl w-full glow-active">
          <h2 className="font-headline-md-mobile text-headline-md-mobile text-on-surface mb-sm">
            Date complete
          </h2>
          <p className="text-on-surface-variant mb-md">Both partners finished the full journey.</p>
          <button className="w-full py-3 rounded-full btn-primary-glow font-title-sm">Save This Memory</button>
        </div>
      </main>
    </div>
  );
}
