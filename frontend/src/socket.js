// src/socket.js
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

let socket = null;
// Latest snapshot + React subscribers, kept OUTSIDE the socket lifecycle.
// useSocketState mounts before login (when socket is still null), so the hook
// can't subscribe to the socket directly — it would bail and never re-run.
// Instead components subscribe here once, and connectSocket fans every `state`
// event out to them, regardless of when the socket is (re)created.
let latestState = null;
const subscribers = new Set();

function publish(s) {
  latestState = s;
  subscribers.forEach((fn) => fn(s));
}

export function connectSocket(token) {
  if (socket) socket.disconnect();
  latestState = null;
  socket = io("/", { auth: { token } });
  socket.on("state", publish);
  return socket;
}
export function getSocket() { return socket; }

// Hook: re-renders on every server state snapshot, current or future.
export function useSocketState() {
  const [state, setState] = useState(latestState);
  useEffect(() => {
    subscribers.add(setState);
    if (latestState) setState(latestState); // seed if a snapshot already arrived
    return () => subscribers.delete(setState);
  }, []);
  return state;
}
