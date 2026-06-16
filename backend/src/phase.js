import { IDA, IDB } from "./state.js";

export const PHASES = ["waiting","lobby","stage5","stage2","stage3","stage4","stage1","done"];

function bothOnline(s) { return s.presence[IDA].online && s.presence[IDB].online; }

export function computePhase(s, now = new Date()) {
  let p = s.phase;
  if (p === "waiting" && bothOnline(s)) p = "lobby";
  if (p === "lobby") {
    if (s.begin[IDA] && s.begin[IDB] && bothOnline(s)) p = "stage5";
  }
  if (p === "stage5" && s.stage5?.complete?.[IDA] && s.stage5?.complete?.[IDB]) p = "stage2";
  if (p === "stage2"
      && s.stage2.answers[IDA] && s.stage2.answers[IDB]
      && s.stage2.planSubmitted[IDA] && s.stage2.planSubmitted[IDB]
      && s.stage2.dontWant.revealed) p = "stage3";
  if (p === "stage3" && s.stage3[`${IDA}_done`] && s.stage3[`${IDB}_done`]) p = "stage4";
  if (p === "stage4" && s.stage4.downloaded[IDA] && s.stage4.downloaded[IDB]) p = "stage1";
  if (p === "stage1" && s.stage1[`${IDA}_done`] && s.stage1[`${IDB}_done`]) {
    const gameA = s.stage1[`${IDA}_game`];
    const gameB = s.stage1[`${IDB}_game`];
    const { winner_game, winner_ack } = s.stage1;
    const noGameTracking = gameA === null && gameB === null;
    const rpsAcked = winner_game !== null && winner_ack?.[IDA] && winner_ack?.[IDB];
    if (rpsAcked || noGameTracking) p = "done";
  }

  // monotonic guard
  if (PHASES.indexOf(p) < PHASES.indexOf(s.phase)) return s.phase;
  return p;
}
