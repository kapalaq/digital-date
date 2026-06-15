import { redis } from "./redisClient.js";
const KEY = "session:main";

export const IDA   = process.env.USER_A_ID   ?? "A";
export const IDB   = process.env.USER_B_ID   ?? "B";
export const NAMEA = process.env.USER_A_NAME ?? "User A";
export const NAMEB = process.env.USER_B_NAME ?? "User B";

export function defaultState() {
  return {
    meta: { ida: IDA, idb: IDB, nameA: NAMEA, nameB: NAMEB },
    phase: "waiting",
    presence: { [IDA]: { online: false }, [IDB]: { online: false } },
    begin: { [IDA]: false, [IDB]: false },
    stage1: {
      [`${IDA}_done`]: false, [`${IDB}_done`]: false,
      [`${IDA}_game`]: null,  [`${IDB}_game`]: null,
      rps: { [IDA]: null, [IDB]: null, round: 0 },
      winner_game: null,
      winner_ack: { [IDA]: false, [IDB]: false },
    },
    stage2: {
      answers: { [IDA]: null, [IDB]: null },
      result: null,
      plan: { destination: "", hotel: "", restaurants: [], activities: [], dates: "" },
      dontWant: { [IDA]: null, [IDB]: null, revealed: false },
      planSubmitted: { [IDA]: false, [IDB]: false },
    },
    stage3: { [`${IDA}_done`]: false, [`${IDB}_done`]: false, video: { playing: false, time: 0, updatedBy: null } },
    stage4: {
      goals:       { [IDA]: [], [IDB]: [] },
      sharedGoals: { [IDA]: [], [IDB]: [] },
      allowFewer:  { [IDA]: false, [IDB]: false },
      downloaded:  { [IDA]: false, [IDB]: false },
    },
    stage5: {
      lists:       { [IDA]: [], [IDB]: [] },
      writingDone: { [IDA]: false, [IDB]: false },
      approvals:   { [IDA]: {}, [IDB]: {} },
      bonusItems:  { [IDA]: [], [IDB]: [] },
      reviewDone:  { [IDA]: false, [IDB]: false },
      complete:    { [IDA]: false, [IDB]: false },
    },
  };
}

export async function loadState() {
  const raw = await redis.get(KEY);
  if (!raw) { const s = defaultState(); await redis.set(KEY, JSON.stringify(s)); return s; }
  const s = JSON.parse(raw);
  if (!s.meta || !(IDA in s.presence) || !(IDB in s.presence)) return resetState();
  return s;
}

export async function saveState(s) { await redis.set(KEY, JSON.stringify(s)); }

export async function resetState() { const s = defaultState(); await saveState(s); return s; }
