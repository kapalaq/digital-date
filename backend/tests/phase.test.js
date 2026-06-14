import { computePhase } from "../src/phase.js";

const base = () => ({
  phase: "waiting",
  presence: { A: { online: false }, B: { online: false } },
  begin: { A: false, B: false },
  stage1: { A_done: false, B_done: false },
  stage2: { answers: { A: null, B: null }, planSubmitted: { A: false, B: false }, dontWant: { revealed: false } },
  stage3: { A_done: false, B_done: false },
  stage4: { downloaded: { A: false, B: false } },
});

const after6 = new Date("2026-06-15T14:00:00Z"); // 19:00 GMT+5

test("waiting -> lobby when both online", () => {
  const s = base(); s.presence.A.online = true; s.presence.B.online = true;
  expect(computePhase(s, after6)).toBe("lobby");
});

test("lobby stays until both begin after 18:00", () => {
  const s = base(); s.phase = "lobby";
  s.presence.A.online = true; s.presence.B.online = true;
  s.begin.A = true; // only one
  expect(computePhase(s, after6)).toBe("lobby");
  s.begin.B = true;
  expect(computePhase(s, after6)).toBe("stage1");
});

test("lobby does not start before 18:00 even if both begin", () => {
  const s = base(); s.phase = "lobby";
  s.presence.A.online = true; s.presence.B.online = true;
  s.begin.A = true; s.begin.B = true;
  const before = new Date("2026-06-15T05:00:00Z"); // 10:00 GMT+5
  expect(computePhase(s, before)).toBe("lobby");
});

test("stage1 -> stage2 when both done", () => {
  const s = base(); s.phase = "stage1";
  s.stage1.A_done = true; s.stage1.B_done = true;
  expect(computePhase(s, after6)).toBe("stage2");
});

test("stage2 -> stage3 needs answers+plan+reveal", () => {
  const s = base(); s.phase = "stage2";
  s.stage2.answers.A = {}; s.stage2.answers.B = {};
  s.stage2.planSubmitted.A = true; s.stage2.planSubmitted.B = true;
  s.stage2.dontWant.revealed = true;
  expect(computePhase(s, after6)).toBe("stage3");
});

test("phase never moves backward", () => {
  const s = base(); s.phase = "stage3"; // nobody online
  expect(computePhase(s, after6)).toBe("stage3");
});
