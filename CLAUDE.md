# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Vis** — a real estate market conditions dashboard with a stock-market visual style. Domain: `vis.realestate`. Financial dark aesthetic (HomePulse UI). All features accessible to all users — no user type gating. Full PRD at `docs/prd.md`.

## Commands

```bash
npm run dev      # Vite dev server at localhost:5173
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint
```

## Build Order

1. Market Dashboard UI with mock data ← current focus
2. Connect live APIs (FRED, Freddie Mac, Redfin)
3. Vis Market Read rule-based logic
4. Vis Market Score algorithm
5. Reports — drag-and-drop market condition report
6. Property report with toggleable blocks
7. White label and PDF export
8. Markets Map heat map
9. Custom boundary drawing tool
10. Rates Center
11. Property Search and watchlist
12. Alerts system
13. AI summaries via Claude API
14. AI Vis Market Read v2

## Architecture

**Stack**: React 19, Vite, `react-router-dom`, TradingView Lightweight Charts, Mapbox (maps), IBM Plex font

**Pages** (React Router):
- `/` — Market Dashboard (ticker + main chart + snapshot cards + Vis Market Score)
- `/reports` — View, run, and export reports
- `/map` — Markets Map (heat map + boundary drawing)
- `/rates` — Rates Center
- `/search` — Property Search
- `/settings` — Settings / White Label

**Theme System** — implemented from day one. All colors are CSS variables on `:root`. Three themes in `src/theme.js`. Theme key saved to `localStorage` under `'vis-theme'`. Default: `'charcoal'`. Applied by setting each variable on `document.documentElement.style`. **Zero hardcoded hex values in any component.**

```js
// src/theme.js
const themes = {
  charcoal: { '--bg': '#141416', '--nav': '#1c1c1f', '--card': '#212124', '--border': '#28282d', '--text': '#f5f5f5', '--muted': '#666666', '--dim': '#4a4a52', '--green': '#00e87a', '--red': '#f0455a' },
  black:    { '--bg': '#0a0a0a', '--nav': '#111111', '--card': '#141414', '--border': '#1f1f1f', '--text': '#ffffff',  '--muted': '#555555', '--dim': '#444444',  '--green': '#00e87a', '--red': '#f0455a' },
  light:    { '--bg': '#f4f4f4', '--nav': '#ffffff',  '--card': '#ffffff',  '--border': '#e5e5e5', '--text': '#111111', '--muted': '#999999', '--dim': '#bbbbbb',  '--green': '#00c968', '--red': '#e03a50' },
}
```

**Data Layer**: All chart types (line, bar, candlestick) share one data source — switching type is a presentation toggle, not a re-fetch. Geography state is global; the Vis Market Read ticker subscribes to it.

**Key Cross-App Concepts**:
- **Vis Market Score**: Composite index (rate env + inventory pressure + price momentum + DOM trend). Labels: Hot / Seller's Market / Balanced / Cooling / Buyer's Market. Available at every geography level.
- **Vis Market Read**: Scrolling ticker segment — plain language market statement. V1: rule-based. V2: Claude API.
- **Custom Boundaries**: GeoJSON polygons drawn on map/report builder, used as geography filter across all data queries.
- **White Label**: Per-agent branding applied at report generation time.

**Data Sources**:
- FRED API — macro indicators, Fed funds rate, CPI, yields (free)
- Freddie Mac PMMS — 30yr/15yr fixed (free, weekly)
- MBA Weekly Applications Survey — purchase demand index (free)
- Zillow Research / Redfin Data Center — median price, inventory, DOM (free)
- ATTOM Data — property-level data (paid, v2)
- Claude API — AI summaries (v2+)

**Chart Library**: TradingView Lightweight Charts — all market charts.
**Map Library**: Mapbox or Google Maps API — heat map + boundary drawing.
**Font**: IBM Plex Sans / IBM Plex Mono.
