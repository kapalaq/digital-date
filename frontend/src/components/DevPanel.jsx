// frontend/src/components/DevPanel.jsx
import { getSocket } from "../socket.js";
import { useCountdown } from "../hooks/useCountdown.js";

const PHASES = ["waiting", "lobby", "stage1", "stage2", "stage3", "stage4", "stage5", "done"];

export default function DevPanel({ state, me }) {
  const { label } = useCountdown();
  const skip = (phase) => getSocket()?.emit("dev:setPhase", { phase });

  return (
    <div className="fixed bottom-3 left-3 text-xs p-3 rounded-card z-50 w-56"
      style={{
        background: "rgba(10,10,40,0.92)",
        border: "1px solid rgba(255,176,207,0.2)",
        backdropFilter: "blur(8px)",
      }}>
      <div className="font-bold text-dn-rose mb-2 tracking-widest uppercase text-xs">
        DEV · {me.id}
      </div>
      <div className="text-dn-muted mb-0.5">
        phase: <span className="text-dn-text">{state.phase}</span>
      </div>
      <div className="text-dn-muted mb-0.5">
        A: <span className="text-dn-text">{String(state.presence[state.meta.ida]?.online)}</span>
      </div>
      <div className="text-dn-muted mb-0.5">
        B: <span className="text-dn-text">{String(state.presence[state.meta.idb]?.online)}</span>
      </div>
      <div className="text-dn-muted mb-2">
        t: <span className="text-dn-text">{label}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {PHASES.map(p => (
          <button key={p} onClick={() => skip(p)}
            className="px-1.5 py-0.5 rounded text-xs transition"
            style={{
              background: "rgba(255,176,207,0.12)",
              border: "1px solid rgba(255,176,207,0.2)",
              color: "#ffb0cf",
            }}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
