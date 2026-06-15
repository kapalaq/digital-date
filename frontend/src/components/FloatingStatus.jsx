const COLORS = [
  { dot: "#ffb0cf", glow: "rgba(255,176,207,0.7)" },
  { dot: "#cabeff", glow: "rgba(202,190,255,0.7)" },
];

export default function FloatingStatus({ me, state }) {
  const { ida, idb, nameA, nameB } = state.meta;
  const players = [
    { id: ida, name: nameA, ...COLORS[0] },
    { id: idb, name: nameB, ...COLORS[1] },
  ];

  return (
    <div className="fixed bottom-4 right-4 flex gap-2 z-30">
      {players.map(({ id, name, dot, glow }) => {
        const online = state.presence[id].online;
        const isMe = me.id === id;
        return (
          <div key={id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-pill text-xs font-semibold transition-all"
            style={{
              background: !online && !isMe ? "rgba(40,16,16,0.90)" : "rgba(16,16,46,0.84)",
              backdropFilter: "blur(8px)",
              border: !online && !isMe ? "1px solid rgba(255,80,80,0.35)" : "1px solid rgba(255,255,255,0.18)",
            }}>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{
              background: online ? dot : (!isMe ? "#ff5050" : "#555"),
              boxShadow: online ? `0 0 6px ${glow}` : (!isMe ? "0 0 6px rgba(255,80,80,0.6)" : "none"),
            }} />
            <span className={`text-dn-text ${isMe ? "font-bold" : "font-normal"}`}>{name}</span>
            {!online && !isMe && (
              <span className="text-[10px] text-red-400 font-normal">offline</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
