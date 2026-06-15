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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 fade-in">
      <div className="text-8xl mb-6">💕</div>
      <h1 className="font-display text-5xl text-dn-rose mb-3">Date complete!</h1>
      <p className="text-dn-muted text-lg mb-10">See you next time 💞</p>
      <div className="glass-rose p-8 max-w-md w-full text-left">
        <h3 className="font-display text-xl text-dn-text mb-4">Tonight&apos;s recap</h3>
        <ul className="space-y-3 text-dn-muted">
          <li className="flex items-center gap-3">
            <span className="text-2xl">🎮</span>
            <span className="flex-1">Co-op game session</span>
            <span className="text-dn-amber">✓</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-2xl">🌍</span>
            <span className="flex-1">Next trip:</span>
            <span className="text-dn-rose">{country}</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-2xl">🧘</span>
            <span className="flex-1">Couples yoga</span>
            <span className="text-dn-amber">✓</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <span className="flex-1">100 goals set</span>
            <span className="text-dn-amber">✓</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
