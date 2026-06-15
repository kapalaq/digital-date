# Stitch Redesign + Private Goals — Design Spec
**Date:** 2026-06-15
**Status:** Approved

## Overview

Full frontend redesign of the digital-date app to match exported Stitch designs (`stitch_designs/`), plus a new private goals tab in Stage 4. Token system migrated directly from Stitch HTML exports (ground truth). All 9 screens + private goals feature.

---

## 1. Token System

### Approach
Full Stitch token migration. Stitch tokens replace all existing `dn-*` custom tokens in `tailwind.config.js`. Existing `dn-*` aliases kept temporarily (pointing to new tokens) so un-migrated components don't break mid-migration.

### `tailwind.config.js`

**Colors** (identical across all 9 Stitch HTML exports):
```js
"primary": "#ffb0cf",
"secondary": "#cabeff",
"tertiary": "#ffb951",
"background": "#10102e",
"surface": "#10102e",
"surface-dim": "#10102e",
"surface-container-lowest": "#0a0a28",
"surface-container-low": "#181836",
"surface-container": "#1c1c3b",
"surface-container-high": "#272746",
"surface-container-highest": "#323251",
"surface-bright": "#363656",
"surface-variant": "#323251",
"surface-tint": "#ffb0cf",
"on-surface": "#e2dfff",
"on-surface-variant": "#dac0c8",
"on-background": "#e2dfff",
"on-primary": "#63003c",
"on-primary-container": "#780d4a",
"on-primary-fixed": "#3d0023",
"on-primary-fixed-variant": "#841954",
"on-secondary": "#31009a",
"on-secondary-fixed": "#1c0062",
"on-secondary-container": "#bcaeff",
"on-secondary-fixed-variant": "#4717ca",
"on-tertiary": "#452b00",
"on-tertiary-container": "#573700",
"on-tertiary-fixed": "#291800",
"on-tertiary-fixed-variant": "#633f00",
"primary-container": "#ff7eb9",
"primary-fixed": "#ffd9e5",
"primary-fixed-dim": "#ffb0cf",
"secondary-container": "#4a1ccc",
"secondary-fixed": "#e6deff",
"secondary-fixed-dim": "#cabeff",
"tertiary-container": "#df9c33",
"tertiary-fixed": "#ffddb3",
"tertiary-fixed-dim": "#ffb951",
"error": "#ffb4ab",
"error-container": "#93000a",
"on-error": "#690005",
"on-error-container": "#ffdad6",
"outline": "#a28b92",
"outline-variant": "#554248",
"inverse-surface": "#e2dfff",
"inverse-on-surface": "#2d2d4d",
"inverse-primary": "#a3346c",
```

**Spacing** (replaces Tailwind defaults):
```js
xs: "4px", base: "8px", sm: "12px", gutter: "16px",
"safe-margin": "20px", md: "24px", lg: "40px", xl: "64px"
```

**Border radius:**
```js
DEFAULT: "1rem", lg: "2rem", xl: "3rem", full: "9999px"
```

**Font families:**
```js
"display-lg": ["Playfair Display"],
"display-lg-mobile": ["Playfair Display"],
"headline-md": ["Playfair Display"],
"headline-md-mobile": ["Playfair Display"],
"title-sm": ["Plus Jakarta Sans"],
"body-md": ["Plus Jakarta Sans"],
"label-caps": ["Plus Jakarta Sans"],
```

**Font sizes:**
```js
"display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
"display-lg-mobile": ["36px", { lineHeight: "1.2", fontWeight: "700" }],
"headline-md": ["32px", { lineHeight: "1.3", fontWeight: "600" }],
"headline-md-mobile": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
"title-sm": ["20px", { lineHeight: "1.4", fontWeight: "600" }],
"body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
"label-caps": ["12px", { lineHeight: "1", letterSpacing: "0.1em", fontWeight: "700" }],
```

### `theme.css`
Keep existing `.glass`, `.glass-rose`, `.glass-violet`, `.glass-input`, `.glass-textarea` (they already match Stitch glassmorphism values).

Add:
- `.glass-card` alias = same as `.glass` (Stitch uses this class name)
- `.glass-panel` alias = same as `.glass`
- `.glow-primary` / `.glow-secondary` box-shadow utilities
- Animations: `pulse-ring`, `heart-beat`, `bg-stars` + `twinkle`, `float`, `float-delayed`, `animate-pip-pulse`, `goal-chip` hover lift, `flip-card` 3D CSS (`perspective`, `rotateY`)
- Keep existing: `fly-right`, `fly-left`, `splat`, `arrow` (Lobby projectiles)

### `index.html`
Add Material Symbols Outlined font:
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
```

---

## 2. Shared Shell (every screen)

1. **Ambient background** — two fixed blurred blobs, `pointer-events-none z-0`:
   - Top-left: `w-[50%] h-[50%] bg-primary/10 blur-[100px]`
   - Bottom-right: `w-[60%] h-[60%] bg-secondary/10 blur-[120px]`
2. **Fixed top header** — `bg-surface/80 backdrop-blur-xl border-b border-white/15 shadow-[0_0_20px_rgba(255,176,207,0.2)] h-16 max-w-[600px] mx-auto px-safe-margin` — "Date Night" in `font-headline-md-mobile text-primary`
3. **Material Symbols Outlined** icons replace emoji/text throughout
4. **Max width**: `max-w-[600px] mx-auto` content column

---

## 3. Screen Redesigns

### `Login.jsx` → `login.html`
- No top header, centered layout
- "Date Night" in `font-display-lg-mobile text-primary` with rose glow drop-shadow
- Glass inputs (`.glass-input`) for username/password
- CTA: `bg-primary text-on-primary rounded-full` pill with rose shadow

### `WaitingRoom.jsx` → `waiting_room.html`
- Stars bg: CSS `bg-stars` radial-gradient dots pattern + `animate-twinkle` opacity pulse
- Gradient overlay: `bg-gradient-to-b from-surface/80 via-surface-container/50 to-surface-container-low/90`
- "Date Night" `font-display-lg-mobile text-primary` + subtitle
- Pulsing heart: 3 concentric `pulse-ring` divs (border-primary at 30/20/10% opacity) + center glass card with filled `favorite` icon + `heart-beat` animation
- Two status glass cards: "You" (green pip, `check_circle` bounce) + "Partner" (yellow pip, bouncing dots)
- Countdown display + "Cancel Evening" full-width glass pill button

### `Lobby.jsx` → `lobby.html`
- Fixed top header
- Avatar arena: `glass-panel rounded-xl h-64 relative overflow-hidden` with float/float-delayed animations on avatars
- `compare_arrows` icon center
- Warmup actions: 3 emoji buttons (`❤️ 🍰 ✨`) in glass pills — existing projectile emit logic unchanged
- Dodge: full-width secondary glass pill with `shield` icon
- Start button: locked (`surface-container-highest cursor-not-allowed lock` icon) → unlocked (`bg-gradient-to-r from-primary to-secondary text-on-primary play_arrow`) when both online

### `Stage1Cards.jsx` → `game_selection.html`
- Stage badge: `inline-block px-3 py-1 bg-surface-bright border border-white/10 rounded-full text-secondary font-label-caps` "STAGE 1"
- "Pick a Card" `font-display-lg-mobile text-primary-fixed` with rose glow
- `grid grid-cols-1 md:grid-cols-3 gap-md` of 3 flip cards, `h-[220px] md:h-[280px]`
- **Front face**: glass card, SVG dot pattern overlay, large filled icon (primary/secondary/tertiary at 30% opacity)
- **Back face**: glass card with colored border, icon badge, title `font-title-sm`, description, "Select" `bg-{color} rounded-full font-label-caps` pill button
- 3D flip: CSS `perspective`, `rotateY(180deg)` toggle on click via `flipped` class
- Player status pill row at bottom

### `Stage2Quiz.jsx` → `travel_quiz.html`
- Fixed header with back `arrow_back` icon + "Date Night" + avatar circle
- Dual progress bar: player 1 fills left (`bg-gradient-to-r from-primary-container to-primary`), player 2 fills right (`bg-gradient-to-l from-secondary-container to-secondary`), connection glow at meeting point
- Quiz glass card: `glass-card rounded-lg p-md`, large icon badge, `font-display-lg-mobile` question text
- Options: full-width pill buttons (`surface-container-low`, `border border-white/15`, hover `border-primary/50`) with `check` icon right
- Player status row: avatar + name + ready pip both sides

### `Stage2Result.jsx` / `Stage2TripPlanner.jsx` → `travel_results.html`
- Fixed header
- Ambient bg
- Match `travel_results.html` layout faithfully (read exact HTML before implementing)

### `Stage3Yoga.jsx` → `yoga.html`
- Fixed header "Stage 3"
- Inline label pill: `glass-panel bg-primary/10 text-primary font-label-caps` + `self_improvement` icon
- "Find Your Center" `font-display-lg-mobile`
- Video bento: `aspect-video rounded-xl glass-panel`, play button overlay, "IN SYNC" pip badge top-right with rose/violet dots
- Connection status card: YOU ←gradient line (primary→tertiary→secondary)→ PARTNER
- Mood tag pills: secondary/10 bg
- Fixed bottom: "BOTH PLAYERS MUST TAP" `font-label-caps` + "We Finished" glass pill with `check_circle` icon + hold-progress fill overlay

### `Stage4Goals.jsx` → `hundred_goals.html` + private tabs (see Section 4)

### `Celebration.jsx` → `celebration.html`
- No top header (end-of-flow)
- JS particle system: floating glowing dots in primary/secondary/tertiary, 4-12px, `float-up` animation
- `auto_awesome` filled icon badge with rose shadow
- "What a Night" in `font-display-lg-mobile text-transparent bg-clip-text bg-gradient-to-r from-primary via-tertiary to-secondary`
- 2×2 stats bento grid (glass panels): Game Played, Destination, Yoga Completed, Goals Met (circular SVG progress)
- "Goodnight ♥" `bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full` full-width CTA

---

## 4. Private Goals Feature (Stage 4)

### Tab bar
Replaces "Your Goals" column header. Two pill tabs:
```
[ Shared Goals (12) ]  [ Private 🔒 (3) ]
```
- Active: `bg-primary/20 border-primary/50 text-primary`
- Inactive: `bg-white/5 border-white/10 text-on-surface-variant`

### State
```js
const [activeTab, setActiveTab] = useState("shared");

const [privateGoals, setPrivateGoals] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem(`privateGoals-${me.id}`)) || [];
  } catch {
    return [];
  }
});

useEffect(() => {
  localStorage.setItem(`privateGoals-${me.id}`, JSON.stringify(privateGoals));
}, [privateGoals, me.id]);
```

### Shared tab
Existing list unchanged: share checkboxes, progress bar, `stage4:goals` / `stage4:sharedGoals` socket events.

### Private tab
Same list component. Differences:
- No share checkbox
- Accent color: `tertiary` (`#ffb951`)
- No count shown to partner
- Add / edit / delete same UX as shared tab

### Download markdown
```markdown
# My Goals — Username — 2026-01-01

## Shared Goals
1. Travel to Japan
2. Learn pottery

## Private Goals
1. Secret dream
2. Personal ambition
```
Private section omitted if empty.

### Security
Private goals never leave the client. No socket events. `localStorage` key `privateGoals-{me.id}` scoped per user.

---

## 5. Files Changed

| File | Change |
|------|--------|
| `frontend/index.html` | Add Material Symbols font link |
| `frontend/tailwind.config.js` | Full Stitch token migration, remove old dn-* tokens after migration |
| `frontend/src/theme.css` | Add glass aliases, animations, keep existing glass utilities |
| `frontend/src/components/Login.jsx` | Stitch redesign |
| `frontend/src/components/WaitingRoom.jsx` | Stitch redesign |
| `frontend/src/components/Lobby.jsx` | Stitch redesign |
| `frontend/src/components/Stage1Cards.jsx` | Flip card redesign |
| `frontend/src/components/Stage2Quiz.jsx` | Stitch redesign |
| `frontend/src/components/Stage2Result.jsx` | Stitch redesign |
| `frontend/src/components/Stage2TripPlanner.jsx` | Stitch redesign |
| `frontend/src/components/Stage3Yoga.jsx` | Stitch redesign |
| `frontend/src/components/Stage4Goals.jsx` | Stitch redesign + private goals tabs |
| `frontend/src/components/Celebration.jsx` | Stitch redesign + particle system |

## 6. Out of Scope

- Backend changes (private goals are client-only)
- `logo.html` (not a routed screen)
- Bottom nav / side nav from Lobby Stitch design (not in current app architecture)
- `DevPanel.jsx`, `ReconnectOverlay.jsx`, `FloatingStatus.jsx` (utility components, light token update only)
