// frontend/src/components/WaitingRoom.jsx
import { useCountdown } from "../hooks/useCountdown.js";

export default function WaitingRoom({ me, state }) {
  const { label } = useCountdown();
  const partnerId   = me.id === "A" ? "B" : "A";
  const partnerName = partnerId === "A" ? "User A" : "User B";
  const partnerOnline = state.presence[partnerId].online;

  return (
    <div className="min-h-screen bg-background text-on-background relative overflow-hidden font-body-md">
      {/* Stars background */}
      <div className="absolute inset-0 bg-stars opacity-40 z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-surface/80 via-surface-container/50 to-surface-container-low/90 z-0" />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-safe-margin max-w-[600px] mx-auto pt-16">
        {/* Header text */}
        <div className="text-center mb-12">
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-xs drop-shadow-[0_0_15px_rgba(255,176,207,0.3)]">
            Date Night
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">The evening is about to begin</p>
        </div>

        {/* Pulsing heart */}
        <div className="relative flex items-center justify-center w-64 h-64 mb-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 pulse-ring" />
          <div className="absolute inset-4 rounded-full border-2 border-primary/20 pulse-ring" style={{ animationDelay: "0.5s" }} />
          <div className="absolute inset-8 rounded-full border-2 border-primary/10 pulse-ring" style={{ animationDelay: "1s" }} />
          <div className="relative z-10 w-32 h-32 rounded-full glass-card flex items-center justify-center heart-beat">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 64, fontVariationSettings: "'FILL' 1" }}>favorite</span>
          </div>
          <div className="absolute -bottom-8 w-full text-center">
            <p className="font-title-sm text-title-sm text-on-surface animate-pulse">Waiting for your partner...</p>
          </div>
        </div>

        {/* Status cards */}
        <div className="w-full space-y-md mb-12">
          {/* You */}
          <div className="glass-card rounded-lg p-md flex items-center justify-between glow-active transition-all duration-300">
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 relative">
                <span className="material-symbols-outlined text-primary">person</span>
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border border-surface shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
              </div>
              <div>
                <p className="font-title-sm text-title-sm text-on-surface">You</p>
                <p className="font-body-md text-body-md text-primary text-sm">Connected</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-primary animate-bounce">check_circle</span>
          </div>

          {/* Partner */}
          <div className={`glass-card rounded-lg p-md flex items-center justify-between transition-all duration-300 ${partnerOnline ? "border-secondary/30" : ""}`}>
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/30 relative">
                <span className="material-symbols-outlined text-secondary">person_add</span>
                <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-surface ${partnerOnline ? "bg-green-400" : "bg-yellow-400 animate-pulse"}`} />
              </div>
              <div>
                <p className="font-title-sm text-title-sm text-on-surface">{partnerName}</p>
                <p className={`font-body-md text-body-md text-sm ${partnerOnline ? "text-secondary" : "text-secondary animate-pulse"}`}>
                  {partnerOnline ? "Connected" : "Joining..."}
                </p>
              </div>
            </div>
            {partnerOnline
              ? <span className="material-symbols-outlined text-secondary">check_circle</span>
              : (
                <div className="flex gap-1">
                  {[0, 0.2, 0.4].map(d => (
                    <div key={d} className="w-2 h-2 rounded-full bg-secondary/50 animate-bounce" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* Countdown */}
        <div className="text-center w-full">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-sm uppercase tracking-widest">Scheduled Start</p>
          <div className="font-display-lg-mobile text-display-lg-mobile text-on-surface mb-lg flex items-center justify-center gap-2">
            <span>{label}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
