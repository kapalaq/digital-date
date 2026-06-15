import { useEffect, useState } from "react";
import { getSocket } from "../socket.js";

let nextId = 1;

export default function Projectiles({ meId, onHit }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const sock = getSocket();
    if (!sock) return;
    const onProj = ({ from, kind }) => {
      const id = nextId++;
      const goRight = from === "A";
      setItems(x => [...x, { id, kind, goRight }]);
      setTimeout(() => {
        setItems(x => x.filter(i => i.id !== id));
        const target = from === "A" ? "B" : "A";
        onHit?.(kind, target);
      }, 1400);
    };
    sock.on("lobby:projectile", onProj);
    return () => sock.off("lobby:projectile", onProj);
  }, [meId, onHit]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-10">
      {items.map(i => (
        <div key={i.id} className={`absolute text-4xl top-[44%] ${i.goRight ? "animate-fly-right" : "animate-fly-left"}`}>
          {i.kind === "heart" ? "❤️" : "🥧"}
        </div>
      ))}
    </div>
  );
}
