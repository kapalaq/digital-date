# Stitch Redesign: Synced Date Night Experience
**Date:** 2026-06-15  
**Status:** Approved  

## Overview

Full visual overhaul of the Date Night web app using the "Synced Date Night Experience" Stitch design system. Adopts Midnight Indigo dark glassmorphism palette, Playfair Display + Plus Jakarta Sans typography, and pill-shaped components. Mobile Stitch screens adapted to wide responsive web layout. All 9 app screens + 3 utility components redesigned. No stage progression hints exposed to users.

## Design Decisions

- **Color system:** Full Stitch dark glassmorphism (not current warm navy/rosegold palette)
- **Layout:** Wide responsive — content expands to ~960px max, grid layouts for cards, no centered mobile column
- **Web chrome:** No persistent nav bar or sidebar. Floating player status pips (top-right corner) on all screens except Login. No stage badge — mystery preserved.
- **Implementation approach:** Token-first sweep — update tailwind.config once, add glassmorphism CSS utilities, sweep all components.

## Design Tokens

### tailwind.config.js — replace current 4-color palette

```js
colors: {
  'dn-bg':         '#10102e',  // page background (Midnight Indigo)
  'dn-surface':    '#1c1c3b',  // card bg
  'dn-surface-lo': '#181836',  // subtler surface
  'dn-surface-hi': '#272746',  // elevated card
  'dn-surface-top':'#323251',  // highest elevation
  'dn-rose':       '#ffb0cf',  // primary / Player A color
  'dn-rose-bright':'#ff7eb9',  // CTA buttons / active states
  'dn-violet':     '#cabeff',  // secondary / Player B color
  'dn-amber':      '#ffb951',  // highlights, rewards, connection points
  'dn-text':       '#e2dfff',  // primary body text
  'dn-muted':      '#dac0c8',  // secondary / placeholder text
  'dn-outline':    '#a28b92',  // borders on non-glass elements
}
```

Also extend `borderRadius`: `pill: '9999px'`, `card: '1.5rem'`, `card-lg: '2rem'`  
Extend `fontFamily`: `display: ['Playfair Display', 'serif']`, `sans: ['Plus Jakarta Sans', 'sans-serif']`

### theme.css — glassmorphism utilities

```css
/* Base glass card */
.glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 1.5rem;
}

/* Rose-tinted glass (Player A / CTA) */
.glass-rose {
  background: rgba(255, 176, 207, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 176, 207, 0.25);
  border-radius: 1.5rem;
}
.glass-rose:hover, .glass-rose:focus-within {
  border-color: rgba(255, 176, 207, 0.5);
  box-shadow: 0 0 20px rgba(255, 176, 207, 0.15);
}

/* Violet-tinted glass (Player B) */
.glass-violet {
  background: rgba(202, 190, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(202, 190, 255, 0.25);
  border-radius: 1.5rem;
}

/* Hollow pill input */
.glass-input {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  color: #e2dfff;
  padding: 0.6rem 1.2rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.glass-input:focus {
  border-color: rgba(255, 176, 207, 0.6);
  box-shadow: 0 0 0 3px rgba(255, 176, 207, 0.1);
}
.glass-input::placeholder { color: #a28b92; }

/* Page background radial gradient */
.dn-bg {
  background: radial-gradient(ellipse at 30% 20%, #1a0a35 0%, #10102e 60%);
  min-height: 100vh;
}
```

### index.html — Google Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
```

## New Component: FloatingStatus

**File:** `frontend/src/components/FloatingStatus.jsx`  
**Props:** `{ me, state }` (same props pattern as all other components)  
**Renders:** Fixed top-right corner. Two pill badges:
- Rose pip: Player A name + pulsing dot (green when `state.online.A`, gray when not)  
- Violet pip: Player B name + pulsing dot  

No stage label. No next-step hints. Badge fades to 60% opacity when partner is offline.

Mounted in `App.jsx` alongside the current screen component (not inside screens themselves).

## Screen-by-Screen Layout

### Login
- Full-bleed `dn-bg` radial gradient
- Centered `glass` card, max-w `sm` (24rem)
- "Date Night" in `font-display` heading above card
- `glass-input` pill fields (username, password)
- Rose pill CTA button (`bg-dn-rose-bright text-indigo-950 font-bold rounded-pill`)
- Error text in `text-red-300`

### WaitingRoom
- Full-bleed `dn-bg`
- Centered vertically, pulsing heart icon (`text-dn-rose`)
- Partner name in `font-display`
- Countdown in `text-dn-amber` 
- FloatingStatus in corner

### Lobby
- Full-bleed `dn-bg`
- Avatar arena: `max-w-2xl mx-auto`, avatars larger (text-8xl)
- Throw buttons: `glass-rose` pill buttons with emoji
- Dodge: pill outline button `border-dn-rose/60`
- Begin button: rose CTA, full-pill
- Hit effects + Projectiles unchanged functionally

### Stage1Cards (Game Selection)
- `max-w-3xl mx-auto`
- 2-column card grid on desktop (`grid-cols-2 gap-4`), 1-col on mobile
- Each card: `glass-rose` with hover glow, Playfair title, body text
- Selected card: `border-dn-rose` with inner glow
- Both-ready indicator: amber pulse

### Stage2Quiz (Travel Quiz)
- `max-w-2xl mx-auto`
- Question in `font-display text-2xl`
- Answer grid: `grid-cols-2 gap-3`
- Dual sync progress bars: rose fills left→right (Player A), violet fills right→left (Player B). Intersection glows amber.
- Answer option: `glass` card, selected: `glass-rose`

### Stage2TripPlanner (web-native, not in Stitch)
- `max-w-2xl mx-auto glass` container
- Playfair heading "Plan Your Trip"
- `glass-input` fields for destination, dates, notes
- Rose CTA submit button
- Partner "waiting" state shows violet pulsing dot

### Stage2Result (Trip Results)
- `max-w-2xl mx-auto`
- `glass-rose` hero card with trip summary
- Amber accent for key details
- Both-confirmed CTA to advance

### Stage3Yoga (Synced Yoga)
- `max-w-3xl mx-auto`
- Large pose illustration/emoji centered
- Pose name in `font-display`
- Sync progress bar prominent below (rose + violet dual-fill)
- Step counter subtle, no stage number

### Stage4Goals (100 Goals)
- `max-w-4xl mx-auto`
- Two-column layout: rose column (Player A goals) | violet column (Player B goals)
- Each goal: `glass` pill row with checkbox
- Shared goals glow amber when both check
- Input at bottom of each column: `glass-input`

### Celebration
- Full-bleed `dn-bg`
- Large `font-display` heading centered
- Particles/confetti in rose + violet + amber
- Subtle ambient glow animation on background

### DevPanel (utility, styled not restructured)
- `glass` overlay, fixed bottom-left
- `text-dn-muted text-xs`
- Skip buttons: `glass` small pills

### ReconnectOverlay (utility)
- Full-screen semi-transparent indigo overlay
- Centered `glass` modal, rose border
- Pulsing reconnect indicator

## Functionality Gaps Covered

Features in app but absent from Stitch screens — all get full token treatment:

| Feature | Treatment |
|---|---|
| Lobby throw/dodge minigame | Re-skinned with new tokens, same logic |
| Stage2TripPlanner | Web-native glass form design (see above) |
| Stage2Result | Adapted from Stitch "Trip Results" screen |
| DevPanel | Glass overlay, same functionality |
| ReconnectOverlay | Glass modal |
| FloatingStatus | New component, replaces no equivalent |

## Implementation Order

1. `tailwind.config.js` — replace color tokens, add radius + font families
2. `index.html` — add Google Fonts
3. `theme.css` — add glassmorphism utilities, `dn-bg` gradient, remove old custom properties
4. `FloatingStatus.jsx` — new component
5. `App.jsx` — mount FloatingStatus, apply `dn-bg` to root
6. `Login.jsx`
7. `WaitingRoom.jsx`
8. `Lobby.jsx`
9. `Stage1Cards.jsx`
10. `Stage2Quiz.jsx`
11. `Stage2TripPlanner.jsx`
12. `Stage2Result.jsx`
13. `Stage3Yoga.jsx`
14. `Stage4Goals.jsx`
15. `Celebration.jsx`
16. `DevPanel.jsx`
17. `ReconnectOverlay.jsx`

## Success Criteria

- All screens use Midnight Indigo bg, glassmorphism cards, rose/violet/amber palette
- Playfair Display for all headings, Plus Jakarta Sans for UI text
- No stage progression hints visible to users
- FloatingStatus shows both player online states on all screens
- Wide responsive layout — grid expands on desktop, readable on mobile
- All existing functionality preserved (socket events, game logic, dev panel)
- `backdrop-filter: blur` working in Chrome/Safari/Firefox
