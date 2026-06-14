# Couples Date Website — Design

**Date:** 2026-06-15
**Status:** Approved (pending user spec review)

## Overview

Full-stack real-time couples date web app for exactly two fixed users (User A, User B).
Linear multi-stage "date night" experience, fully synced between both users over
WebSockets. Server-authoritative state in Redis so refresh/reconnect never loses
progress. Deployed via `docker-compose up --build`.

## Scope Decisions

- **Session model:** single global shared session. Key `session:main` in Redis.
  A and B always join the same room (`main`). No session ids, no pairing.
- **Auth:** two hardcoded credentials. `POST /api/login` validates, returns a signed
  **JWT** (`{ user: "A" | "B" }`). Client stores JWT, sends it on socket `auth`.
- **Assets:** self-contained placeholders (CSS gradients + emoji + baked-in names/text).
  No external network calls at runtime. Exception: Stage 3 YouTube embed (one hardcoded
  URL via the YouTube iframe API).
- **Frontend serving:** Vite build → static files served by **nginx**, which proxies
  `/api` and `/socket.io` to the backend container.
- **Run mode:** docker-compose only (`frontend`, `backend`, `redis`). No separate npm dev
  scripts required by spec.
- **Lobby → Stage 1 gate:** countdown to next 18:00 GMT+5. At/after 18:00 a "Begin date"
  button appears; **both** must click to start. Dev panel can skip to any phase anytime.

## Architecture

Three docker-compose services:

| Service  | Stack                              | Role |
|----------|------------------------------------|------|
| redis    | redis:7-alpine                     | Single source of truth for game state + presence |
| backend  | Node + Express + Socket.io         | `/api/login` (JWT), all game state over sockets |
| frontend | React + Tailwind, Vite build, nginx| UI; nginx proxies /api and /socket.io to backend |

**Server is authoritative.** Every client action → validate → mutate Redis →
broadcast full `state` snapshot to room `main`. Clients render purely from the last
`state` snapshot, which makes reconnect/refresh automatically correct.

## Redis State Model

One JSON document stored at key `session:main` (read-modify-write; single session so no
contention concern, but use a short per-write lock or atomic Lua if needed):

```
phase: waiting | lobby | stage1 | stage2 | stage3 | stage4 | done
presence: { A: { online: bool }, B: { online: bool } }   # online is transient, set by socket lifecycle
startedAt: timestamp | null                                # when stage1 began

stage1: { A_done: bool, B_done: bool }

stage2:
  answers: { A: {...15 answers...} | null, B: {...} | null }
  result: { country, flag, description } | null
  plan: { destination, hotel, restaurants: [], activities: [], dates }   # shared, collaborative
  dontWant: { A: [] | null, B: [] | null, revealed: bool }
  planSubmitted: { A: bool, B: bool }

stage3: { A_done: bool, B_done: bool, video: { playing: bool, time: number, updatedBy } }

stage4:
  goals: { A: [string], B: [string] }
  allowFewer: { A: bool, B: bool }        # A's flag lets B submit with <100
  downloaded: { A: bool, B: bool }
```

Presence (`online`) is the ONLY field cleared on disconnect. All progress fields persist.

## Phase Gate Logic (server, pure function `computePhase(state, now)`)

- `waiting → lobby`: both online.
- `lobby → stage1`: `now >= nextSixPmGmtPlus5()` AND both clicked "Begin date" (tracked
  transiently) AND both online. Dev `setPhase` bypasses.
- `stage1 → stage2`: `stage1.A_done && stage1.B_done`.
- `stage2 → stage3`: both answers submitted (→ compute result), both `planSubmitted`,
  and `dontWant.revealed` (auto-reveals when both dontWant lists submitted).
- `stage3 → stage4`: `stage3.A_done && stage3.B_done`.
- `stage4 → done`: `downloaded.A && downloaded.B`.

Phase only ever advances (monotonic); never auto-resets on disconnect.

## Socket Protocol

**client → server**
- `auth { jwt }` → join room `main`, set presence online, reply with full `state`.
- `lobby:begin` — mark this user ready to start (only effective at/after 18:00).
- `lobby:throw { kind: "heart" | "pie" }` — ephemeral, broadcast only, NOT persisted.
- `stage1:confirm`
- `stage2:answers { answers }`
- `stage2:plan { plan }` — collaborative shared plan updates.
- `stage2:planSubmit`
- `stage2:dontWant { list }`
- `stage3:videoControl { playing, time }`
- `stage3:confirm`
- `stage4:goals { goals }` — full replace of this user's goals array (debounced client-side).
- `stage4:allowFewer { value }`
- `stage4:downloaded`
- `dev:setPhase { phase }` — dev only.

**server → client**
- `state { ...full snapshot... }` — after every mutation.
- `presence { A: bool, B: bool }` — fast presence updates (also embedded in `state`).
- `lobby:projectile { from, kind, lane }` — ephemeral animation trigger to the other user.
- `reconnecting { user }` / resolved via next `presence`.

## Frontend Structure

Single `<App>` holds the latest `state` + own identity, renders the component for
`state.phase`:

- `Login` — username/password form → `/api/login` → store JWT → connect socket.
- `WaitingRoom` — "Waiting for [partner]…" pulsing animation + shared countdown.
- `Lobby` — shared countdown + heart/pie launcher minigame; "Begin date" button after 18:00.
- `Stage1Cards` — 3 flip cards (CSS 3D), "We both finished" confirm + partner indicator.
- `Stage2Quiz` — 15-question form (own answers) → on both submit show `Stage2Result`.
- `Stage2TripPlanner` — shared plan fields + dynamic lists + private "do NOT want" list
  (hidden until both submit, then revealed simultaneously).
- `Stage3Yoga` — synced YouTube player (iframe API) + "We finished" confirm.
- `Stage4Goals` — 100-goals editor (Enter to commit chip, edit/delete, progress bar,
  allow-fewer checkbox) + "Finish & Download" (local `.md` download).
- `Celebration` — confetti + recap (game, country, yoga ✓, goals ✓).
- `DevPanel` — floating; phase, A/B online, countdown value, skip-to-phase buttons.
- `ReconnectOverlay` — shown when partner offline mid-session.

Shared hooks: `useCountdown(target)`, `useSocketState()`.
Romantic palette: deep navy `#1a1a3a`, rose gold `#b76e79`, soft cream `#f5ede1`.
Mobile-first responsive. Fade/slide transitions between phases.

## Pure Logic Units (unit-tested, framework-free)

- `computePhase(state, now)` — gate transitions.
- `scoreQuiz(answers)` — 15 answers → weighted score over ~20 countries → best match
  `{ country, flag, description }`.
- `nextSixPmGmtPlus5(now)` — next occurrence of 18:00 in GMT+5.
- `canSubmitGoals(goals, partnerAllowFewer)` — 100 unless partner allowed fewer.
- `buildGoalsMarkdown(username, goals, date)` — `.md` export string.

## Disconnect Handling

Socket `disconnect` → set `presence[user].online = false` → broadcast `presence`.
Partner UI shows `ReconnectOverlay`. Redis state untouched. On reconnect the client
re-auths with stored JWT and receives a full `state` snapshot → resumes exactly.

## Testing Strategy

- TDD for the pure logic units above (highest value, deterministic).
- Socket integration tests for 1–2 representative flows (login→state, stage confirm gate).
- Frontend kept thin (renders server state); minimal component tests for the goals editor
  interactions and the reveal-after-both gate.

## Out of Scope (YAGNI)

- Registration, password reset, multiple couples, persistence of projectiles,
  real Steam API, accounts/profiles, analytics.
