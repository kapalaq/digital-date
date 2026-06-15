// src/socket.js
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

let socket = null;
export function connectSocket(token) {
  if (socket) socket.disconnect();
  socket = io("/", { auth: { token } });
  return socket;
}
export function getSocket() { return socket; }

// Hook: subscribe to full state snapshots.
export function useSocketState() {
  const [state, setState] = useState(null);
  useEffect(() => {
    if (!socket) return;
    const onState = (s) => setState(s);
    socket.on("state", onState);
    return () => socket.off("state", onState);
  }, []);
  return state;
}
