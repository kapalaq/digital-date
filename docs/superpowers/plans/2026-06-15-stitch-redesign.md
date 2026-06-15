# Stitch Redesign: Synced Date Night Experience

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current warm Jasmine palette with the full Stitch dark-glassmorphism design system across all 13 frontend components, adapting mobile Stitch screens to wide responsive web layouts.

**Architecture:** Token-first sweep — update `tailwind.config.js` with Stitch design tokens once, add glassmorphism CSS utilities to `theme.css`, then rewrite each component using those tokens. Add one new `FloatingStatus` component mounted in `App.jsx`. No backend changes.

**Tech Stack:** React 18, Tailwind CSS v3, Vite, Plus Jakarta Sans + Playfair Display (Google Fonts), canvas-confetti (already installed)

---

## File Map

| Action | File | Change |
|---|---|---|
| Modify | `frontend/tailwind.config.js` | Replace 4-color palette with 12 Stitch tokens, add borderRadius + fontFamily |
| Modify | `frontend/index.html` | Add Google Fonts link tags |
| Modify | `frontend/src/theme.css` | Replace body rule, add glassmorphism utilities, add YouTube iframe fix |
| Create | `frontend/src/components/FloatingStatus.jsx` | New: player online-status pips |
| Modify | `frontend/src/App.jsx` | Mount FloatingStatus, style Connecting state |
| Modify | `frontend/src/components/Login.jsx` | Full restyle |
| Modify | `frontend/src/components/WaitingRoom.jsx` | Full restyle |
| Modify | `frontend/src/components/Lobby.jsx` | Full restyle, wider arena |
| Modify | `frontend/src/components/Stage1Cards.jsx` | Full restyle, 3-col grid |
| Modify | `frontend/src/components/Stage2Quiz.jsx` | Full restyle |
| Modify | `frontend/src/components/Stage2TripPlanner.jsx` | Full restyle, glass form |
| Modify | `frontend/src/components/Stage2Result.jsx` | Full restyle |
| Modify | `frontend/src/components/Stage3Yoga.jsx` | Full restyle, responsive video |
| Modify | `frontend/src/components/Stage4Goals.jsx` | Full restyle, two-column layout |
| Modify | `frontend/src/components/Celebration.jsx` | Full restyle, Stitch colors |
| Modify | `frontend/src/components/DevPanel.jsx` | Restyle as glass overlay |
| Modify | `frontend/src/components/ReconnectOverlay.jsx` | Restyle as glass modal |
| Modify | `frontend/.gitignore` | Add `.superpowers/` |

---

## Task 1: Design Tokens + Fonts + CSS Utilities

**Files:**
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/index.html`
- Modify: `frontend/src/theme.css`

- [ ] **Step 1: Replace tailwind.config.js**

```js
// frontend/tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "dn-bg":          "#10102e",
        "dn-surface":     "#1c1c3b",
        "dn-surface-lo":  "#181836",
        "dn-surface-hi":  "#272746",
        "dn-surface-top": "#323251",
        "dn-rose":        "#ffb0cf",
        "dn-rose-bright": "#ff7eb9",
        "dn-violet":      "#cabeff",
        "dn-amber":       "#ffb951",
        "dn-text":        "#e2dfff",
        "dn-muted":       "#dac0c8",
        "dn-outline":     "#a28b92",
      },
      borderRadius: {
        pill:    "9999px",
        card:    "1.5rem",
        "card-lg": "2rem",
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        sans:    ['"Plus Jakarta Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Add Google Fonts to index.html**

```html
<!-- frontend/index.html -->
<!doctype html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Date Night 💕</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>
```

- [ ] **Step 3: Replace theme.css**

```css
/* frontend/src/theme.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply text-dn-text;
  font-family: "Plus Jakarta Sans", sans-serif;
  background: radial-gradient(ellipse at 30% 20%, #1a0a35 0%, #10102e 60%);
  min-height: 100vh;
}

.fade-in { animation: fade .5s ease; }
@keyframes fade { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }

/* Lobby projectile flight — unchanged */
@keyframes fly-right { from { left: 18%; transform: rotate(0deg); } to { left: 78%; transform: rotate(360deg); } }
@keyframes fly-left  { from { left: 78%; transform: rotate(0deg); } to { left: 18%; transform: rotate(-360deg); } }
.animate-fly-right { animation: fly-right 1.4s linear forwards; }
.animate-fly-left  { animation: fly-left  1.4s linear forwards; }

/* Lobby hit effects — unchanged */
@keyframes splat { 0%{opacity:1;transform:scale(.4)} 40%{opacity:1;transform:scale(1.6)} 100%{opacity:0;transform:scale(1)} }
@keyframes arrow { 0%{opacity:1;transform:rotate(-45deg) scale(.5)} 30%{opacity:1;transform:rotate(-45deg) scale(1.3)} 100%{opacity:0;transform:rotate(-45deg) translateY(-12px) scale(1)} }
.animate-splat { animation: splat 2s ease forwards; }
.animate-arrow { animation: arrow 2s ease forwards; }

/* Glassmorphism utilities */
.glass {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 1.5rem;
}

.glass-rose {
  background: rgba(255,176,207,0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,176,207,0.25);
  border-radius: 1.5rem;
  transition: border-color .2s, box-shadow .2s;
}
.glass-rose:hover, .glass-rose:focus-within {
  border-color: rgba(255,176,207,0.5);
  box-shadow: 0 0 20px rgba(255,176,207,0.15);
}

.glass-violet {
  background: rgba(202,190,255,0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(202,190,255,0.25);
  border-radius: 1.5rem;
}

.glass-input {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 9999px;
  color: #e2dfff;
  padding: 0.6rem 1.25rem;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
  width: 100%;
}
.glass-input:focus {
  border-color: rgba(255,176,207,0.6);
  box-shadow: 0 0 0 3px rgba(255,176,207,0.1);
}
.glass-input::placeholder { color: #a28b92; }

.glass-textarea {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 0.75rem;
  color: #e2dfff;
  padding: 0.75rem 1rem;
  outline: none;
  resize: none;
  width: 100%;
  transition: border-color .2s;
}
.glass-textarea:focus { border-color: rgba(255,176,207,0.4); }
.glass-textarea::placeholder { color: #a28b92; }

/* Make YouTube iframe responsive inside its container */
#yt iframe { width: 100% !important; aspect-ratio: 16/9; height: auto !important; }
```

- [ ] **Step 4: Add .superpowers/ to .gitignore**

Add to the end of `frontend/.gitignore` (or create if absent):
```
.superpowers/
```

Also add to root `.gitignore` if it exists:
```
.superpowers/
```

- [ ] **Step 5: Start dev server and verify fonts load**

```bash
cd /Users/ruslan/Documents/digital-date/frontend && npm run dev
```

Open http://localhost:5173. Page should be dark (`#10102e` background). Open DevTools → Network → filter "Fonts" — verify `Playfair Display` and `Plus Jakarta Sans` appear.

- [ ] **Step 6: Commit**

```bash
git add frontend/tailwind.config.js frontend/index.html frontend/src/theme.css
git commit -m "feat: Stitch design tokens — dark palette, glassmorphism utilities, Google Fonts"
```

---

## Task 2: FloatingStatus Component + App.jsx

**Files:**
- Create: `frontend/src/components/FloatingStatus.jsx`
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Create FloatingStatus.jsx**

```jsx
// frontend/src/components/FloatingStatus.jsx
const PLAYERS = [
  { id: "A", name: "User A", dot: "#ffb0cf", glow: "rgba(255,176,207,0.7)" },
  { id: "B", name: "User B", dot: "#cabeff", glow: "rgba(202,190,255,0.7)" },
];

export default function FloatingStatus({ me, state }) {
  return (
    <div className="fixed top-4 right-4 flex gap-2 z-30">
      {PLAYERS.map(({ id, name, dot, glow }) => {
        const online = state.presence[id].online;
        return (
          <div key={id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-pill text-xs font-semibold transition-opacity"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.15)",
              opacity: online ? 1 : 0.45,
            }}>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{
              background: online ? dot : "#555",
              boxShadow: online ? `0 0 6px ${glow}` : "none",
            }} />
            <span className={`text-dn-text ${me.id === id ? "font-bold" : "font-normal"}`}>{name}</span>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Update App.jsx**

```jsx
// frontend/src/App.jsx
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
import FloatingStatus from "./components/FloatingStatus.jsx";

const DEV = new URLSearchParams(location.search).get("dev") === "true";

export default function App() {
  const [me, setMe] = useState(null);
  const state = useSocketState();
  if (!me) return <Login onAuth={setMe} />;
  if (!state) return (
    <div className="min-h-screen flex items-center justify-center text-dn-muted">
      Connecting…
    </div>
  );

  const partnerId = me.id === "A" ? "B" : "A";
  const partnerName = me.id === "A" ? "User B" : "User A";
  const partnerOffline = !state.presence[partnerId].online &&
    !["waiting", "done"].includes(state.phase);

  const view = {
    waiting: <WaitingRoom me={me} state={state} />,
    lobby:   <Lobby me={me} state={state} />,
    stage1:  <Stage1Cards me={me} state={state} />,
    stage2:  <Stage2Quiz me={me} state={state} />,
    stage3:  <Stage3Yoga me={me} state={state} />,
    stage4:  <Stage4Goals me={me} state={state} />,
    done:    <Celebration me={me} state={state} />,
  }[state.phase];

  return (
    <div className="fade-in" key={state.phase}>
      {view}
      <FloatingStatus me={me} state={state} />
      {partnerOffline && <ReconnectOverlay partnerName={partnerName} />}
      {DEV && <DevPanel state={state} me={me} />}
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

Log in as `user_a`. Top-right corner should show two glass pill badges: "User A" (bold, rose dot) and "User B" (dim, gray dot since offline). Open a second tab, log in as `user_b` — both dots should glow.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/FloatingStatus.jsx frontend/src/App.jsx
git commit -m "feat: FloatingStatus component — player online pips fixed top-right"
```

---

## Task 3: Login Screen

**Files:**
- Modify: `frontend/src/components/Login.jsx`

- [ ] **Step 1: Replace Login.jsx**

```jsx
// frontend/src/components/Login.jsx
import { useState } from "react";
import { login } from "../api.js";
import { connectSocket } from "../socket.js";

export default function Login({ onAuth }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      const token = await login(u, p);
      connectSocket(token);
      const me = JSON.parse(atob(token.split(".")[1]));
      onAuth({ token, id: me.id, name: me.name });
    } catch {
      setErr("Invalid credentials");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center fade-in px-4">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <h1 className="font-display text-5xl text-dn-rose text-center">Date Night</h1>
        <p className="text-dn-muted text-xs tracking-widest uppercase">your private sanctuary</p>
        <form onSubmit={submit} className="glass w-full p-8 flex flex-col gap-4">
          <input
            className="glass-input"
            placeholder="username"
            value={u}
            onChange={e => setU(e.target.value)}
          />
          <input
            className="glass-input"
            type="password"
            placeholder="password"
            value={p}
            onChange={e => setP(e.target.value)}
          />
          {err && <p className="text-red-400 text-sm text-center">{err}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-pill bg-dn-rose-bright text-dn-bg font-bold text-sm tracking-wide hover:opacity-90 transition mt-2">
            Begin the night
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Navigate to http://localhost:5173. Should see: dark radial gradient bg, "Date Night" in Playfair Display / rose, glass card with pill inputs and rose CTA. Test invalid creds → red error text appears.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Login.jsx
git commit -m "feat: Login — Stitch dark glass card, Playfair Display heading, pill inputs"
```

---

## Task 4: WaitingRoom Screen

**Files:**
- Modify: `frontend/src/components/WaitingRoom.jsx`

- [ ] **Step 1: Replace WaitingRoom.jsx**

```jsx
// frontend/src/components/WaitingRoom.jsx
import { useCountdown } from "../hooks/useCountdown.js";

export default function WaitingRoom({ me, state }) {
  const { label } = useCountdown();
  const partner = me.id === "A" ? "User B" : "User A";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center fade-in gap-4 px-4">
      <div className="text-7xl animate-pulse">💗</div>
      <h2 className="font-display text-4xl text-dn-text text-center">
        Waiting for {partner}…
      </h2>
      <p className="text-dn-muted text-xs tracking-widest uppercase">date begins in</p>
      <p className="text-dn-amber text-3xl font-bold">{label}</p>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Use dev panel (`?dev=true`) to jump to `waiting` phase. Should see: dark bg, pulsing 💗, Playfair heading, amber countdown. FloatingStatus pips visible top-right.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/WaitingRoom.jsx
git commit -m "feat: WaitingRoom — dark glass style, Playfair heading, amber countdown"
```

---

## Task 5: Lobby Screen

**Files:**
- Modify: `frontend/src/components/Lobby.jsx`

- [ ] **Step 1: Replace Lobby.jsx**

```jsx
// frontend/src/components/Lobby.jsx
import { useState, useCallback, useRef } from "react";
import { getSocket } from "../socket.js";
import { useCountdown } from "../hooks/useCountdown.js";
import Projectiles from "./Projectiles.jsx";

export default function Lobby({ me, state }) {
  const { label, done } = useCountdown();
  const [hitEffects, setHitEffects] = useState({ A: null, B: null });
  const [isDodging, setIsDodging] = useState(false);
  const isDodgingRef = useRef(false);

  const throwIt = (kind) => getSocket()?.emit("lobby:throw", { kind });
  const begin   = () => getSocket()?.emit("lobby:begin");
  const iBegan  = state.begin[me.id];

  const dodge = () => {
    if (isDodgingRef.current) return;
    setIsDodging(true);
    isDodgingRef.current = true;
    setTimeout(() => { setIsDodging(false); isDodgingRef.current = false; }, 1500);
  };

  const onHit = useCallback((kind, target) => {
    if (target === me.id && isDodgingRef.current) return;
    const ts = Date.now();
    setHitEffects(h => ({ ...h, [target]: { kind, ts } }));
    setTimeout(() => setHitEffects(h => {
      if (h[target]?.ts !== ts) return h;
      return { ...h, [target]: null };
    }), 2200);
  }, [me.id]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      <Projectiles meId={me.id} onHit={onHit} />

      <h2 className="font-display text-4xl text-dn-rose mb-1">The Lobby</h2>
      <p className="text-dn-muted text-sm mb-10">
        Date begins in <span className="text-dn-amber font-semibold">{label}</span>
      </p>

      <div className="flex items-end justify-center gap-8 mb-8 w-full max-w-2xl">
        <AvatarSlot id="A" hit={hitEffects.A} isDodging={me.id === "A" && isDodging} />

        <div className="flex flex-col items-center gap-4 pb-8">
          <button
            onClick={() => throwIt("heart")}
            className="text-5xl hover:scale-125 active:scale-95 transition-transform"
            title="Throw heart">❤️</button>
          <button
            onClick={() => throwIt("pie")}
            className="text-5xl hover:scale-125 active:scale-95 transition-transform"
            title="Throw pie">🥧</button>
          <button
            onClick={dodge}
            disabled={isDodging}
            className={`mt-1 px-4 py-1.5 rounded-pill text-xs font-bold border transition-all
              ${isDodging
                ? "border-dn-rose/20 text-dn-rose/30 cursor-default"
                : "border-dn-rose/50 text-dn-rose hover:bg-dn-rose/10"}`}>
            {isDodging ? "dodging…" : "Dodge 🏃"}
          </button>
        </div>

        <AvatarSlot id="B" hit={hitEffects.B} isDodging={me.id === "B" && isDodging} />
      </div>

      <p className="text-xs text-dn-muted mb-8 tracking-wide">
        throw hearts &amp; pies while you wait
      </p>

      {done && (
        <button
          onClick={begin}
          disabled={iBegan}
          className="px-8 py-3 rounded-pill bg-dn-rose-bright text-dn-bg font-bold disabled:opacity-50 hover:opacity-90 transition">
          {iBegan ? "Waiting for partner…" : "Begin the date 💞"}
        </button>
      )}
    </div>
  );
}

function AvatarSlot({ id, hit, isDodging }) {
  const emoji = id === "A" ? "👩" : "👨";
  const name  = id === "A" ? "User A" : "User B";
  const color = id === "A" ? "#ffb0cf" : "#cabeff";

  return (
    <div className="flex flex-col items-center gap-3 w-28">
      <div className={`relative text-8xl select-none transition-all duration-200
        ${isDodging ? "translate-x-6 -translate-y-4" : ""}
        ${hit ? "scale-90" : "scale-100"}`}>
        {emoji}
        {hit?.kind === "pie" && (
          <span key={hit.ts + "-pie"}
            className="absolute inset-0 flex items-center justify-center text-4xl animate-splat pointer-events-none">
            💥
          </span>
        )}
        {hit?.kind === "heart" && (
          <span key={hit.ts + "-heart"}
            className="absolute -top-4 right-0 text-3xl animate-arrow pointer-events-none">
            💘
          </span>
        )}
      </div>
      <span className="text-xs font-semibold tracking-widest uppercase" style={{ color }}>
        {name}
      </span>
      {isDodging && (
        <span className="text-xs text-dn-amber animate-bounce">dodge!</span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Jump to `lobby` phase. Should see: dark bg, Playfair "The Lobby" heading, large avatars (text-8xl), rose/violet name labels, glass-style pill dodge button, amber countdown. Throw hearts/pies — projectiles and hit effects still work.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Lobby.jsx
git commit -m "feat: Lobby — wider arena, Stitch tokens, rose/violet avatar labels"
```

---

## Task 6: Stage 1 — Game Selection

**Files:**
- Modify: `frontend/src/components/Stage1Cards.jsx`

- [ ] **Step 1: Replace Stage1Cards.jsx**

```jsx
// frontend/src/components/Stage1Cards.jsx
import { useState } from "react";
import { getSocket } from "../socket.js";

const GAMES = [
  { name: "It Takes Two",  emoji: "🧵", desc: "A story of love, trust, and cooperation." },
  { name: "Unravel Two",   emoji: "🧶", desc: "Two yarns, one adventure." },
  { name: "Portal 2",      emoji: "🌀", desc: "Think with portals. Together." },
];

export default function Stage1Cards({ me, state }) {
  const [flipped, setFlipped] = useState([false, false, false]);
  const partnerId = me.id === "A" ? "B" : "A";
  const flip = (i) => setFlipped(f => f.map((v, idx) => idx === i ? !v : v));
  const confirm = () => getSocket()?.emit("stage1:confirm");
  const iDone      = state.stage1[`${me.id}_done`];
  const partnerDone = state.stage1[`${partnerId}_done`];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 fade-in">
      <h2 className="font-display text-4xl text-dn-text mb-2 text-center">Pick your game</h2>
      <p className="text-dn-muted text-sm mb-10 tracking-wide">flip a card to reveal</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 w-full max-w-3xl">
        {GAMES.map((g, i) => (
          <div key={i} onClick={() => flip(i)} className="cursor-pointer h-64"
            style={{ perspective: "1000px" }}>
            <div className="relative w-full h-full transition-transform duration-500"
              style={{ transformStyle: "preserve-3d", transform: flipped[i] ? "rotateY(180deg)" : "none" }}>
              {/* Front face */}
              <div className="absolute inset-0 glass flex items-center justify-center text-6xl"
                style={{ backfaceVisibility: "hidden" }}>❓</div>
              {/* Back face */}
              <div className="absolute inset-0 glass-rose flex flex-col items-center justify-center p-5 gap-3"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                <div className="text-6xl">{g.emoji}</div>
                <div className="font-display text-xl text-dn-rose text-center">{g.name}</div>
                <div className="text-dn-muted text-xs text-center">{g.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={confirm} disabled={iDone}
        className="px-8 py-3 rounded-pill bg-dn-rose-bright text-dn-bg font-bold disabled:opacity-50 hover:opacity-90 transition mb-4">
        We both finished this game ✓
      </button>
      <p className="text-sm text-dn-muted">
        You {iDone ? "✓" : "…"} · Partner: {partnerDone ? "✓" : "waiting…"}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Jump to `stage1`. Cards should show glass dark fronts with ❓. Click to flip — back shows `glass-rose` card with game name in Playfair. 3-column grid on desktop, stacked on mobile.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Stage1Cards.jsx
git commit -m "feat: Stage1 — glass flip cards, 3-col grid, Stitch palette"
```

---

## Task 7: Stage 2 — Travel Quiz

**Files:**
- Modify: `frontend/src/components/Stage2Quiz.jsx`

- [ ] **Step 1: Replace Stage2Quiz.jsx**

```jsx
// frontend/src/components/Stage2Quiz.jsx
import { useState } from "react";
import { getSocket } from "../socket.js";
import { QUESTIONS } from "../data/questions.js";
import Stage2Result from "./Stage2Result.jsx";
import Stage2TripPlanner from "./Stage2TripPlanner.jsx";

const Q_COLORS = {
  q1:  { cold: "#0d1f35", mild: "#0e2818", hot: "#2d1500" },
  q2:  { nature: "#0e2818", city: "#1e1035" },
  q3:  { budget: "#1c1c1c", mid: "#2a1c00", luxury: "#2a2000" },
  q5:  { beach: "#082030", mountains: "#181828" },
  q15: { romance: "#2a0d18", adventure: "#2a1800", relaxation: "#0d2020", culture: "#18102a" },
};
const DEFAULT_CARD_BG = "rgba(255,255,255,0.05)";

function cardStyle(q, ans) {
  const val = Array.isArray(ans) ? (ans?.[0] ?? null) : (ans ?? null);
  const color = val && Q_COLORS[q.id]?.[val];
  return { backgroundColor: color || DEFAULT_CARD_BG, transition: "background-color 0.45s ease" };
}

export default function Stage2Quiz({ me, state }) {
  const [ans, setAns] = useState({});
  const mySubmitted  = !!state.stage2.answers[me.id];
  const bothAnswered = state.stage2.answers.A && state.stage2.answers.B;

  if (bothAnswered && state.stage2.result) {
    return (
      <div className="min-h-screen p-6 max-w-2xl mx-auto">
        <Stage2Result result={state.stage2.result} />
        <Stage2TripPlanner me={me} state={state} />
      </div>
    );
  }

  if (mySubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-dn-muted">
        Answers locked in. Waiting for partner…
      </div>
    );
  }

  const set    = (q, val) => setAns(a => ({ ...a, [q]: val }));
  const toggle = (q, val) => setAns(a => {
    const cur = a[q] || [];
    return { ...a, [q]: cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val] };
  });
  const submit   = () => getSocket()?.emit("stage2:answers", { answers: ans });
  const complete = QUESTIONS.every(q => q.multi ? (ans[q.id]?.length > 0) : ans[q.id]);

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto fade-in">
      <h2 className="font-display text-4xl text-dn-text my-6">Where to next? 🌍</h2>

      {QUESTIONS.map((q, idx) => {
        const cur = ans[q.id];
        return (
          <div key={q.id} className="mb-4 rounded-card p-5 border border-white/10"
            style={cardStyle(q, cur)}>
            <p className="text-xs text-dn-rose/60 font-semibold mb-1 uppercase tracking-widest">
              {idx + 1} / {QUESTIONS.length}
            </p>
            <p className="mb-3 font-semibold text-dn-text text-base">{q.text}</p>
            <div className="flex flex-wrap gap-2">
              {q.opts.map(([val, label]) => {
                const active = q.multi ? (cur || []).includes(val) : cur === val;
                return (
                  <button key={val}
                    onClick={() => q.multi ? toggle(q.id, val) : set(q.id, val)}
                    className={`px-4 py-1.5 rounded-pill text-sm font-medium border transition-all
                      ${active
                        ? "bg-dn-rose text-dn-bg border-dn-rose"
                        : "border-dn-rose/30 text-dn-text/80 hover:border-dn-rose/60"}`}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <button onClick={submit} disabled={!complete}
        className="px-8 py-3 rounded-pill bg-dn-rose-bright text-dn-bg font-bold disabled:opacity-40 my-6 hover:opacity-90 transition">
        Submit answers
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Jump to `stage2`. Question cards render on dark glass bg. Selecting an option turns its chip rose. Background card color shifts subtly per Q_COLORS. Submit button rose pill.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Stage2Quiz.jsx
git commit -m "feat: Stage2Quiz — Stitch tokens, rose pill options, dark question cards"
```

---

## Task 8: Stage 2 — Trip Planner

**Files:**
- Modify: `frontend/src/components/Stage2TripPlanner.jsx`

- [ ] **Step 1: Replace Stage2TripPlanner.jsx**

```jsx
// frontend/src/components/Stage2TripPlanner.jsx
import { useState } from "react";
import { getSocket } from "../socket.js";

function DynList({ label, items, onChange }) {
  const [draft, setDraft] = useState("");
  return (
    <div className="mb-5">
      <p className="text-dn-muted text-xs uppercase tracking-widest mb-2">{label}</p>
      <ul className="mb-2 flex flex-col gap-1">
        {items.map((it, i) => (
          <li key={i}
            className="flex justify-between items-center px-4 py-2 text-sm text-dn-text"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9999px" }}>
            <span>{it}</span>
            <button onClick={() => onChange(items.filter((_, x) => x !== i))}
              className="text-dn-muted hover:text-dn-rose ml-2 text-xs">✕</button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          className="glass-input flex-1 text-sm"
          style={{ borderRadius: "1rem" }}
          placeholder={`Add…`}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && draft.trim()) { onChange([...items, draft.trim()]); setDraft(""); }
          }}
        />
        <button
          className="px-4 py-2 rounded-pill text-sm font-bold transition"
          style={{ background: "rgba(255,176,207,0.15)", border: "1px solid rgba(255,176,207,0.3)", color: "#ffb0cf" }}
          onClick={() => { if (draft.trim()) { onChange([...items, draft.trim()]); setDraft(""); } }}>
          +
        </button>
      </div>
    </div>
  );
}

export default function Stage2TripPlanner({ me, state }) {
  const sock = getSocket();
  const plan = state.stage2.plan;
  const dw   = state.stage2.dontWant;
  const [dontWant, setDontWant] = useState("");

  const updatePlan    = (patch) => sock?.emit("stage2:plan", { plan: { ...plan, ...patch } });
  const submitDontWant = () => sock?.emit("stage2:dontWant", { list: dontWant.split("\n").filter(Boolean) });
  const submitPlan    = () => sock?.emit("stage2:planSubmit");
  const iSubmittedDW  = !!dw[me.id];
  const iSubmittedPlan = state.stage2.planSubmitted[me.id];

  return (
    <div className="mt-8 fade-in">
      <h3 className="font-display text-3xl text-dn-text mb-6">Plan the trip ✈️</h3>

      <div className="glass p-6 mb-4">
        <label className="block mb-4">
          <span className="text-dn-muted text-xs uppercase tracking-widest">Destination</span>
          <input className="glass-input mt-2" style={{ borderRadius: "1rem" }}
            value={plan.destination} readOnly />
        </label>
        <label className="block mb-4">
          <span className="text-dn-muted text-xs uppercase tracking-widest">Hotel 🏨</span>
          <input className="glass-input mt-2" style={{ borderRadius: "1rem" }}
            value={plan.hotel} onChange={e => updatePlan({ hotel: e.target.value })} />
        </label>
        <DynList label="🍽️ Restaurants" items={plan.restaurants} onChange={r => updatePlan({ restaurants: r })} />
        <DynList label="🎯 Activities"   items={plan.activities}  onChange={a => updatePlan({ activities: a })} />
        <label className="block">
          <span className="text-dn-muted text-xs uppercase tracking-widest">📅 Approximate dates</span>
          <input className="glass-input mt-2" style={{ borderRadius: "1rem" }}
            value={plan.dates} onChange={e => updatePlan({ dates: e.target.value })} />
        </label>
      </div>

      <div className="glass p-5 mb-5" style={{ borderColor: "rgba(255,176,207,0.2)" }}>
        <p className="font-semibold text-dn-text mb-1">🚫 Things I do NOT want</p>
        <p className="text-dn-muted text-xs mb-3">Private until both submit</p>
        {iSubmittedDW ? (
          dw.revealed ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-dn-rose text-xs uppercase tracking-widest mb-2">You</p>
                <ul className="flex flex-col gap-1">
                  {dw[me.id].map((x, i) => <li key={i} className="text-dn-text">• {x}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-dn-violet text-xs uppercase tracking-widest mb-2">Partner</p>
                <ul className="flex flex-col gap-1">
                  {dw[me.id === "A" ? "B" : "A"].map((x, i) => <li key={i} className="text-dn-text">• {x}</li>)}
                </ul>
              </div>
            </div>
          ) : <p className="text-sm text-dn-muted">Submitted. Waiting for partner…</p>
        ) : (
          <>
            <textarea
              className="glass-textarea"
              placeholder="One per line…"
              value={dontWant}
              onChange={e => setDontWant(e.target.value)}
            />
            <button
              className="mt-3 px-5 py-2 rounded-pill text-sm font-semibold transition"
              style={{ background: "rgba(255,176,207,0.15)", border: "1px solid rgba(255,176,207,0.3)", color: "#ffb0cf" }}
              onClick={submitDontWant}>
              Lock my list
            </button>
          </>
        )}
      </div>

      <button onClick={submitPlan} disabled={iSubmittedPlan || !dw.revealed}
        className="px-8 py-3 rounded-pill bg-dn-rose-bright text-dn-bg font-bold disabled:opacity-50 hover:opacity-90 transition">
        {iSubmittedPlan ? "Waiting for partner…" : "Submit full plan"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

After both players submit quiz answers, the trip planner section should render: glass card form, `glass-input` fields (pill-shaped), DynList items as pills, textarea styled as `glass-textarea`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Stage2TripPlanner.jsx
git commit -m "feat: Stage2TripPlanner — glass form, pill list items, Stitch tokens"
```

---

## Task 9: Stage 2 — Trip Result

**Files:**
- Modify: `frontend/src/components/Stage2Result.jsx`

- [ ] **Step 1: Replace Stage2Result.jsx**

```jsx
// frontend/src/components/Stage2Result.jsx
export default function Stage2Result({ result }) {
  return (
    <div className="text-center my-6 p-8 glass-rose fade-in">
      <div className="text-7xl mb-4">{result.flag}</div>
      <h3 className="font-display text-3xl text-dn-rose mb-2">
        You&apos;re going to {result.country}!
      </h3>
      <p className="text-dn-muted mt-2">{result.description}</p>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Complete quiz with both players. Result card renders as `glass-rose` — pink-tinted glass with large flag emoji, Playfair heading in rose, muted description.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Stage2Result.jsx
git commit -m "feat: Stage2Result — glass-rose hero card, Playfair heading"
```

---

## Task 10: Stage 3 — Synced Yoga

**Files:**
- Modify: `frontend/src/components/Stage3Yoga.jsx`

- [ ] **Step 1: Replace Stage3Yoga.jsx**

```jsx
// frontend/src/components/Stage3Yoga.jsx
import { useEffect, useRef } from "react";
import { getSocket } from "../socket.js";

const VIDEO_ID = "v7AYKMP6rOE";

export default function Stage3Yoga({ me, state }) {
  const playerRef = useRef(null);
  const ready     = useRef(false);
  const suppress  = useRef(false);

  useEffect(() => {
    function init() {
      playerRef.current = new window.YT.Player("yt", {
        videoId: VIDEO_ID,
        height: "360",
        width:  "640",
        playerVars: { origin: window.location.origin, enablejsapi: 1 },
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 fade-in">
      <h2 className="font-display text-4xl text-dn-text mb-2">Couples Yoga</h2>
      <p className="text-dn-muted text-sm mb-8 tracking-wide">
        play/pause synced between you both
      </p>

      <div className="glass p-3 mb-6 w-full max-w-2xl overflow-hidden">
        <div id="yt" className="rounded-xl overflow-hidden" />
      </div>

      <button onClick={confirm} disabled={state.stage3[`${me.id}_done`]}
        className="px-8 py-3 rounded-pill bg-dn-rose-bright text-dn-bg font-bold disabled:opacity-50 hover:opacity-90 transition mb-3">
        We finished ✓
      </button>
      <p className="text-sm text-dn-muted">
        You {state.stage3[`${me.id}_done`] ? "✓" : "…"} · Partner: {state.stage3[`${partnerId}_done`] ? "✓" : "waiting…"}
      </p>
    </div>
  );
}
```

**Note:** The `theme.css` rule `#yt iframe { width: 100% !important; aspect-ratio: 16/9; height: auto !important; }` (added in Task 1) makes the YouTube iframe responsive inside the glass container.

- [ ] **Step 2: Verify**

Jump to `stage3`. Glass card wraps the YouTube iframe. Iframe fills container width responsively. Play/pause sync still works between two tabs.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Stage3Yoga.jsx
git commit -m "feat: Stage3Yoga — glass video container, responsive iframe, Stitch tokens"
```

---

## Task 11: Stage 4 — 100 Goals (Two-Column Web Layout)

**Files:**
- Modify: `frontend/src/components/Stage4Goals.jsx`

- [ ] **Step 1: Replace Stage4Goals.jsx**

```jsx
// frontend/src/components/Stage4Goals.jsx
import { useState } from "react";
import { getSocket } from "../socket.js";

function buildMarkdown(username, goals, date) {
  return `# My 100 Goals — ${username} — ${date}\n\n` +
    goals.map((g, i) => `${i + 1}. ${g}`).join("\n") + "\n";
}

export default function Stage4Goals({ me, state }) {
  const sock      = getSocket();
  const myGoals   = state.stage4.goals[me.id];
  const partnerId = me.id === "A" ? "B" : "A";
  const partnerGoals       = state.stage4.goals[partnerId];
  const partnerAllowsFewer = state.stage4.allowFewer[partnerId];
  const [draft, setDraft]  = useState("");
  const [editIdx, setEditIdx] = useState(null);

  const push     = (next) => sock?.emit("stage4:goals", { goals: next });
  const add      = () => { if (draft.trim()) { push([...myGoals, draft.trim()]); setDraft(""); } };
  const del      = (i) => push(myGoals.filter((_, x) => x !== i));
  const saveEdit = (i, val) => { push(myGoals.map((g, x) => x === i ? val : g)); setEditIdx(null); };
  const toggleAllow = (e) => sock?.emit("stage4:allowFewer", { value: e.target.checked });

  const canSubmit = myGoals.length > 0 && (partnerAllowsFewer || myGoals.length >= 100);
  const download  = () => {
    const date = new Date().toISOString().slice(0, 10);
    const blob = new Blob([buildMarkdown(me.name, myGoals, date)], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `100-goals-${me.id}.md`;
    a.click();
    sock?.emit("stage4:downloaded");
  };

  const myColor      = me.id === "A" ? "#ffb0cf" : "#cabeff";
  const partnerColor = me.id === "A" ? "#cabeff" : "#ffb0cf";

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto fade-in">
      <h2 className="font-display text-4xl text-dn-text my-6 text-center">100 Goals ✨</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* My goals column */}
        <div className="glass p-5" style={{ borderColor: `${myColor}30` }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: myColor }}>
              Your Goals
            </h3>
            <span className="text-xs text-dn-muted">{myGoals.length} / 100</span>
          </div>
          <div className="w-full rounded-full h-1.5 mb-4" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, myGoals.length)}%`, background: myColor }} />
          </div>

          <div className="flex flex-col gap-2 mb-4 max-h-80 overflow-y-auto pr-1">
            {myGoals.map((g, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-pill text-sm"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span className="text-xs flex-shrink-0" style={{ color: myColor }}>{i + 1}.</span>
                {editIdx === i
                  ? <input autoFocus defaultValue={g}
                      className="flex-1 bg-transparent outline-none text-dn-text text-sm"
                      onBlur={e => saveEdit(i, e.target.value)}
                      onKeyDown={e => e.key === "Enter" && saveEdit(i, e.target.value)} />
                  : <span className="flex-1 cursor-pointer text-dn-text" onClick={() => setEditIdx(i)}>{g}</span>}
                <button onClick={() => del(i)}
                  className="text-dn-muted hover:text-dn-rose text-xs ml-1 flex-shrink-0">✕</button>
              </div>
            ))}
          </div>

          <input
            className="glass-input text-sm"
            style={{ borderRadius: "1rem" }}
            placeholder="Type a goal, press Enter…"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
          />
        </div>

        {/* Partner goals column (read-only) */}
        <div className="glass p-5" style={{ borderColor: `${partnerColor}30` }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: partnerColor }}>
              Partner&apos;s Goals
            </h3>
            <span className="text-xs text-dn-muted">{partnerGoals.length} / 100</span>
          </div>
          <div className="w-full rounded-full h-1.5 mb-4" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, partnerGoals.length)}%`, background: partnerColor }} />
          </div>
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
            {partnerGoals.length === 0
              ? <p className="text-dn-muted text-sm text-center py-8">No goals yet…</p>
              : partnerGoals.map((g, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-pill text-sm"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span className="text-xs flex-shrink-0" style={{ color: partnerColor }}>{i + 1}.</span>
                    <span className="flex-1 text-dn-muted">{g}</span>
                  </div>
                ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button onClick={download} disabled={!canSubmit}
          className="px-8 py-3 rounded-pill bg-dn-rose-bright text-dn-bg font-bold disabled:opacity-50 hover:opacity-90 transition">
          Finish &amp; Download ⬇️
        </button>
        {state.stage4.downloaded[me.id] && (
          <p className="text-sm text-dn-rose">Downloaded. Waiting for partner…</p>
        )}
        <label className="flex items-center gap-2 text-xs text-dn-muted cursor-pointer">
          <input type="checkbox"
            checked={state.stage4.allowFewer[me.id]}
            onChange={toggleAllow}
            className="accent-dn-rose" />
          Allow partner to submit with fewer than 100
        </label>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Jump to `stage4`. Two glass columns side by side on desktop: left (rose-tinted border, my goals), right (violet-tinted border, partner goals). Progress bars fill with respective player color. Goal items as pill rows. Scrollable when goals list grows.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Stage4Goals.jsx
git commit -m "feat: Stage4Goals — two-column rose/violet layout, glass pill goal rows"
```

---

## Task 12: Celebration Screen

**Files:**
- Modify: `frontend/src/components/Celebration.jsx`

- [ ] **Step 1: Replace Celebration.jsx**

```jsx
// frontend/src/components/Celebration.jsx
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function Celebration({ state }) {
  useEffect(() => {
    const end = Date.now() + 4000;
    (function frame() {
      confetti({
        particleCount: 5,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#ffb0cf", "#cabeff", "#ffb951"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  const country = state.stage2.result?.country || "—";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 fade-in">
      <div className="text-8xl mb-6">💕</div>
      <h1 className="font-display text-5xl text-dn-rose mb-3">Date complete!</h1>
      <p className="text-dn-muted text-lg mb-10">See you next time 💞</p>
      <div className="glass-rose p-8 max-w-md w-full text-left">
        <h3 className="font-display text-xl text-dn-text mb-4">Tonight&apos;s recap</h3>
        <ul className="space-y-3 text-dn-muted">
          <li className="flex items-center gap-3">
            <span className="text-2xl">🎮</span>
            <span className="flex-1">Co-op game session</span>
            <span className="text-dn-amber">✓</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-2xl">🌍</span>
            <span className="flex-1">Next trip:</span>
            <span className="text-dn-rose">{country}</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-2xl">🧘</span>
            <span className="flex-1">Couples yoga</span>
            <span className="text-dn-amber">✓</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <span className="flex-1">100 goals set</span>
            <span className="text-dn-amber">✓</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Jump to `done`. Confetti fires in rose/violet/amber. Large Playfair heading. `glass-rose` recap card with amber checkmarks and rose country name.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Celebration.jsx
git commit -m "feat: Celebration — Stitch confetti colors, Playfair heading, glass-rose recap"
```

---

## Task 13: DevPanel + ReconnectOverlay

**Files:**
- Modify: `frontend/src/components/DevPanel.jsx`
- Modify: `frontend/src/components/ReconnectOverlay.jsx`

- [ ] **Step 1: Replace DevPanel.jsx**

```jsx
// frontend/src/components/DevPanel.jsx
import { getSocket } from "../socket.js";
import { useCountdown } from "../hooks/useCountdown.js";

const PHASES = ["waiting", "lobby", "stage1", "stage2", "stage3", "stage4", "done"];

export default function DevPanel({ state, me }) {
  const { label } = useCountdown();
  const skip = (phase) => getSocket()?.emit("dev:setPhase", { phase });

  return (
    <div className="fixed bottom-3 left-3 text-xs p-3 rounded-card z-50 w-56"
      style={{
        background: "rgba(10,10,40,0.92)",
        border: "1px solid rgba(255,176,207,0.2)",
        backdropFilter: "blur(8px)",
      }}>
      <div className="font-bold text-dn-rose mb-2 tracking-widest uppercase text-xs">
        DEV · {me.id}
      </div>
      <div className="text-dn-muted mb-0.5">
        phase: <span className="text-dn-text">{state.phase}</span>
      </div>
      <div className="text-dn-muted mb-0.5">
        A: <span className="text-dn-text">{String(state.presence.A.online)}</span>
      </div>
      <div className="text-dn-muted mb-0.5">
        B: <span className="text-dn-text">{String(state.presence.B.online)}</span>
      </div>
      <div className="text-dn-muted mb-2">
        t: <span className="text-dn-text">{label}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {PHASES.map(p => (
          <button key={p} onClick={() => skip(p)}
            className="px-1.5 py-0.5 rounded text-xs transition"
            style={{
              background: "rgba(255,176,207,0.12)",
              border: "1px solid rgba(255,176,207,0.2)",
              color: "#ffb0cf",
            }}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace ReconnectOverlay.jsx**

```jsx
// frontend/src/components/ReconnectOverlay.jsx
export default function ReconnectOverlay({ partnerName }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center"
      style={{ background: "rgba(10,10,46,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="glass p-10 max-w-sm w-full text-center"
        style={{ borderColor: "rgba(255,176,207,0.35)" }}>
        <div className="text-5xl mb-4 animate-spin">🔄</div>
        <p className="text-dn-text text-xl mb-2">{partnerName} disconnected</p>
        <p className="text-dn-rose text-sm">Your progress is safe.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Open `?dev=true`. DevPanel should appear bottom-left as a dark glass card with rose labels and phase skip buttons. Disconnect one user (close tab) — ReconnectOverlay should render as a glass modal with rose-tinted border over the blurred page.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/DevPanel.jsx frontend/src/components/ReconnectOverlay.jsx
git commit -m "feat: DevPanel + ReconnectOverlay — glass styling, Stitch tokens"
```

---

## Final Verification

- [ ] Run full flow as two users (`user_a` / `user_b` in two browsers)
- [ ] Check every screen: Login → WaitingRoom → Lobby → Stage1 → Stage2Quiz → Stage2TripPlanner → Stage2Result → Stage3 → Stage4 → Celebration
- [ ] Verify FloatingStatus visible on all screens, no stage badges
- [ ] Check responsive breakpoints: resize to 375px (mobile) and 1280px (desktop)
- [ ] Verify `backdrop-filter: blur` works in Chrome and Safari
- [ ] Run production build: `cd frontend && npm run build` — should complete with no errors

```bash
cd /Users/ruslan/Documents/digital-date/frontend && npm run build
```

Expected: `dist/` created, no TypeScript or module errors.
