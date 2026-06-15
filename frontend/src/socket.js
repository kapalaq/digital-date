// src/socket.js
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

let socket = null;
// Latest snapshot, captured synchronously at connect time so the initial
// `state` event (emitted by the server right after we connect) is never lost
// in the gap before React mounts and useSocketState attaches its listener.
let latestState = null;

export function connectSocket(token) {
  if (socket) socket.disconnect();
  latestState = null;
  socket = io("/", { auth: { token } });
  socket.on("state", (s) => { latestState = s; });
  return socket;
}
export function getSocket() { return socket; }

// Hook: subscribe to full state snapshots, seeded from the buffered snapshot
// so a state that arrived before mount is shown immediately.
export function useSocketState() {
  const [state, setState] = useState(latestState);
  useEffect(() => {
    if (!socket) return;
    if (latestState) setState(latestState); // catch anything buffered pre-mount
    const onState = (s) => setState(s);
    socket.on("state", onState);
    return () => socket.off("state", onState);
  }, []);
  return state;
}
