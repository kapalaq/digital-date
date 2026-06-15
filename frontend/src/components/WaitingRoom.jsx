import { useCountdown } from "../hooks/useCountdown.js";
export default function WaitingRoom({ me, state }) {
  const { label } = useCountdown();
  const partner = me.id === "A" ? "User B" : "User A";
  return (
    <div className="min-h-screen flex flex-col items-center justify-center fade-in">
      <div className="text-6xl mb-6 animate-pulse">💗</div>
      <h2 className="text-2xl mb-2">Waiting for {partner}…</h2>
      <p className="text-rosegold text-lg">Date begins in {label}</p>
    </div>
  );
}
