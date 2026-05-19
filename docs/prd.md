# Vis — Product Requirements Document

**Domain:** vis.realestate

---

## Product Overview

A real estate market conditions dashboard that presents data in a stock market visual style. Serves buyers, agents, and investors through a single unified interface with no user type selection — each audience naturally finds the features relevant to them. All features accessible to all users.

---

## Branding

- **App name:** Vis
- **Domain:** vis.realestate
- **Tagline direction:** "See the market clearly" / "The market, visualized" / "Real estate, visible"
- **Visual identity:** Minimal, financial data aesthetic, HomePulse UI style (dark navy, clean cards, live green pulse indicator)

---

## Global Navigation Pages

1. Market Dashboard (Home)
2. Reports
3. Markets Map
4. Rates Center
5. Property Search
6. Settings / White Label

---

## Page 1: Market Dashboard

### Tier 1 — Live Ticker Bar

- Continuously scrolling across the full width of the screen
- **Data points:** 30yr fixed rate, 15yr fixed rate, 5/1 ARM, Fed funds rate, CPI YoY, MBA purchase index, median home price, active inventory, days on market, list-to-sale ratio
- Each item shows: label, current value, directional change, up/down arrow, color coded green (positive) / red (negative)
- **Vis Market Read** segment appears periodically — visually distinct (highlighted background, different weight, Vis logo mark before it)
  - Format: `"VIS MARKET READ: [plain language statement]"`
  - Examples: "Seller's market — rates elevated, supply tight" / "Market cooling — price reductions up 12%" / "Stable conditions — inventory growing, rates flat"
  - Updates based on currently selected geography — national by default, switches to local when a metro or ZIP is selected
  - V1: rule-based logic
  - V2: Claude AI API generates a daily plain language summary
  - V3: personalizes to user's saved market or ZIP code

### Tier 2 — Main Chart Area

- Default chart type: line graph
- Toggleable chart types: line, bar, candlestick
- Timeframe selector: 1W, 1M, 3M, 6M, 1Y, 5Y
- Overlay multiple data series on one chart (e.g. 30yr rate + median price)
- TradingView-style interaction: zoom, pan, scrub through time
- Crosshair cursor showing exact values at any point in time
- Timeline annotations for key events: Fed rate decisions, CPI prints, FOMC meetings
- Geography selector: National → State → Metro → ZIP code
- Chart updates Vis Market Read when geography changes

### Tier 3 — Market Snapshot Cards

- 4–6 cards below the main chart or in a sidebar
- Each card: metric name, current value, directional change, mini sparkline
- Clickable to expand into full chart view
- **Metrics:** 30yr rate, median price, inventory, days on market, list-to-sale ratio, price reductions

### Vis Market Score

- Proprietary composite score for any selected geography
- Combines: rate environment, inventory pressure, price momentum, days on market trend
- Displayed as a number + plain language label
- **Labels:** Hot / Seller's Market / Balanced / Cooling / Buyer's Market
- Visible on dashboard for currently selected geography

---

## Page 2: Reports

### View Reports

- List of all previously generated reports
- Filter by: report type, date, market, property address
- Inline preview before opening
- Status tags: Draft, Generated, Exported
- Sort by date, type, geography

### Run a Report — Two Report Types

#### Market Condition Report

- Select geography: national, state, metro, ZIP code
- Custom boundary drawing tool — draw a custom reporting boundary directly on the map
- Select timeframe
- **Drag and drop module builder** — pull data blocks onto a canvas, arrange in any order
- Available modules: Rate trends, Inventory levels, Price trajectory chart, Days on market, List-to-sale ratio, Neighborhood demographics, School ratings, Affordability index, Vis Market Score, Price forecast, AI market summary, Price reduction percentage, Pending home sales, New listings trend

#### Property Report

- Search by specific address
- Toggleable data blocks (each on/off individually):
  - Previous sale price and date
  - Vis estimated value (AVM) — v2 placeholder in v1
  - Price per square foot
  - Square footage, bedroom/bathroom count, lot size, year built
  - Key facts (HOA fees, tax history, flood zone)
  - Neighborhood comparable sales
  - Price history chart
  - Demographic data (median income, age distribution, household size)
  - Walk score, school ratings
  - AI summary of property and market context

### Export

- PDF export
- **White label** for agents: logo upload, brand color, agent name, brokerage name, license number, contact info — stamped at top of report
- One-click shareable link
- CSV export for raw data

---

## Page 3: Markets Map

- Interactive heat map of the United States
- Toggle color coding by metric: price growth, inventory, days on market, Vis Market Score, overvaluation, price reductions %
- Drill down: National → State → Metro → ZIP code
- **Custom boundary drawing tool** — freehand or polygon, name and save, run a report directly from the map
- Clicking any region loads a side panel with market snapshot + Vis Market Score
- Saved custom boundaries appear as named overlays on the map

---

## Page 4: Rates Center

- Current rates in large format: 30yr fixed, 15yr fixed, 5/1 ARM, jumbo, FHA
- Historical rate chart: 1Y, 5Y, 10Y, 25Y timeframes
- **Fed calendar:** upcoming FOMC dates, market rate expectations, past decisions annotated on chart
- **Rate vs price overlay chart:** rate movement vs median home price over time
- **Mortgage payment calculator:** input home price + down payment → monthly payment at current rates, updates live as rates change
- **Rate alert:** user sets a threshold, notified when 30yr rate crosses it

---

## Page 5: Property Search

- Search any US address
- Returns quick stat view without generating a full report
- Full property report available from this view
- Save any property to a personal watchlist
- Compare two properties side by side
- Price history chart per property
- Nearby comps shown on a mini map

---

## Page 6: Settings / White Label

### Branding

- Logo upload, brand color picker
- Agent name, brokerage name, license number, contact info
- Live preview of branded report
- Subscription tier management
- Notification preferences for alerts
- Saved custom map boundaries management
- Saved watchlist management

### Theme Selection

Three options:

| Theme | Background | Nav | Card | Border |
|-------|-----------|-----|------|--------|
| True Black | `#0a0a0a` | `#111111` | `#141414` | `#1f1f1f` |
| Charcoal | `#141416` | `#1c1c1f` | `#212124` | `#28282d` |
| Light | `#f4f4f4` | `#ffffff` | `#ffffff` | `#e5e5e5` |

- Default on first load: **Charcoal**
- Saved to `localStorage` under `'vis-theme'`
- Switches instantly with no page reload
- All colors via CSS variables — entire app repaints from one theme object
- Green `#00e87a` and red `#f0455a` constant across dark themes; light theme uses `#00c968` / `#e03a50`
- Theme selector shows live mini preview before selecting

---

## Cross-App Features

### Vis Market Score

- Available at every geography level: national, state, metro, ZIP, custom boundary
- Labels: Hot / Seller's Market / Balanced / Cooling / Buyer's Market
- Shown on dashboard, map, reports, property pages

### AI Market Summary

- One paragraph plain language summary for any geography or property
- Updates daily for markets, generated on demand for properties
- V1: Claude API with rule-based prompting
- V2: personalized to user's saved markets
- Accessible to all users

### Alerts System

- User-defined thresholds for any tracked metric
- Example triggers: rate drops below X, inventory in saved ZIP rises above X, DOM falls below X, Vis Market Score changes category
- Delivery: in-app notification + email

### Watchlist

- Save any market geography or property address
- Dashboard widget shows changes since last visit
- Quick access from any page

### Drawing Tool — Custom Reporting Boundaries

- Available on Markets Map and within Report builder
- Freehand and polygon drawing modes
- User names and saves boundaries
- Custom boundaries usable as a geography in any report
- Custom boundaries show their own Vis Market Score and market snapshot

---

## Data Sources

| Source | Data | Cost |
|--------|------|------|
| FRED API | Macro indicators, Fed funds rate, CPI, Treasury yields | Free |
| Freddie Mac PMMS | 30yr and 15yr fixed rates | Free (weekly) |
| MBA Weekly Applications Survey | Purchase demand index | Free with registration |
| Zillow Research / Redfin Data Center | Median price, inventory, days on market | Free downloads (monthly) |
| ATTOM Data | Property-level data for search and reports | Paid (v2) |
| Claude API | AI market summaries and plain language generation | Paid |

---

## Chart Library

- **TradingView Lightweight Charts** (open source, free) — all market charts
- **Mapbox or Google Maps API** — interactive heat map and boundary drawing

---

## Build Order

1. Market Dashboard UI with mock data — get layout and charts perfect
2. Connect live APIs — FRED, Freddie Mac, Redfin
3. Vis Market Read logic in ticker — rule-based v1
4. Vis Market Score algorithm
5. Reports tab — drag and drop market condition report first
6. Property report with toggleable blocks
7. White label and PDF export
8. Markets Map with heat map overlay
9. Custom boundary drawing tool
10. Rates Center
11. Property Search and watchlist
12. Alerts system
13. AI summaries via Claude API
14. AI-generated Vis Market Read v2

---

## Technical Notes

- **Responsive web app** — browser first, mobile optimized but not native
- All chart types share the same data layer — switching line/bar/candlestick is a presentation toggle, not a data refetch
- Vis Market Read in ticker subscribes to the geography state of the chart below it
- Custom boundary drawing tool outputs a GeoJSON polygon used as a filter on all data queries
- White label settings stored per agent account, applied at report generation time
- Property AVM (Vis estimated value) is a v2 feature — placeholder in v1
- Font: IBM Plex Sans / IBM Plex Mono

---

## Theme System

Implement from day one. Define all colors as CSS variables. Apply theme by setting each variable on `document.documentElement.style`. Zero hardcoded hex values in components.

```js
const themes = {
  charcoal: {
    '--bg':     '#141416',
    '--nav':    '#1c1c1f',
    '--card':   '#212124',
    '--border': '#28282d',
    '--text':   '#f5f5f5',
    '--muted':  '#666666',
    '--dim':    '#4a4a52',
    '--green':  '#00e87a',
    '--red':    '#f0455a',
  },
  black: {
    '--bg':     '#0a0a0a',
    '--nav':    '#111111',
    '--card':   '#141414',
    '--border': '#1f1f1f',
    '--text':   '#ffffff',
    '--muted':  '#555555',
    '--dim':    '#444444',
    '--green':  '#00e87a',
    '--red':    '#f0455a',
  },
  light: {
    '--bg':     '#f4f4f4',
    '--nav':    '#ffffff',
    '--card':   '#ffffff',
    '--border': '#e5e5e5',
    '--text':   '#111111',
    '--muted':  '#999999',
    '--dim':    '#bbbbbb',
    '--green':  '#00c968',
    '--red':    '#e03a50',
  },
}
```
