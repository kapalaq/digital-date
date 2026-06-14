import { nextSixPmGmtPlus5 } from "./time.js";
export const PHASES = ["waiting","lobby","stage1","stage2","stage3","stage4","done"];

function bothOnline(s) { return s.presence.A.online && s.presence.B.online; }

// Compute the phase the state *should* be in. Monotonic: never returns an
// earlier phase than s.phase.
export function computePhase(s, now = new Date()) {
  let p = s.phase;
  if (p === "waiting" && bothOnline(s)) p = "lobby";
  if (p === "lobby") {
    const startTime = nextSixPmGmtPlus5(now);
    // "after 18:00" == now is past the *previous* 18:00; nextSixPm returns the
    // upcoming one, so compare against 13:00 UTC of now's day directly.
    const sixPmToday = new Date(now); sixPmToday.setUTCHours(13,0,0,0);
    const past6 = now.getTime() >= sixPmToday.getTime();
    if (past6 && s.begin.A && s.begin.B && bothOnline(s)) p = "stage1";
  }
  if (p === "stage1" && s.stage1.A_done && s.stage1.B_done) p = "stage2";
  if (p === "stage2"
      && s.stage2.answers.A && s.stage2.answers.B
      && s.stage2.planSubmitted.A && s.stage2.planSubmitted.B
      && s.stage2.dontWant.revealed) p = "stage3";
  if (p === "stage3" && s.stage3.A_done && s.stage3.B_done) p = "stage4";
  if (p === "stage4" && s.stage4.downloaded.A && s.stage4.downloaded.B) p = "done";

  // monotonic guard
  if (PHASES.indexOf(p) < PHASES.indexOf(s.phase)) return s.phase;
  return p;
}
