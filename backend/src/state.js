import { redis } from "./redisClient.js";
const KEY = "session:main";

export function defaultState() {
  return {
    phase: "waiting",
    presence: { A: { online: false }, B: { online: false } },
    begin: { A: false, B: false },
    stage1: { A_done: false, B_done: false },
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
      allowFewer: { A: false, B: false },
      downloaded: { A: false, B: false },
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
