import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { login, verify } from "./auth.js";
import { resetState } from "./state.js";
import { registerHandlers, mutate } from "./handlers.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  const token = login(username, password);
  if (!token) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ token });
});

app.post("/api/reset", async (_req, res) => { await resetState(); res.json({ ok: true }); });
app.get("/api/health", (_req, res) => res.json({ ok: true }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", async (socket) => {
  const token = socket.handshake.auth?.token;
  const user = verify(token);
  if (!user) { socket.disconnect(true); return; }

  socket.join("main");
  socket.data.user = user;

  // Route presence through the same serialized mutate queue as game events so a
  // connect/disconnect can't clobber a concurrent stage write.
  await mutate(io, (s) => { s.presence[user.id].online = true; });

  registerHandlers(io, socket, user);

  socket.on("disconnect", async () => {
    // do NOT reset begin/stage flags — progress persists across reconnect.
    await mutate(io, (s) => { s.presence[user.id].online = false; });
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`backend on ${PORT}`));
