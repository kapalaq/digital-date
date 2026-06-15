import { redis } from "./redisClient.js";
const KEY = "session:main";

export function defaultState() {
  return {
    phase: "waiting",
    presence: { A: { online: false }, B: { online: false } },
    begin: { A: false, B: false },
    stage1: { A_done: false, B_done: false, A_game: null, B_game: null, rps: { A: null, B: null, round: 0 }, winner_game: null, winner_ack: { A: false, B: false } },
    stage2: {
      answers: { A: null, B: null },
      result: null,
      plan: { destination: "", hotel: "", restaurants: [], activities: [], dates: "" },
      dontWant: { A: null, B: null, revealed: false },
      planSubmitted: { A: false, B: false },
    },
    stage3: { A_done: false, B_done: false, video: { playing: false, time: 0, updatedBy: null } },
    stage4: {
      goals: { A: [], B: [] },
      sharedGoals: { A: [], B: [] },
      allowFewer: { A: false, B: false },
      downloaded: { A: false, B: false },
    },
    stage5: {
      lists:       { A: [], B: [] },
      writingDone: { A: false, B: false },
      approvals:   { A: {}, B: {} },
      bonusItems:  { A: [], B: [] },
      reviewDone:  { A: false, B: false },
      complete:    { A: false, B: false },
    },
  };
}

export async function loadState() {
  const raw = await redis.get(KEY);
  if (!raw) { const s = defaultState(); await redis.set(KEY, JSON.stringify(s)); return s; }
  return JSON.parse(raw);
}

export async function saveState(s) { await redis.set(KEY, JSON.stringify(s)); }

export async function resetState() { const s = defaultState(); await saveState(s); return s; }
