import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function Celebration({ state }) {
  useEffect(() => {
    const end = Date.now() + 3000;
    (function frame() {
      confetti({ particleCount: 4, spread: 70, origin: { y: 0.6 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);
  const country = state.stage2.result?.country || "—";
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <div className="text-7xl mb-4">💕</div>
      <h1 className="text-4xl text-rosegold mb-2">Date complete!</h1>
      <p className="text-xl mb-6">See you next time 💞</p>
      <div className="bg-navy/60 rounded-2xl p-6 border border-rosegold/30 text-left">
        <h3 className="text-rosegold mb-2">Tonight's recap</h3>
        <ul className="space-y-1">
          <li>🎮 Co-op game session ✓</li>
          <li>🌍 Next trip: {country}</li>
          <li>🧘 Couples yoga ✓</li>
          <li>✨ 100 goals set ✓</li>
        </ul>
      </div>
    </div>
  );
}
