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
