import { io as Client } from "socket.io-client";
import http from "http";
import { Server } from "socket.io";
import { login } from "../src/auth.js";
import { resetState } from "../src/state.js";
import { computePhase } from "../src/phase.js";
import { registerHandlers } from "../src/handlers.js";
import { loadState, saveState } from "../src/state.js";
import { verify } from "../src/auth.js";

let server, io, port;

beforeAll((done) => {
  server = http.createServer();
  io = new Server(server);
  io.on("connection", async (socket) => {
    const user = verify(socket.handshake.auth.token);
    socket.join("main"); socket.data.user = user;
    const s = await loadState(); s.presence[user.id].online = true;
    s.phase = computePhase(s); await saveState(s); io.to("main").emit("state", s);
    registerHandlers(io, socket, user);
  });
  server.listen(() => { port = server.address().port; done(); });
});

afterAll(() => { io.close(); server.close(); });
beforeEach(async () => { await resetState(); });

test("both online -> phase lobby; stage1 confirm gates to stage2 via dev skip", (done) => {
  const tokenA = login("user_a","pass_a");
  const tokenB = login("user_b","pass_b");
  const a = Client(`http://localhost:${port}`, { auth: { token: tokenA } });
  const b = Client(`http://localhost:${port}`, { auth: { token: tokenB } });

  let seenLobby = false;
  b.on("state", (s) => {
    if (s.phase === "lobby" && !seenLobby) {
      seenLobby = true;
      a.emit("dev:setPhase", { phase: "stage1" });
    }
    if (s.phase === "stage1" && !s.stage1.B_done) {
      a.emit("stage1:confirm");
      b.emit("stage1:confirm");
    }
    if (s.phase === "stage2") { a.close(); b.close(); done(); }
  });
});
