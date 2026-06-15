import { useEffect, useState } from "react";
import { getSocket } from "../socket.js";
let nextId = 1;
export default function Projectiles() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const sock = getSocket(); if (!sock) return;
    const onProj = ({ kind, lane }) => {
      const id = nextId++;
      setItems(x => [...x, { id, kind, top: 10 + lane * 70 }]);
      setTimeout(() => setItems(x => x.filter(i => i.id !== id)), 1500);
    };
    sock.on("lobby:projectile", onProj);
    return () => sock.off("lobby:projectile", onProj);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {items.map(i => (
        <div key={i.id} className="absolute text-4xl"
          style={{ top: `${i.top}%`, left: 0, animation: "fly 1.4s linear forwards" }}>
          {i.kind === "heart" ? "❤️" : "🥧"}
        </div>
      ))}
      <style>{`@keyframes fly { from { left: -5%; transform: rotate(0) } to { left: 105%; transform: rotate(360deg) } }`}</style>
    </div>
  );
}
