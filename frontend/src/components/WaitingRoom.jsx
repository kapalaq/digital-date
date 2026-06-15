// frontend/src/components/WaitingRoom.jsx
import { useCountdown } from "../hooks/useCountdown.js";

export default function WaitingRoom({ me, state }) {
  const { label } = useCountdown();
  const partner = me.id === "A" ? "User B" : "User A";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center fade-in gap-4 px-4">
      <div className="text-7xl animate-pulse">💗</div>
      <h2 className="font-display text-4xl text-dn-text text-center">
        Waiting for {partner}…
      </h2>
      <p className="text-dn-muted text-xs tracking-widest uppercase">date begins in</p>
      <p className="text-dn-amber text-3xl font-bold">{label}</p>
    </div>
  );
}
