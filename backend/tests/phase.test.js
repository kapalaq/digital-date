import { computePhase } from "../src/phase.js";

const base = () => ({
  phase: "waiting",
  presence: { A: { online: false }, B: { online: false } },
  begin: { A: false, B: false },
  stage1: { A_done: false, B_done: false, A_game: null, B_game: null, rps: { A: null, B: null, round: 0 }, winner_game: null, winner_ack: { A: false, B: false } },
  stage2: { answers: { A: null, B: null }, planSubmitted: { A: false, B: false }, dontWant: { revealed: false } },
  stage3: { A_done: false, B_done: false },
  stage4: { downloaded: { A: false, B: false } },
  stage5: { lists: { A: [], B: [] }, writingDone: { A: false, B: false }, approvals: { A: {}, B: {} }, bonusItems: { A: [], B: [] }, reviewDone: { A: false, B: false }, complete: { A: false, B: false } },
});

const after6 = new Date("2026-06-15T14:00:00Z"); // 19:00 GMT+5

test("waiting -> lobby when both online", () => {
  const s = base(); s.presence.A.online = true; s.presence.B.online = true;
  expect(computePhase(s, after6)).toBe("lobby");
});

test("lobby stays until both begin", () => {
  const s = base(); s.phase = "lobby";
  s.presence.A.online = true; s.presence.B.online = true;
  s.begin.A = true; // only one
  expect(computePhase(s, after6)).toBe("lobby");
  s.begin.B = true;
  expect(computePhase(s, after6)).toBe("stage5");
});

test("lobby starts whenever both begin regardless of time", () => {
  const s = base(); s.phase = "lobby";
  s.presence.A.online = true; s.presence.B.online = true;
  s.begin.A = true; s.begin.B = true;
  const before = new Date("2026-06-15T05:00:00Z"); // 10:00 GMT+5, before old gate
  expect(computePhase(s, before)).toBe("stage5");
});

test("stage1 -> done when both done with same game and both ack", () => {
  const s = base(); s.phase = "stage1";
  s.stage1.A_done = true; s.stage1.B_done = true;
  s.stage1.A_game = "Portal 2"; s.stage1.B_game = "Portal 2";
  s.stage1.winner_game = "Portal 2";
  s.stage1.winner_ack = { A: true, B: true };
  expect(computePhase(s, after6)).toBe("done");
});

test("stage1 stays when both done with same game but not acked", () => {
  const s = base(); s.phase = "stage1";
  s.stage1.A_done = true; s.stage1.B_done = true;
  s.stage1.A_game = "Portal 2"; s.stage1.B_game = "Portal 2";
  s.stage1.winner_game = "Portal 2";
  expect(computePhase(s, after6)).toBe("stage1");
});

test("stage1 stays when both done with different games and no rps winner", () => {
  const s = base(); s.phase = "stage1";
  s.stage1.A_done = true; s.stage1.B_done = true;
  s.stage1.A_game = "Portal 2"; s.stage1.B_game = "It Takes Two";
  expect(computePhase(s, after6)).toBe("stage1");
});

test("stage1 stays after rps winner until both ack", () => {
  const s = base(); s.phase = "stage1";
  s.stage1.A_done = true; s.stage1.B_done = true;
  s.stage1.A_game = "Portal 2"; s.stage1.B_game = "It Takes Two";
  s.stage1.winner_game = "Portal 2";
  expect(computePhase(s, after6)).toBe("stage1");
});

test("stage1 -> done after rps winner and both ack", () => {
  const s = base(); s.phase = "stage1";
  s.stage1.A_done = true; s.stage1.B_done = true;
  s.stage1.A_game = "Portal 2"; s.stage1.B_game = "It Takes Two";
  s.stage1.winner_game = "Portal 2";
  s.stage1.winner_ack = { A: true, B: true };
  expect(computePhase(s, after6)).toBe("done");
});

test("stage2 -> stage3 needs answers+plan+reveal", () => {
  const s = base(); s.phase = "stage2";
  s.stage2.answers.A = {}; s.stage2.answers.B = {};
  s.stage2.planSubmitted.A = true; s.stage2.planSubmitted.B = true;
  s.stage2.dontWant.revealed = true;
  expect(computePhase(s, after6)).toBe("stage3");
});

test("stage4 -> stage1 when both downloaded", () => {
  const s = base(); s.phase = "stage4";
  s.stage4.downloaded.A = true; s.stage4.downloaded.B = true;
  expect(computePhase(s, after6)).toBe("stage1");
});

test("stage5 stays until both complete", () => {
  const s = base(); s.phase = "stage5";
  s.stage5.complete.A = true;
  expect(computePhase(s, after6)).toBe("stage5");
});

test("stage5 -> stage2 when both complete", () => {
  const s = base(); s.phase = "stage5";
  s.stage5.complete.A = true; s.stage5.complete.B = true;
  expect(computePhase(s, after6)).toBe("stage2");
});

test("phase never moves backward", () => {
  const s = base(); s.phase = "stage3"; // nobody online
  expect(computePhase(s, after6)).toBe("stage3");
});
