const PLAYERS = [
  { id: "A", name: "User A", dot: "#ffb0cf", glow: "rgba(255,176,207,0.7)" },
  { id: "B", name: "User B", dot: "#cabeff", glow: "rgba(202,190,255,0.7)" },
];

export default function FloatingStatus({ me, state }) {
  return (
    <div className="fixed top-4 right-4 flex gap-2 z-30">
      {PLAYERS.map(({ id, name, dot, glow }) => {
        const online = state.presence[id].online;
        return (
          <div key={id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-pill text-xs font-semibold transition-opacity"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.15)",
              opacity: online ? 1 : 0.45,
            }}>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{
              background: online ? dot : "#555",
              boxShadow: online ? `0 0 6px ${glow}` : "none",
            }} />
            <span className={`text-dn-text ${me.id === id ? "font-bold" : "font-normal"}`}>{name}</span>
          </div>
        );
      })}
    </div>
  );
}
