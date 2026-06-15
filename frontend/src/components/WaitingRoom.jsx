// frontend/src/components/WaitingRoom.jsx
import { useCountdown } from "../hooks/useCountdown.js";

export default function WaitingRoom({ me, state }) {
  const { label } = useCountdown();
  const partnerId = me.id === "A" ? "B" : "A";
  const partnerName = partnerId === "A" ? "User A" : "User B";
  const partnerOnline = state.presence[partnerId].online;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center fade-in gap-6 px-4">
      <div className="text-6xl">💗</div>
      <h2 className="font-display text-4xl text-dn-text text-center">
        The evening is about to begin
      </h2>

      {/* Participant status cards */}
      <div className="flex gap-4 w-full max-w-sm mt-2">
        {/* You */}
        <div className="glass-rose flex-1 flex flex-col items-center gap-2 p-5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{ background: "rgba(255,176,207,0.2)" }}>✓</div>
          <p className="text-xs font-bold uppercase tracking-widest text-dn-rose">You</p>
          <p className="text-xs text-dn-muted">Connected</p>
        </div>

        {/* Partner */}
        <div className={`flex-1 flex flex-col items-center gap-2 p-5 ${partnerOnline ? "glass-violet" : "glass"}`}
          style={{ opacity: partnerOnline ? 1 : 0.6 }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl animate-pulse"
            style={{ background: partnerOnline ? "rgba(202,190,255,0.2)" : "rgba(255,255,255,0.08)" }}>
            {partnerOnline ? "✓" : "⋯"}
          </div>
          <p className="text-xs font-bold uppercase tracking-widest"
            style={{ color: partnerOnline ? "#cabeff" : "#a28b92" }}>
            {partnerName}
          </p>
          <p className="text-xs text-dn-muted">{partnerOnline ? "Connected" : "Joining…"}</p>
        </div>
      </div>

      {/* Countdown */}
      <div className="glass px-8 py-4 text-center">
        <p className="text-dn-muted text-xs uppercase tracking-widest mb-1">Scheduled Start</p>
        <p className="text-dn-amber text-3xl font-bold">{label}</p>
      </div>
    </div>
  );
}
