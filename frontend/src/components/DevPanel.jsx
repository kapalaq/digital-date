import { getSocket } from "../socket.js";
import { useCountdown } from "../hooks/useCountdown.js";
const PHASES = ["waiting","lobby","stage1","stage2","stage3","stage4","done"];
export default function DevPanel({ state, me }) {
  const { label } = useCountdown();
  const skip = (phase) => getSocket()?.emit("dev:setPhase", { phase });
  return (
    <div className="fixed bottom-2 right-2 bg-black/80 text-xs p-3 rounded-lg z-50 w-56 border border-rosegold/40">
      <div className="font-bold text-rosegold mb-1">DEV · you={me.id}</div>
      <div>phase: {state.phase}</div>
      <div>A online: {String(state.presence.A.online)}</div>
      <div>B online: {String(state.presence.B.online)}</div>
      <div>countdown: {label}</div>
      <div className="mt-2 flex flex-wrap gap-1">
        {PHASES.map(p => <button key={p} onClick={()=>skip(p)} className="px-1 bg-rosegold/30 rounded">{p}</button>)}
      </div>
    </div>
  );
}
