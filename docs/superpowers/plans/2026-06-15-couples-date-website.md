# Couples Date Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real-time, two-user "date night" web app with linear synced stages, deployable via `docker-compose up --build`.

**Architecture:** Server-authoritative state in Redis (key `session:main`); backend (Express + Socket.io) validates actions, mutates Redis, broadcasts full state snapshots to room `main`; React frontend renders purely from the latest snapshot, so refresh/reconnect is automatically correct. JWT auth for two hardcoded users.

**Tech Stack:** Node 20, Express, Socket.io 4, ioredis, jsonwebtoken, Jest (backend); React 18, Vite, Tailwind, socket.io-client, canvas-confetti (frontend); nginx; Docker Compose.

---

## Repo Layout

```
digital-date/
  docker-compose.yml
  README.md
  backend/
    Dockerfile
    package.json
    jest.config.js
    src/
      index.js            # express + socket.io bootstrap
      auth.js             # JWT sign/verify, hardcoded users
      redisClient.js      # ioredis singleton
      state.js            # load/save/default session state in Redis
      phase.js            # computePhase(state, now)  [pure]
      time.js             # nextSixPmGmtPlus5(now)     [pure]
      quiz.js             # scoreQuiz(answers) + COUNTRIES table [pure]
      goals.js            # canSubmitGoals, buildGoalsMarkdown [pure]
      handlers.js         # socket event -> state mutation registration
    tests/
      phase.test.js
      time.test.js
      quiz.test.js
      goals.test.js
      handlers.int.test.js
  frontend/
    Dockerfile
    nginx.conf
    package.json
    tailwind.config.js
    postcss.config.js
    index.html
    vite.config.js
    src/
      main.jsx
      App.jsx
      socket.js           # socket singleton + useSocketState hook
      api.js              # login fetch
      theme.css
      hooks/useCountdown.js
      components/
        Login.jsx
        WaitingRoom.jsx
        Lobby.jsx
        Stage1Cards.jsx
        Stage2Quiz.jsx
        Stage2Result.jsx
        Stage2TripPlanner.jsx
        Stage3Yoga.jsx
        Stage4Goals.jsx
        Celebration.jsx
        DevPanel.jsx
        ReconnectOverlay.jsx
        Projectiles.jsx
```

**Shared constants** (phases, country table) live in backend; frontend gets quiz questions and country display from its own `src/data/` copies (small, static). Keep duplication minimal and documented.

---

## Task 1: Backend scaffold + Redis client

**Files:**
- Create: `backend/package.json`, `backend/jest.config.js`, `backend/src/redisClient.js`

- [ ] **Step 1: package.json**

```json
{
  "name": "digital-date-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "socket.io": "^4.7.5",
    "ioredis": "^5.4.1",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "socket.io-client": "^4.7.5"
  }
}
```

- [ ] **Step 2: jest.config.js**

```js
export default { testEnvironment: "node", transform: {} };
```

- [ ] **Step 3: redisClient.js**

```js
import Redis from "ioredis";
const url = process.env.REDIS_URL || "redis://localhost:6379";
export const redis = new Redis(url);
```

- [ ] **Step 4: install + commit**

```bash
cd backend && npm install
git add backend/package.json backend/package-lock.json backend/jest.config.js backend/src/redisClient.js
git commit -m "chore: backend scaffold + redis client"
```

---

## Task 2: Pure logic — `time.js` (next 18:00 GMT+5)

**Files:**
- Create: `backend/src/time.js`, `backend/tests/time.test.js`

- [ ] **Step 1: Write failing test**

```js
import { nextSixPmGmtPlus5 } from "../src/time.js";

test("returns today 18:00 GMT+5 when now is before it", () => {
  // 2026-06-15 10:00 GMT+5 == 2026-06-15T05:00:00Z
  const now = new Date("2026-06-15T05:00:00Z");
  const r = nextSixPmGmtPlus5(now);
  expect(r.toISOString()).toBe("2026-06-15T13:00:00.000Z"); // 18:00 GMT+5
});

test("rolls to next day when now is after 18:00 GMT+5", () => {
  const now = new Date("2026-06-15T14:00:00Z"); // 19:00 GMT+5
  const r = nextSixPmGmtPlus5(now);
  expect(r.toISOString()).toBe("2026-06-16T13:00:00.000Z");
});
```

- [ ] **Step 2: Run, verify fail**

Run: `cd backend && npm test -- time`
Expected: FAIL (module not found / not a function)

- [ ] **Step 3: Implement**

```js
// 18:00 in GMT+5 == 13:00 UTC.
export function nextSixPmGmtPlus5(now = new Date()) {
  const target = new Date(now);
  target.setUTCHours(13, 0, 0, 0);
  if (now.getTime() >= target.getTime()) {
    target.setUTCDate(target.getUTCDate() + 1);
  }
  return target;
}
```

- [ ] **Step 4: Run, verify pass**

Run: `cd backend && npm test -- time`  → Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/time.js backend/tests/time.test.js
git commit -m "feat: nextSixPmGmtPlus5 helper"
```

---

## Task 3: Pure logic — `phase.js` (gate transitions)

**Files:**
- Create: `backend/src/phase.js`, `backend/tests/phase.test.js`

Default state shape used across tasks (define here, reused by `state.js`):

```js
// canonical default
export const PHASES = ["waiting","lobby","stage1","stage2","stage3","stage4","done"];
```

- [ ] **Step 1: Write failing test**

```js
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
```

- [ ] **Step 2: Run, verify fail** — `cd backend && npm test -- phase`

- [ ] **Step 3: Implement**

```js
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
```

- [ ] **Step 4: Run, verify pass** — `cd backend && npm test -- phase` → PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/phase.js backend/tests/phase.test.js
git commit -m "feat: computePhase gate logic"
```

---

## Task 4: Pure logic — `quiz.js` (scoring)

**Files:**
- Create: `backend/src/quiz.js`, `backend/tests/quiz.test.js`

Answers object keys (q1..q15) map to the 15 spec questions. q12 (activities) is an
array; all others are single string values.

- [ ] **Step 1: Write failing test**

```js
import { scoreQuiz } from "../src/quiz.js";

const beachy = {
  q1: "hot", q2: "nature", q3: "mid", q4: "1week", q5: "beach",
  q6: "a_little", q7: "try_anything", q8: "sometimes", q9: "english",
  q10: "yes", q11: "asia", q12: ["beaches","food_tours"], q13: "hidden_gem",
  q14: "4to8", q15: "relaxation",
};

test("returns a country result object", () => {
  const r = scoreQuiz(beachy);
  expect(r).toHaveProperty("country");
  expect(r).toHaveProperty("flag");
  expect(r).toHaveProperty("description");
});

test("deterministic for same input", () => {
  expect(scoreQuiz(beachy).country).toBe(scoreQuiz(beachy).country);
});

test("hot+beach+asia leans tropical asia", () => {
  // Thailand/Bali-type result expected from the table weighting
  const r = scoreQuiz(beachy);
  expect(["Thailand","Indonesia","Vietnam","Philippines"]).toContain(r.country);
});
```

- [ ] **Step 2: Run, verify fail** — `cd backend && npm test -- quiz`

- [ ] **Step 3: Implement**

Build a `COUNTRIES` array (~20 entries). Each country has `tags` weights for answer
values; `scoreQuiz` sums weights for matched answers (q12 array sums each selected),
returns highest. Provide full table — abbreviated pattern shown, engineer fills all 20
using the same structure:

```js
// Each entry: { country, flag, description, w: { answerValue: points } }
export const COUNTRIES = [
  { country: "Thailand", flag: "🇹🇭", description: "Warm beaches, vibrant street food, easy on the wallet.",
    w: { hot:3, nature:1, mid:2, beach:3, asia:3, beaches:3, food_tours:2, relaxation:2, hidden_gem:1, "4to8":1, try_anything:2 } },
  { country: "Indonesia", flag: "🇮🇩", description: "Bali sunsets, jungle, and surf.",
    w: { hot:3, nature:3, mid:2, beach:3, asia:3, beaches:3, hiking:2, relaxation:2, hidden_gem:2, any:1 } },
  { country: "Vietnam", flag: "🇻🇳", description: "Street food heaven, dramatic coastline, low cost.",
    w: { hot:2, nature:2, budget:3, mid:1, asia:3, food_tours:3, local_markets:2, adventure:2, "4to8":1 } },
  { country: "Japan", flag: "🇯🇵", description: "Culture, food, neon cities and quiet temples.",
    w: { mild:3, city:3, mid:1, luxury:1, asia:3, museums:2, food_tours:3, culture:3, tourist_hotspot:1, english:0 } },
  { country: "Italy", flag: "🇮🇹", description: "Romance, history, and the best food in Europe.",
    w: { mild:3, city:2, mid:2, europe:3, museums:3, food_tours:3, romance:3, history:3, yes:2 } },
  { country: "France", flag: "🇫🇷", description: "Paris romance, wine country, art everywhere.",
    w: { mild:3, city:3, luxury:2, europe:3, museums:3, romance:3, culture:3, tourist_hotspot:2 } },
  { country: "Greece", flag: "🇬🇷", description: "Island beaches plus ancient ruins.",
    w: { hot:2, mild:1, beach:3, europe:3, history:3, beaches:3, romance:2, relaxation:2 } },
  { country: "Spain", flag: "🇪🇸", description: "Beaches, tapas, nightlife, and Gaudí.",
    w: { hot:2, city:2, mid:2, europe:3, beaches:2, nightlife_yes:2, food_tours:2, culture:2 } },
  { country: "Portugal", flag: "🇵🇹", description: "Coastal towns, custard tarts, friendly and affordable.",
    w: { mild:2, hot:1, mid:2, budget:1, europe:3, beach:2, hidden_gem:2, relaxation:2, english:1 } },
  { country: "Iceland", flag: "🇮🇸", description: "Glaciers, waterfalls, northern lights.",
    w: { cold:3, nature:3, luxury:1, europe:2, mountains:2, hiking:3, adventure:3, hidden_gem:2, english:2 } },
  { country: "Switzerland", flag: "🇨🇭", description: "Alps, lakes, postcard mountain towns.",
    w: { cold:2, mild:1, nature:3, luxury:3, europe:3, mountains:3, hiking:3, relaxation:1, english:2 } },
  { country: "Norway", flag: "🇳🇴", description: "Fjords, hiking, dramatic nature.",
    w: { cold:3, nature:3, luxury:2, europe:2, mountains:3, hiking:3, adventure:2, hidden_gem:1, english:2 } },
  { country: "Morocco", flag: "🇲🇦", description: "Markets, desert, and bold flavors.",
    w: { hot:3, city:1, budget:2, mid:1, africa:3, local_markets:3, food_tours:2, adventure:2, hidden_gem:2 } },
  { country: "Egypt", flag: "🇪🇬", description: "Pyramids, the Nile, deep history.",
    w: { hot:3, mid:1, budget:2, africa:2, middle_east:1, history:3, museums:3, culture:2, tourist_hotspot:1 } },
  { country: "Turkey", flag: "🇹🇷", description: "Where Europe meets Asia: bazaars, history, coast.",
    w: { mild:2, hot:1, mid:2, middle_east:2, europe:1, history:3, food_tours:2, local_markets:2, culture:2 } },
  { country: "UAE", flag: "🇦🇪", description: "Luxury, desert adventure, skyline glamour.",
    w: { hot:3, city:3, luxury:3, middle_east:3, shopping:3, nightlife_yes:2, english:2, tourist_hotspot:2 } },
  { country: "USA", flag: "🇺🇸", description: "Anything goes: cities, parks, road trips.",
    w: { mild:1, city:2, mid:1, luxury:1, americas:3, museums:1, shopping:2, english:3, any:1 } },
  { country: "Mexico", flag: "🇲🇽", description: "Beaches, ruins, and incredible food.",
    w: { hot:3, beach:3, budget:1, mid:2, americas:3, beaches:3, food_tours:2, relaxation:2, "4to8":1 } },
  { country: "Peru", flag: "🇵🇪", description: "Machu Picchu, Andes treks, ancient culture.",
    w: { mild:2, nature:2, mid:2, americas:3, mountains:3, hiking:3, history:3, adventure:3, hidden_gem:2 } },
  { country: "New Zealand", flag: "🇳🇿", description: "Epic landscapes, adventure capital of the world.",
    w: { mild:2, cold:1, nature:3, luxury:1, oceania:3, mountains:3, hiking:3, adventure:3, english:3 } },
];

export function scoreQuiz(answers) {
  let best = COUNTRIES[0], bestScore = -1;
  for (const c of COUNTRIES) {
    let score = 0;
    for (const [k, v] of Object.entries(answers)) {
      if (Array.isArray(v)) { for (const item of v) score += c.w[item] || 0; }
      else score += c.w[v] || 0;
    }
    if (score > bestScore) { bestScore = score; best = c; }
  }
  return { country: best.country, flag: best.flag, description: best.description };
}
```

- [ ] **Step 4: Run, verify pass** — `cd backend && npm test -- quiz` → PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/quiz.js backend/tests/quiz.test.js
git commit -m "feat: quiz scoring + country table"
```

---

## Task 5: Pure logic — `goals.js`

**Files:**
- Create: `backend/src/goals.js`, `backend/tests/goals.test.js`

- [ ] **Step 1: Write failing test**

```js
import { canSubmitGoals, buildGoalsMarkdown } from "../src/goals.js";

test("needs 100 goals unless partner allowed fewer", () => {
  expect(canSubmitGoals(new Array(99).fill("g"), false)).toBe(false);
  expect(canSubmitGoals(new Array(100).fill("g"), false)).toBe(true);
  expect(canSubmitGoals(["one"], true)).toBe(true);
  expect(canSubmitGoals([], true)).toBe(false); // still need >=1
});

test("markdown format", () => {
  const md = buildGoalsMarkdown("User A", ["Run a marathon","Learn piano"], "2026-06-15");
  expect(md).toBe(
    "# My 100 Goals — User A — 2026-06-15\n\n1. Run a marathon\n2. Learn piano\n"
  );
});
```

- [ ] **Step 2: Run, verify fail** — `cd backend && npm test -- goals`

- [ ] **Step 3: Implement**

```js
export function canSubmitGoals(goals, partnerAllowFewer) {
  if (goals.length === 0) return false;
  if (partnerAllowFewer) return true;
  return goals.length >= 100;
}

export function buildGoalsMarkdown(username, goals, date) {
  const lines = goals.map((g, i) => `${i + 1}. ${g}`).join("\n");
  return `# My 100 Goals — ${username} — ${date}\n\n${lines}\n`;
}
```

- [ ] **Step 4: Run, verify pass** — `cd backend && npm test -- goals` → PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/goals.js backend/tests/goals.test.js
git commit -m "feat: goals validation + markdown export"
```

---

## Task 6: Auth + state modules

**Files:**
- Create: `backend/src/auth.js`, `backend/src/state.js`

- [ ] **Step 1: auth.js**

```js
import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// Hardcoded users. credential -> identity letter.
const USERS = {
  user_a: { pass: "pass_a", id: "A", name: "User A" },
  user_b: { pass: "pass_b", id: "B", name: "User B" },
};

export function login(username, password) {
  const u = USERS[username];
  if (!u || u.pass !== password) return null;
  return jwt.sign({ id: u.id, name: u.name }, SECRET, { expiresIn: "12h" });
}

export function verify(token) {
  try { return jwt.verify(token, SECRET); } catch { return null; }
}
```

- [ ] **Step 2: state.js**

```js
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
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/auth.js backend/src/state.js
git commit -m "feat: auth (jwt) and redis state module"
```

---

## Task 7: Socket handlers + Express bootstrap

**Files:**
- Create: `backend/src/handlers.js`, `backend/src/index.js`

Handler contract: every handler loads state, mutates, recomputes phase, saves,
broadcasts `state`. Presence handled in connection lifecycle.

- [ ] **Step 1: handlers.js**

```js
import { loadState, saveState } from "./state.js";
import { computePhase } from "./phase.js";
import { scoreQuiz } from "./quiz.js";

async function mutate(io, fn) {
  const s = await loadState();
  await fn(s);
  s.phase = computePhase(s);
  await saveState(s);
  io.to("main").emit("state", s);
  return s;
}

export function registerHandlers(io, socket, user) {
  const id = user.id; // "A" | "B"

  socket.on("lobby:begin", () => mutate(io, (s) => { s.begin[id] = true; }));

  socket.on("lobby:throw", ({ kind }) => {
    // ephemeral: tell the other side a projectile is incoming
    socket.to("main").emit("lobby:projectile", { from: id, kind, lane: Math.random() });
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
```

Note: `scoreQuiz` already handles array values by summing each — so passing arrays from
`mergeAnswers` works without changes.

- [ ] **Step 2: index.js**

```js
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { login, verify } from "./auth.js";
import { loadState, saveState, resetState } from "./state.js";
import { computePhase } from "./phase.js";
import { registerHandlers } from "./handlers.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  const token = login(username, password);
  if (!token) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ token });
});

app.post("/api/reset", async (_req, res) => { await resetState(); res.json({ ok: true }); });
app.get("/api/health", (_req, res) => res.json({ ok: true }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", async (socket) => {
  const token = socket.handshake.auth?.token;
  const user = verify(token);
  if (!user) { socket.disconnect(true); return; }

  socket.join("main");
  socket.data.user = user;

  let s = await loadState();
  s.presence[user.id].online = true;
  s.phase = computePhase(s);
  await saveState(s);
  io.to("main").emit("state", s);

  registerHandlers(io, socket, user);

  socket.on("disconnect", async () => {
    const cur = await loadState();
    cur.presence[user.id].online = false;
    // do NOT reset begin flags mid-session past lobby; clearing begin only matters in lobby
    await saveState(cur);
    io.to("main").emit("state", cur);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`backend on ${PORT}`));
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/handlers.js backend/src/index.js
git commit -m "feat: socket handlers + express bootstrap"
```

---

## Task 8: Socket integration test

**Files:**
- Create: `backend/tests/handlers.int.test.js`

This test needs a running Redis. Use `REDIS_URL` env; in CI/docker it points to the
redis service. Skip gracefully if no Redis.

- [ ] **Step 1: Write test**

```js
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
```

- [ ] **Step 2: Run with redis**

Run: `cd backend && REDIS_URL=redis://localhost:6379 npm test -- handlers.int`
Expected: PASS (start a local redis first: `docker run -p 6379:6379 redis:7-alpine`)

- [ ] **Step 3: Commit**

```bash
git add backend/tests/handlers.int.test.js
git commit -m "test: socket integration phase progression"
```

---

## Task 9: Frontend scaffold + Tailwind + socket layer

**Files:**
- Create: `frontend/package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.jsx`, `src/theme.css`, `src/socket.js`, `src/api.js`

- [ ] **Step 1: package.json**

```json
{
  "name": "digital-date-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "socket.io-client": "^4.7.5",
    "canvas-confetti": "^1.9.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "vite": "^5.3.1"
  }
}
```

- [ ] **Step 2: vite.config.js** (proxy api+socket to backend in dev)

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:4000",
      "/socket.io": { target: "http://localhost:4000", ws: true },
    },
  },
});
```

- [ ] **Step 3: tailwind.config.js + postcss.config.js**

```js
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: { colors: {
    navy: "#1a1a3a", rosegold: "#b76e79", cream: "#f5ede1", blush: "#e8c1c5",
  } } },
  plugins: [],
};
```
```js
// postcss.config.js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

- [ ] **Step 4: index.html + main.jsx + theme.css**

```html
<!-- index.html -->
<!doctype html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Date Night 💕</title></head>
<body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>
```
```jsx
// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./theme.css";
createRoot(document.getElementById("root")).render(<App />);
```
```css
/* src/theme.css */
@tailwind base; @tailwind components; @tailwind utilities;
body { @apply bg-navy text-cream; font-family: ui-sans-serif, system-ui; }
.fade-in { animation: fade .5s ease; }
@keyframes fade { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
```

- [ ] **Step 5: socket.js + api.js**

```js
// src/api.js
export async function login(username, password) {
  const r = await fetch("/api/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) throw new Error("Invalid credentials");
  return (await r.json()).token;
}
```
```jsx
// src/socket.js
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

let socket = null;
export function connectSocket(token) {
  if (socket) socket.disconnect();
  socket = io("/", { auth: { token } });
  return socket;
}
export function getSocket() { return socket; }

// Hook: subscribe to full state snapshots.
export function useSocketState() {
  const [state, setState] = useState(null);
  useEffect(() => {
    if (!socket) return;
    const onState = (s) => setState(s);
    socket.on("state", onState);
    return () => socket.off("state", onState);
  }, []);
  return state;
}
```

- [ ] **Step 6: install + commit**

```bash
cd frontend && npm install
git add frontend/package.json frontend/package-lock.json frontend/vite.config.js \
  frontend/tailwind.config.js frontend/postcss.config.js frontend/index.html \
  frontend/src/main.jsx frontend/src/theme.css frontend/src/socket.js frontend/src/api.js
git commit -m "chore: frontend scaffold + tailwind + socket layer"
```

---

## Task 10: App shell, Login, WaitingRoom, countdown, ReconnectOverlay, DevPanel

**Files:**
- Create: `frontend/src/App.jsx`, `src/hooks/useCountdown.js`, `src/components/{Login,WaitingRoom,ReconnectOverlay,DevPanel}.jsx`

- [ ] **Step 1: useCountdown.js**

```js
import { useEffect, useState } from "react";
// next 18:00 GMT+5 == 13:00 UTC
function nextTarget() {
  const t = new Date(); t.setUTCHours(13,0,0,0);
  if (Date.now() >= t.getTime()) t.setUTCDate(t.getUTCDate()+1);
  return t;
}
export function useCountdown() {
  const [target] = useState(nextTarget);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(()=>setNow(Date.now()),1000); return ()=>clearInterval(i); }, []);
  const ms = Math.max(0, target.getTime() - now);
  const h = String(Math.floor(ms/3.6e6)).padStart(2,"0");
  const m = String(Math.floor(ms%3.6e6/6e4)).padStart(2,"0");
  const s = String(Math.floor(ms%6e4/1000)).padStart(2,"0");
  return { label: `${h}:${m}:${s}`, done: ms === 0 };
}
```

- [ ] **Step 2: Login.jsx**

```jsx
import { useState } from "react";
import { login } from "../api.js";
import { connectSocket } from "../socket.js";

export default function Login({ onAuth }) {
  const [u,setU]=useState(""); const [p,setP]=useState(""); const [err,setErr]=useState("");
  async function submit(e){ e.preventDefault();
    try { const token = await login(u,p); connectSocket(token);
      const me = JSON.parse(atob(token.split(".")[1])); onAuth({ token, id: me.id, name: me.name }); }
    catch { setErr("Invalid credentials"); }
  }
  return (
    <div className="min-h-screen flex items-center justify-center fade-in">
      <form onSubmit={submit} className="bg-navy/60 p-8 rounded-2xl shadow-xl w-80 border border-rosegold/30">
        <h1 className="text-2xl mb-4 text-rosegold">Date Night 💕</h1>
        <input className="w-full mb-3 p-2 rounded bg-cream/10" placeholder="username" value={u} onChange={e=>setU(e.target.value)} />
        <input className="w-full mb-3 p-2 rounded bg-cream/10" type="password" placeholder="password" value={p} onChange={e=>setP(e.target.value)} />
        {err && <p className="text-red-300 text-sm mb-2">{err}</p>}
        <button className="w-full p-2 rounded bg-rosegold text-navy font-bold">Enter</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: WaitingRoom.jsx**

```jsx
import { useCountdown } from "../hooks/useCountdown.js";
export default function WaitingRoom({ me, state }) {
  const { label } = useCountdown();
  const partner = me.id === "A" ? "User B" : "User A";
  return (
    <div className="min-h-screen flex flex-col items-center justify-center fade-in">
      <div className="text-6xl mb-6 animate-pulse">💗</div>
      <h2 className="text-2xl mb-2">Waiting for {partner}…</h2>
      <p className="text-rosegold text-lg">Date begins in {label}</p>
    </div>
  );
}
```

- [ ] **Step 4: ReconnectOverlay.jsx**

```jsx
export default function ReconnectOverlay({ partnerName }) {
  return (
    <div className="fixed inset-0 bg-navy/80 backdrop-blur flex flex-col items-center justify-center z-40">
      <div className="text-5xl mb-4 animate-spin">🔄</div>
      <p className="text-xl">{partnerName} disconnected — reconnecting…</p>
      <p className="text-rosegold text-sm mt-2">Your progress is safe.</p>
    </div>
  );
}
```

- [ ] **Step 5: DevPanel.jsx**

```jsx
import { getSocket } from "../socket.js";
import { useCountdown } from "../hooks/useCountdown.js";
const PHASES = ["waiting","lobby","stage1","stage2","stage3","stage4","done"];
export default function DevPanel({ state, me }) {
  const { label } = useCountdown();
  const skip = (phase) => getSocket()?.emit("dev:setPhase", { phase });
  return (
    <div className="fixed bottom-2 right-2 bg-black/80 text-xs p-3 rounded-lg z-50 w-56 border border-rosegold/40">
      <div className="font-bold text-rosegold mb-1">DEV · you={me.id}</div>
      <div>phase: {state.phase}</div>
      <div>A online: {String(state.presence.A.online)}</div>
      <div>B online: {String(state.presence.B.online)}</div>
      <div>countdown: {label}</div>
      <div className="mt-2 flex flex-wrap gap-1">
        {PHASES.map(p => <button key={p} onClick={()=>skip(p)} className="px-1 bg-rosegold/30 rounded">{p}</button>)}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: App.jsx** (router by phase + dev mode + reconnect detection)

```jsx
import { useState } from "react";
import { useSocketState } from "./socket.js";
import Login from "./components/Login.jsx";
import WaitingRoom from "./components/WaitingRoom.jsx";
import Lobby from "./components/Lobby.jsx";
import Stage1Cards from "./components/Stage1Cards.jsx";
import Stage2Quiz from "./components/Stage2Quiz.jsx";
import Stage3Yoga from "./components/Stage3Yoga.jsx";
import Stage4Goals from "./components/Stage4Goals.jsx";
import Celebration from "./components/Celebration.jsx";
import DevPanel from "./components/DevPanel.jsx";
import ReconnectOverlay from "./components/ReconnectOverlay.jsx";

const DEV = new URLSearchParams(location.search).get("dev") === "true";

export default function App() {
  const [me, setMe] = useState(null);
  const state = useSocketState();
  if (!me) return <Login onAuth={setMe} />;
  if (!state) return <div className="min-h-screen flex items-center justify-center">Connecting…</div>;

  const partnerId = me.id === "A" ? "B" : "A";
  const partnerName = me.id === "A" ? "User B" : "User A";
  const partnerOffline = !state.presence[partnerId].online &&
    !["waiting","done"].includes(state.phase);

  const view = {
    waiting: <WaitingRoom me={me} state={state} />,
    lobby: <Lobby me={me} state={state} />,
    stage1: <Stage1Cards me={me} state={state} />,
    stage2: <Stage2Quiz me={me} state={state} />,
    stage3: <Stage3Yoga me={me} state={state} />,
    stage4: <Stage4Goals me={me} state={state} />,
    done: <Celebration me={me} state={state} />,
  }[state.phase];

  return (
    <div className="fade-in" key={state.phase}>
      {view}
      {partnerOffline && <ReconnectOverlay partnerName={partnerName} />}
      {DEV && <DevPanel state={state} me={me} />}
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/App.jsx frontend/src/hooks/useCountdown.js \
  frontend/src/components/Login.jsx frontend/src/components/WaitingRoom.jsx \
  frontend/src/components/ReconnectOverlay.jsx frontend/src/components/DevPanel.jsx
git commit -m "feat: app shell, login, waiting room, dev panel, reconnect overlay"
```

---

## Task 11: Lobby + projectile minigame

**Files:**
- Create: `frontend/src/components/Lobby.jsx`, `src/components/Projectiles.jsx`

- [ ] **Step 1: Projectiles.jsx** (renders flying emojis from incoming events)

```jsx
import { useEffect, useState } from "react";
import { getSocket } from "../socket.js";
let nextId = 1;
export default function Projectiles() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const sock = getSocket(); if (!sock) return;
    const onProj = ({ kind, lane }) => {
      const id = nextId++;
      setItems(x => [...x, { id, kind, top: 10 + lane * 70 }]);
      setTimeout(() => setItems(x => x.filter(i => i.id !== id)), 1500);
    };
    sock.on("lobby:projectile", onProj);
    return () => sock.off("lobby:projectile", onProj);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {items.map(i => (
        <div key={i.id} className="absolute text-4xl"
          style={{ top: `${i.top}%`, left: 0, animation: "fly 1.4s linear forwards" }}>
          {i.kind === "heart" ? "❤️" : "🥧"}
        </div>
      ))}
      <style>{`@keyframes fly { from { left: -5%; transform: rotate(0) } to { left: 105%; transform: rotate(360deg) } }`}</style>
    </div>
  );
}
```

- [ ] **Step 2: Lobby.jsx**

```jsx
import { getSocket } from "../socket.js";
import { useCountdown } from "../hooks/useCountdown.js";
import Projectiles from "./Projectiles.jsx";

export default function Lobby({ me, state }) {
  const { label, done } = useCountdown();
  const throwIt = (kind) => getSocket()?.emit("lobby:throw", { kind });
  const begin = () => getSocket()?.emit("lobby:begin");
  const iBegan = state.begin[me.id];
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      <Projectiles />
      <h2 className="text-3xl mb-2 text-rosegold">The Lobby</h2>
      <p className="text-xl mb-6">Date begins in {label}</p>
      <div className="flex gap-6 mb-8">
        <button onClick={()=>throwIt("heart")} className="text-5xl hover:scale-125 transition">❤️</button>
        <button onClick={()=>throwIt("pie")} className="text-5xl hover:scale-125 transition">🥧</button>
      </div>
      <p className="text-sm text-cream/60 mb-4">Throw hearts & pies at your partner while you wait!</p>
      {done && (
        <button onClick={begin} disabled={iBegan}
          className="px-6 py-3 rounded-full bg-rosegold text-navy font-bold disabled:opacity-50">
          {iBegan ? "Waiting for partner…" : "Begin the date 💞"}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Lobby.jsx frontend/src/components/Projectiles.jsx
git commit -m "feat: lobby with heart/pie projectile minigame"
```

---

## Task 12: Stage 1 — flip cards

**Files:**
- Create: `frontend/src/components/Stage1Cards.jsx`

- [ ] **Step 1: Implement**

```jsx
import { useState } from "react";
import { getSocket } from "../socket.js";

const GAMES = [
  { name: "It Takes Two", emoji: "🧵", grad: "from-pink-500 to-purple-600" },
  { name: "Unravel Two", emoji: "🧶", grad: "from-amber-500 to-rose-600" },
  { name: "Portal 2", emoji: "🌀", grad: "from-sky-500 to-indigo-700" },
];

export default function Stage1Cards({ me, state }) {
  const [flipped, setFlipped] = useState([false,false,false]);
  const partnerId = me.id === "A" ? "B" : "A";
  const flip = (i) => setFlipped(f => f.map((v,idx)=> idx===i ? !v : v));
  const confirm = () => getSocket()?.emit("stage1:confirm");
  const iDone = state.stage1[`${me.id}_done`];
  const partnerDone = state.stage1[`${partnerId}_done`];
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl mb-6 text-rosegold">Pick your co-op game</h2>
      <div className="flex gap-4 flex-wrap justify-center mb-8">
        {GAMES.map((g,i)=>(
          <div key={i} onClick={()=>flip(i)} className="w-44 h-60 cursor-pointer" style={{ perspective: "1000px" }}>
            <div className="relative w-full h-full transition-transform duration-500"
              style={{ transformStyle: "preserve-3d", transform: flipped[i] ? "rotateY(180deg)" : "none" }}>
              <div className="absolute inset-0 rounded-xl bg-navy border-2 border-rosegold/40 flex items-center justify-center text-6xl"
                style={{ backfaceVisibility: "hidden" }}>❓</div>
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${g.grad} flex flex-col items-center justify-center p-3`}
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                <div className="text-6xl mb-3">{g.emoji}</div>
                <div className="text-center font-bold">{g.name}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={confirm} disabled={iDone}
        className="px-6 py-3 rounded-full bg-rosegold text-navy font-bold disabled:opacity-50 mb-3">
        We both finished this game ✓
      </button>
      <p className="text-sm">You {iDone ? "✓" : "…"} | Partner: {partnerDone ? "✓" : "waiting…"}</p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Stage1Cards.jsx
git commit -m "feat: stage 1 flip cards"
```

---

## Task 13: Stage 2 — quiz, result, trip planner

**Files:**
- Create: `frontend/src/data/questions.js`, `src/components/Stage2Quiz.jsx`, `src/components/Stage2Result.jsx`, `src/components/Stage2TripPlanner.jsx`

- [ ] **Step 1: questions.js** (15 questions; values must match `quiz.js` `w` keys)

```js
export const QUESTIONS = [
  { id:"q1", text:"Preferred climate", opts:[["cold","Cold"],["mild","Mild"],["hot","Hot"]] },
  { id:"q2", text:"Nature or city?", opts:[["nature","Nature"],["city","City"]] },
  { id:"q3", text:"Budget level", opts:[["budget","Budget"],["mid","Mid"],["luxury","Luxury"]] },
  { id:"q4", text:"Trip duration", opts:[["weekend","Weekend"],["1week","1 week"],["2weeks","2+ weeks"]] },
  { id:"q5", text:"Beach or mountains?", opts:[["beach","Beach"],["mountains","Mountains"]] },
  { id:"q6", text:"Historical sites interest", opts:[["yes","Yes"],["no","No"],["a_little","A little"]] },
  { id:"q7", text:"Food adventurousness", opts:[["try_anything","Try anything"],["some_restrictions","Some restrictions"],["familiar","Stick to familiar"]] },
  { id:"q8", text:"Nightlife importance", opts:[["nightlife_yes","Yes"],["no","No"],["sometimes","Sometimes"]] },
  { id:"q9", text:"Language barrier tolerance", opts:[["fine","Fine"],["english","Prefer English-friendly"]] },
  { id:"q10", text:"Visa-free preferred?", opts:[["yes","Yes"],["doesnt_matter","Doesn't matter"]] },
  { id:"q11", text:"Preferred region", opts:[["europe","Europe"],["asia","Asia"],["americas","Americas"],["middle_east","Middle East"],["africa","Africa"],["oceania","Oceania"]] },
  { id:"q12", text:"Activities (pick any)", multi:true, opts:[["hiking","Hiking"],["museums","Museums"],["beaches","Beaches"],["shopping","Shopping"],["local_markets","Local markets"],["food_tours","Food tours"]] },
  { id:"q13", text:"Crowd preference", opts:[["tourist_hotspot","Tourist hotspot"],["hidden_gem","Hidden gem"]] },
  { id:"q14", text:"Flight duration tolerance", opts:[["under4","Under 4h"],["4to8","4–8h"],["any","Any"]] },
  { id:"q15", text:"Most important factor", opts:[["romance","Romance"],["adventure","Adventure"],["relaxation","Relaxation"],["culture","Culture"]] },
];
```

- [ ] **Step 2: Stage2Quiz.jsx** (own answers; routes to result+planner once both submitted)

```jsx
import { useState } from "react";
import { getSocket } from "../socket.js";
import { QUESTIONS } from "../data/questions.js";
import Stage2Result from "./Stage2Result.jsx";
import Stage2TripPlanner from "./Stage2TripPlanner.jsx";

export default function Stage2Quiz({ me, state }) {
  const [ans, setAns] = useState({});
  const mySubmitted = !!state.stage2.answers[me.id];
  const bothAnswered = state.stage2.answers.A && state.stage2.answers.B;

  if (bothAnswered && state.stage2.result) {
    return (
      <div className="min-h-screen p-4 max-w-2xl mx-auto">
        <Stage2Result result={state.stage2.result} />
        <Stage2TripPlanner me={me} state={state} />
      </div>
    );
  }
  if (mySubmitted) return <Centered>Answers locked in. Waiting for partner…</Centered>;

  const set = (q, val) => setAns(a => ({ ...a, [q]: val }));
  const toggle = (q, val) => setAns(a => {
    const cur = a[q] || []; return { ...a, [q]: cur.includes(val) ? cur.filter(x=>x!==val) : [...cur, val] };
  });
  const submit = () => getSocket()?.emit("stage2:answers", { answers: ans });
  const complete = QUESTIONS.every(q => q.multi ? (ans[q.id]?.length>0) : ans[q.id]);

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <h2 className="text-3xl my-4 text-rosegold">Where to next? 🌍</h2>
      {QUESTIONS.map(q => (
        <div key={q.id} className="mb-5">
          <p className="mb-2 font-semibold">{q.text}</p>
          <div className="flex flex-wrap gap-2">
            {q.opts.map(([val,label]) => {
              const active = q.multi ? (ans[q.id]||[]).includes(val) : ans[q.id]===val;
              return <button key={val} onClick={()=> q.multi ? toggle(q.id,val) : set(q.id,val)}
                className={`px-3 py-1 rounded-full border ${active ? "bg-rosegold text-navy" : "border-rosegold/40"}`}>{label}</button>;
            })}
          </div>
        </div>
      ))}
      <button onClick={submit} disabled={!complete}
        className="px-6 py-3 rounded-full bg-rosegold text-navy font-bold disabled:opacity-50 my-4">Submit answers</button>
    </div>
  );
}
function Centered({ children }) {
  return <div className="min-h-screen flex items-center justify-center text-xl">{children}</div>;
}
```

- [ ] **Step 3: Stage2Result.jsx**

```jsx
export default function Stage2Result({ result }) {
  return (
    <div className="text-center my-6 p-6 rounded-2xl bg-gradient-to-br from-rosegold/30 to-navy">
      <div className="text-7xl mb-2">{result.flag}</div>
      <h3 className="text-2xl text-rosegold">You're going to {result.country}!</h3>
      <p className="mt-2 text-cream/80">{result.description}</p>
    </div>
  );
}
```

- [ ] **Step 4: Stage2TripPlanner.jsx** (shared plan + private dont-want reveal)

```jsx
import { useState } from "react";
import { getSocket } from "../socket.js";

function DynList({ label, items, onChange }) {
  const [draft,setDraft]=useState("");
  return (
    <div className="mb-4">
      <p className="font-semibold mb-1">{label}</p>
      <ul className="mb-2">{items.map((it,i)=>(
        <li key={i} className="flex justify-between bg-cream/10 rounded px-2 py-1 mb-1">
          <span>{it}</span>
          <button onClick={()=>onChange(items.filter((_,x)=>x!==i))}>✕</button>
        </li>))}
      </ul>
      <div className="flex gap-2">
        <input className="flex-1 p-1 rounded bg-cream/10" value={draft} onChange={e=>setDraft(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter"&&draft.trim()){ onChange([...items,draft.trim()]); setDraft(""); }}} />
        <button className="px-3 bg-rosegold text-navy rounded" onClick={()=>{ if(draft.trim()){onChange([...items,draft.trim()]); setDraft("");}}}>+</button>
      </div>
    </div>
  );
}

export default function Stage2TripPlanner({ me, state }) {
  const sock = getSocket();
  const plan = state.stage2.plan;
  const dw = state.stage2.dontWant;
  const [dontWant,setDontWant]=useState("");
  const updatePlan = (patch) => sock?.emit("stage2:plan", { plan: { ...plan, ...patch } });
  const submitDontWant = () => sock?.emit("stage2:dontWant", { list: dontWant.split("\n").filter(Boolean) });
  const submitPlan = () => sock?.emit("stage2:planSubmit");
  const iSubmittedDW = !!dw[me.id];
  const iSubmittedPlan = state.stage2.planSubmitted[me.id];

  return (
    <div className="mt-6">
      <h3 className="text-2xl text-rosegold mb-4">Plan the trip ✈️</h3>
      <label className="block mb-3">Destination
        <input className="w-full p-2 rounded bg-cream/10 mt-1" value={plan.destination} readOnly /></label>
      <label className="block mb-3">Hotel 🏨
        <input className="w-full p-2 rounded bg-cream/10 mt-1" value={plan.hotel}
          onChange={e=>updatePlan({ hotel: e.target.value })} /></label>
      <DynList label="🍽️ Restaurants" items={plan.restaurants} onChange={r=>updatePlan({ restaurants: r })} />
      <DynList label="🎯 Activities" items={plan.activities} onChange={a=>updatePlan({ activities: a })} />
      <label className="block mb-4">📅 Approximate dates
        <input className="w-full p-2 rounded bg-cream/10 mt-1" value={plan.dates}
          onChange={e=>updatePlan({ dates: e.target.value })} /></label>

      <div className="p-4 rounded-xl bg-navy/60 border border-rosegold/30 mb-4">
        <p className="font-semibold mb-2">🚫 Things I do NOT want my partner to do (private until both submit)</p>
        {iSubmittedDW ? (
          dw.revealed ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-rosegold">You</p><ul>{dw[me.id].map((x,i)=><li key={i}>• {x}</li>)}</ul></div>
              <div><p className="text-rosegold">Partner</p><ul>{dw[me.id==="A"?"B":"A"].map((x,i)=><li key={i}>• {x}</li>)}</ul></div>
            </div>
          ) : <p className="text-sm text-cream/60">Submitted. Waiting for partner to reveal…</p>
        ) : (
          <>
            <textarea className="w-full p-2 rounded bg-cream/10 h-24" placeholder="One per line…"
              value={dontWant} onChange={e=>setDontWant(e.target.value)} />
            <button className="mt-2 px-4 py-1 rounded bg-rosegold text-navy" onClick={submitDontWant}>Lock my list</button>
          </>
        )}
      </div>

      <button onClick={submitPlan} disabled={iSubmittedPlan || !dw.revealed}
        className="px-6 py-3 rounded-full bg-rosegold text-navy font-bold disabled:opacity-50">
        {iSubmittedPlan ? "Waiting for partner…" : "Submit full plan"}
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/data/questions.js frontend/src/components/Stage2Quiz.jsx \
  frontend/src/components/Stage2Result.jsx frontend/src/components/Stage2TripPlanner.jsx
git commit -m "feat: stage 2 quiz, result, trip planner with private reveal"
```

---

## Task 14: Stage 3 — synced YouTube yoga

**Files:**
- Create: `frontend/src/components/Stage3Yoga.jsx`

Sync model: when a user plays/pauses/seeks, emit `stage3:videoControl`. State holds
`{ playing, time, updatedBy }`. Each client applies remote state unless it was the one
that set it. Uses YouTube IFrame API loaded dynamically.

- [ ] **Step 1: Implement**

```jsx
import { useEffect, useRef } from "react";
import { getSocket } from "../socket.js";

const VIDEO_ID = "v7AYKMP6rOE"; // couples yoga session (hardcoded)

export default function Stage3Yoga({ me, state }) {
  const playerRef = useRef(null);
  const ready = useRef(false);
  const suppress = useRef(false);

  useEffect(() => {
    function init() {
      playerRef.current = new window.YT.Player("yt", {
        videoId: VIDEO_ID, height: "390", width: "640",
        events: {
          onReady: () => { ready.current = true; },
          onStateChange: (e) => {
            if (suppress.current) return;
            const t = playerRef.current.getCurrentTime();
            if (e.data === window.YT.PlayerState.PLAYING) emit(true, t);
            if (e.data === window.YT.PlayerState.PAUSED)  emit(false, t);
          },
        },
      });
    }
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = init;
    } else init();
  }, []);

  function emit(playing, time) { getSocket()?.emit("stage3:videoControl", { playing, time }); }

  // apply remote video state
  useEffect(() => {
    const v = state.stage3.video;
    if (!ready.current || !playerRef.current || v.updatedBy === me.id) return;
    suppress.current = true;
    const p = playerRef.current;
    if (Math.abs(p.getCurrentTime() - v.time) > 1.5) p.seekTo(v.time, true);
    if (v.playing) p.playVideo(); else p.pauseVideo();
    setTimeout(() => { suppress.current = false; }, 400);
  }, [state.stage3.video]);

  const partnerId = me.id === "A" ? "B" : "A";
  const confirm = () => getSocket()?.emit("stage3:confirm");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl mb-4 text-rosegold">Couples Yoga 🧘‍♀️🧘‍♂️</h2>
      <div id="yt" className="rounded-xl overflow-hidden mb-4 max-w-full" />
      <p className="text-sm mb-3 text-cream/60">Play/pause is synced between you both.</p>
      <button onClick={confirm} disabled={state.stage3[`${me.id}_done`]}
        className="px-6 py-3 rounded-full bg-rosegold text-navy font-bold disabled:opacity-50 mb-2">We finished ✓</button>
      <p className="text-sm">You {state.stage3[`${me.id}_done`]?"✓":"…"} | Partner: {state.stage3[`${partnerId}_done`]?"✓":"waiting…"}</p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Stage3Yoga.jsx
git commit -m "feat: stage 3 synced youtube yoga"
```

---

## Task 15: Stage 4 — 100 goals editor + download

**Files:**
- Create: `frontend/src/components/Stage4Goals.jsx`

- [ ] **Step 1: Implement**

```jsx
import { useState } from "react";
import { getSocket } from "../socket.js";

function buildMarkdown(username, goals, date) {
  return `# My 100 Goals — ${username} — ${date}\n\n` + goals.map((g,i)=>`${i+1}. ${g}`).join("\n") + "\n";
}

export default function Stage4Goals({ me, state }) {
  const sock = getSocket();
  const goals = state.stage4.goals[me.id];
  const partnerId = me.id === "A" ? "B" : "A";
  const partnerAllowsFewer = state.stage4.allowFewer[partnerId];
  const [draft,setDraft]=useState("");
  const [editIdx,setEditIdx]=useState(null);

  const push = (next) => sock?.emit("stage4:goals", { goals: next });
  const add = () => { if(draft.trim()){ push([...goals, draft.trim()]); setDraft(""); } };
  const del = (i) => push(goals.filter((_,x)=>x!==i));
  const saveEdit = (i,val) => { push(goals.map((g,x)=> x===i?val:g)); setEditIdx(null); };
  const toggleAllow = (e) => sock?.emit("stage4:allowFewer", { value: e.target.checked });

  const canSubmit = goals.length>0 && (partnerAllowsFewer || goals.length>=100);
  const download = () => {
    const date = new Date().toISOString().slice(0,10);
    const blob = new Blob([buildMarkdown(me.name, goals, date)], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `100-goals-${me.id}.md`; a.click();
    sock?.emit("stage4:downloaded");
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto relative">
      <h2 className="text-3xl my-4 text-rosegold">Your 100 Goals ✨</h2>
      <div className="w-full bg-cream/10 rounded-full h-3 mb-2">
        <div className="bg-rosegold h-3 rounded-full" style={{ width: `${Math.min(100,goals.length)}%` }} />
      </div>
      <p className="text-sm mb-4">{goals.length} / 100 goals added</p>

      <div className="flex flex-col-reverse gap-2 mb-4">
        {goals.map((g,i)=>(
          <div key={i} className="flex items-center gap-2 bg-cream/10 rounded px-3 py-2">
            <span className="text-rosegold">{i+1}.</span>
            {editIdx===i
              ? <input autoFocus defaultValue={g} className="flex-1 bg-cream/10 rounded px-1"
                  onBlur={e=>saveEdit(i,e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveEdit(i,e.target.value)} />
              : <span className="flex-1 cursor-pointer" onClick={()=>setEditIdx(i)}>{g}</span>}
            <button onClick={()=>del(i)}>🗑️</button>
          </div>
        ))}
      </div>

      <input className="w-full p-2 rounded bg-cream/10 mb-4" placeholder="Type a goal, press Enter…"
        value={draft} onChange={e=>setDraft(e.target.value)}
        onKeyDown={e=>e.key==="Enter"&&add()} />

      <button onClick={download} disabled={!canSubmit}
        className="px-6 py-3 rounded-full bg-rosegold text-navy font-bold disabled:opacity-50">
        Finish & Download ⬇️
      </button>
      {state.stage4.downloaded[me.id] && <p className="text-sm mt-2 text-rosegold">Downloaded. Waiting for partner…</p>}

      <label className="fixed bottom-3 right-3 bg-black/70 p-2 rounded text-xs flex items-center gap-2 z-30">
        <input type="checkbox" checked={state.stage4.allowFewer[me.id]} onChange={toggleAllow} />
        Allow partner to submit with fewer than 100
      </label>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Stage4Goals.jsx
git commit -m "feat: stage 4 goals editor + markdown download"
```

---

## Task 16: Celebration screen

**Files:**
- Create: `frontend/src/components/Celebration.jsx`

- [ ] **Step 1: Implement**

```jsx
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function Celebration({ state }) {
  useEffect(() => {
    const end = Date.now() + 3000;
    (function frame() {
      confetti({ particleCount: 4, spread: 70, origin: { y: 0.6 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);
  const country = state.stage2.result?.country || "—";
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <div className="text-7xl mb-4">💕</div>
      <h1 className="text-4xl text-rosegold mb-2">Date complete!</h1>
      <p className="text-xl mb-6">See you next time 💞</p>
      <div className="bg-navy/60 rounded-2xl p-6 border border-rosegold/30 text-left">
        <h3 className="text-rosegold mb-2">Tonight's recap</h3>
        <ul className="space-y-1">
          <li>🎮 Co-op game session ✓</li>
          <li>🌍 Next trip: {country}</li>
          <li>🧘 Couples yoga ✓</li>
          <li>✨ 100 goals set ✓</li>
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Celebration.jsx
git commit -m "feat: celebration screen with confetti + recap"
```

---

## Task 17: Dockerfiles, nginx, docker-compose, README

**Files:**
- Create: `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`, `docker-compose.yml`, `README.md`

- [ ] **Step 1: backend/Dockerfile**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src
EXPOSE 4000
CMD ["node", "src/index.js"]
```

- [ ] **Step 2: frontend/Dockerfile** (build then serve with nginx)

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

- [ ] **Step 3: frontend/nginx.conf** (serve SPA, proxy api + socket.io)

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location /api/ { proxy_pass http://backend:4000; }
  location /socket.io/ {
    proxy_pass http://backend:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
  location / { try_files $uri $uri/ /index.html; }
}
```

- [ ] **Step 4: docker-compose.yml**

```yaml
services:
  redis:
    image: redis:7-alpine
    restart: unless-stopped

  backend:
    build: ./backend
    environment:
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=change-me-in-prod
      - PORT=4000
    depends_on:
      - redis
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "8080:80"
    depends_on:
      - backend
    restart: unless-stopped
```

- [ ] **Step 5: README.md**

```markdown
# Date Night 💕

Real-time two-player couples date web app. One linear "date night" of synced stages,
state persisted in Redis so refresh/reconnect never loses progress.

## Run

    docker-compose up --build

Open http://localhost:8080

## Credentials

| User   | username | password |
|--------|----------|----------|
| User A | user_a   | pass_a   |
| User B | user_b   | pass_b   |

Log in as each user in two different browsers/devices.

## Dev mode

Append `?dev=true` → http://localhost:8080/?dev=true
- Floating debug panel: current phase, both users' online status, countdown value
- Buttons to skip to any phase
- Open two browser tabs, log in as user_a in one and user_b in the other to simulate both

Reset all progress: `curl -X POST http://localhost:8080/api/reset`

## Flow

Waiting Room → Lobby (countdown to 18:00 GMT+5 + heart/pie minigame) →
Stage 1 game flip-cards → Stage 2 travel quiz + trip planner →
Stage 3 synced couples yoga → Stage 4 100-goals list → celebration.

## Stack

Node + Express + Socket.io · React + Tailwind (Vite) · Redis · nginx · Docker Compose.
```

- [ ] **Step 6: Commit**

```bash
git add backend/Dockerfile frontend/Dockerfile frontend/nginx.conf docker-compose.yml README.md
git commit -m "feat: dockerfiles, nginx, docker-compose, readme"
```

---

## Task 18: Full-stack smoke test

- [ ] **Step 1: Build + run**

Run: `docker-compose up --build`
Expected: redis, backend (`backend on 4000`), frontend (nginx) all up.

- [ ] **Step 2: Manual verification checklist**

- Open `http://localhost:8080/?dev=true` in two browsers.
- Log in user_a and user_b → both reach Lobby (dev skip if before 18:00).
- Throw hearts/pies → other tab sees flying emoji.
- Dev-skip stage1 → flip cards → both confirm → stage2.
- Both fill quiz → result appears → fill plan + private lists → both reveal + submit → stage3.
- Yoga: play in one tab → other tab plays in sync → both confirm → stage4.
- Add goals; check "allow fewer" so partner can submit; both download `.md` → celebration + confetti.
- Refresh mid-stage → state restored (no progress lost).
- Close one tab → other shows ReconnectOverlay → reopen → overlay clears.

- [ ] **Step 3: Commit any fixes found, then final commit**

```bash
git add -A && git commit -m "chore: smoke-test fixes"
```

---

## Self-Review Notes (coverage map)

- Two hardcoded users + JWT → Task 6.
- Waiting room + countdown → Tasks 10.
- Lobby + countdown + heart/pie minigame → Task 11.
- Disconnect/reconnect, no progress loss (Redis snapshots) → Tasks 7, 10.
- Stage 1 flip cards + both-confirm gate → Task 12.
- Stage 2 15-question quiz, ~20-country weighted scoring, trip planner, private reveal → Tasks 4, 13.
- Stage 3 synced YouTube → Task 14.
- Stage 4 100 goals editor, allow-fewer, local .md download, celebration recap → Tasks 15, 16.
- Dev mode (?dev=true, panel, skip buttons, two-tab) → Tasks 10, README.
- Real-time via Socket.io rooms, Redis persistence → Tasks 6, 7.
- Mobile-friendly Tailwind, romantic palette, fade transitions → Tasks 9, 10 (`key={phase}` fade).
- docker-compose (frontend, backend, redis) + README → Task 17.
