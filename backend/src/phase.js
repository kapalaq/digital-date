export const PHASES = ["waiting","lobby","stage1","stage2","stage3","stage4","stage5","done"];

function bothOnline(s) { return s.presence.A.online && s.presence.B.online; }

export function computePhase(s, now = new Date()) {
  let p = s.phase;
  if (p === "waiting" && bothOnline(s)) p = "lobby";
  if (p === "lobby") {
    if (s.begin.A && s.begin.B && bothOnline(s)) p = "stage1";
  }
  if (p === "stage1" && s.stage1.A_done && s.stage1.B_done) {
    const { A_game, B_game, winner_game, winner_ack } = s.stage1;
    const noGameTracking = A_game === null && B_game === null;
    const rpsAcked = winner_game !== null && winner_ack?.A && winner_ack?.B;
    if (rpsAcked || noGameTracking) p = "stage2";
  }
  if (p === "stage2"
      && s.stage2.answers.A && s.stage2.answers.B
      && s.stage2.planSubmitted.A && s.stage2.planSubmitted.B
      && s.stage2.dontWant.revealed) p = "stage3";
  if (p === "stage3" && s.stage3.A_done && s.stage3.B_done) p = "stage4";
  if (p === "stage4" && s.stage4.downloaded.A && s.stage4.downloaded.B) p = "stage5";
  if (p === "stage5" && s.stage5?.complete?.A && s.stage5?.complete?.B) p = "done";

  // monotonic guard
  if (PHASES.indexOf(p) < PHASES.indexOf(s.phase)) return s.phase;
  return p;
}
