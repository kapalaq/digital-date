import { loadState, saveState } from "./state.js";
import { computePhase } from "./phase.js";
import { scoreQuiz } from "./quiz.js";

// Single-backend, single-session app: serialize all read-modify-write cycles on
// session:main through one in-process queue so concurrent socket events (the two
// users acting simultaneously, or a disconnect racing a stage mutation) can't
// load stale state and clobber each other's writes.
let mutateChain = Promise.resolve();

export function mutate(io, fn) {
  mutateChain = mutateChain.then(async () => {
    const s = await loadState();
    await fn(s);
    s.phase = computePhase(s);
    await saveState(s);
    io.to("main").emit("state", s);
    return s;
  });
  return mutateChain;
}

export function registerHandlers(io, socket, user) {
  const id = user.id; // "A" | "B"

  socket.on("lobby:begin", () => mutate(io, (s) => { s.begin[id] = true; }));

  socket.on("lobby:throw", ({ kind }) => {
    // ephemeral: broadcast to whole room so both users see the flight animation
    io.to("main").emit("lobby:projectile", { from: id, kind });
  });

  socket.on("stage1:confirm", () => mutate(io, (s) => { s.stage1[`${id}_done`] = true; }));

  socket.on("stage2:answers", ({ answers }) => mutate(io, (s) => {
    s.stage2.answers[id] = answers;
    if (s.stage2.answers.A && s.stage2.answers.B && !s.stage2.result) {
      // score using combined answers: merge arrays, prefer agreement by summing
      s.stage2.result = scoreQuiz(mergeAnswers(s.stage2.answers.A, s.stage2.answers.B));
      s.stage2.plan.destination = s.stage2.result.country;
    }
  }));

  socket.on("stage2:plan", ({ plan }) => mutate(io, (s) => {
    s.stage2.plan = { ...s.stage2.plan, ...plan };
  }));

  socket.on("stage2:dontWant", ({ list }) => mutate(io, (s) => {
    s.stage2.dontWant[id] = list;
    if (s.stage2.dontWant.A && s.stage2.dontWant.B) s.stage2.dontWant.revealed = true;
  }));

  socket.on("stage2:planSubmit", () => mutate(io, (s) => { s.stage2.planSubmitted[id] = true; }));

  socket.on("stage3:videoControl", ({ playing, time }) => mutate(io, (s) => {
    s.stage3.video = { playing, time, updatedBy: id };
  }));

  socket.on("stage3:confirm", () => mutate(io, (s) => { s.stage3[`${id}_done`] = true; }));

  socket.on("stage4:goals", ({ goals }) => mutate(io, (s) => { s.stage4.goals[id] = goals; }));

  socket.on("stage4:allowFewer", ({ value }) => mutate(io, (s) => { s.stage4.allowFewer[id] = value; }));

  socket.on("stage4:downloaded", () => mutate(io, (s) => { s.stage4.downloaded[id] = true; }));

  // dev only
  socket.on("dev:setPhase", ({ phase }) => mutate(io, (s) => { s.phase = phase; }));
}

// Combine both users' answers into one weighted answer set for scoring.
// Single-value answers from both users both count; arrays concatenate.
function mergeAnswers(a, b) {
  const out = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const av = a[key], bv = b[key];
    if (Array.isArray(av) || Array.isArray(bv)) {
      out[key] = [...(av || []), ...(bv || [])];
    } else {
      // put both as an array so scoreQuiz sums both choices
      out[key] = [av, bv].filter(Boolean);
    }
  }
  return out;
}
