# CLAUDE.md — Vis App Project Intelligence

Read automatically by Claude Code at the start of every session.
Follow every instruction here precisely. Do not deviate unless the user
explicitly tells you to in the session.

---

## WHAT THIS PRODUCT IS

Vis (vis.realestate) is a chat-first AI real estate tool. A user — a home
buyer, seller, agent, or brokerage — opens the app and types anything they
want to know about a property, neighborhood, market, or their buying
situation. The AI searches the web for current public information and
responds conversationally. When a response has enough data to be useful as
a report, a "Generate Full Report" button appears inline. The user can keep
chatting or expand any response into a full formatted report.

Think ChatGPT for real estate — but with a real estate specific AI, web
scraping for live data, structured reports, branding, a loan calculator,
and three subscription tiers.

Core loop:
  Open chat -> type anything -> AI searches web and responds ->
  quick answers in chat -> expand into full report -> save / share / export

DO NOT scope creep into a full market dashboard with tickers and live
charting. This product is a chat interface plus AI-generated reports.
Keep everything focused on that.

---

## THREE SUBSCRIPTION TIERS

Same app, same features, same AI for all three. Only branding, usage
limits, and saved-item caps differ. Tier is set by the plan the user pays
for and stored in localStorage under key: vis-tier.

Tier 1 — Buyer/Seller (normal people mode)
- Full chat, property reports, market reports, loan calculator
- Capped saved sessions (10) and saved reports (10)
- Capped monthly usage
- No white label — reports show Vis branding only

Tier 2 — Agent mode
- Everything in Buyer/Seller
- White label: agent logo, name, brokerage, license, contact
- Brand color picker
- Unlimited saved sessions and reports
- Higher usage limits
- Send to Client button
- Reports show agent branding, small "Powered by Vis" footer

Tier 3 — Enterprise (brokerage mode)
- Same as Agent but brokerage-level branding instead of individual
- Highest usage limits
- Priority AI response speed
- Brokerage-level billing

Feature gates check vis-tier before rendering tier-specific UI.

---

## TECH STACK

- React with Vite
- Tailwind CSS
- Claude API with web search tool enabled — the entire data and
  intelligence layer. Model: claude-opus-4-7 (use Opus unless told
  otherwise in a specific session). Max tokens 1500.
- Google Fonts: DM Sans (text), IBM Plex Mono (numbers and data)
- Vercel — deployment
- GitHub — version control
- localStorage — sessions, reports, settings, theme, tier
- html2canvas + jsPDF — PDF export

NO MLS API. NO ATTOM. NO Zillow API. NO paid data subscriptions.
Do not add libraries without asking the user first.

---

## FILE STRUCTURE

Maintain this structure. Do not reorganize without asking.

```
vis-app/
  public/
  src/
    components/
      Nav.jsx
      ChatThread.jsx
      ChatMessage.jsx
      ChatInput.jsx
      DataCard.jsx
      SuggestedPrompts.jsx
      TypingIndicator.jsx
      GenerateReportButton.jsx
      SessionSidebar.jsx
      PropertyReport.jsx
      MarketReport.jsx
      PropertyFacts.jsx
      MarketConditions.jsx
      VisScore.jsx
      LoanCalculator.jsx
      AISummary.jsx
      UserEditLayer.jsx
      WhiteLabelHeader.jsx
      ShareExport.jsx
      ThemeSwitcher.jsx
      SubscriptionGate.jsx
      TierBadge.jsx
    pages/
      Chat.jsx
      Reports.jsx
      Saved.jsx
      Settings.jsx
    data/
      mockData.js
    utils/
      claudeApi.js
      formatters.js
      loanMath.js
    theme.js
    App.jsx
    index.css
  index.html
  CLAUDE.md
```

---

## DESIGN SYSTEM — FOLLOW EXACTLY EVERY SESSION

### Colors — CSS variables only. Never hardcode hex in components.

```css
/* Charcoal theme (default) */
--bg:       #111111   /* primary background */
--card:     #3D3D3D   /* cards, surfaces, message bubbles */
--border:   #3D3D3D   /* borders (slightly lighten on hover) */
--muted:    #888888   /* muted text, labels */
--text:     #D8D8D8   /* primary text */
--white:    #FFFFFF   /* headings, key values */
--accent:   #DA6B3A   /* burnt orange — primary accent */

/* True Black theme */
--bg:       #000000
--card:     #1a1a1a
--border:   #2a2a2a
--muted:    #777777
--text:     #e8e8e8
--white:    #FFFFFF
--accent:   #DA6B3A

/* Light theme */
--bg:       #F4F4F2
--card:     #FFFFFF
--border:   #D8D8D8
--muted:    #888888
--text:     #111111
--white:    #111111
--accent:   #C05A2A   /* darker orange for contrast on white */
```

Theme applied by setting CSS variables on document.documentElement.
Default: Charcoal. Saved to localStorage key: vis-theme.
Read and apply saved theme before first render.

### Typography — strict

- DM Sans: ALL labels, body text, buttons, nav, chat messages, summaries
- IBM Plex Mono: ALL numbers, data values, percentages, dollar amounts,
  scores, dates in data context
- No exceptions. Numbers always mono. Words always DM Sans.
- DM Sans weights: 400, 700, 800 for hero values
- IBM Plex Mono weights: 400, 700

### Visual rules

- Background always var(--bg)
- Cards: var(--card) background, 1px solid var(--border), radius 12px
- No drop shadows. Borders only.
- Primary buttons: var(--accent) background, white text, 700 weight
- Secondary buttons: var(--card) background, 1px solid var(--border)
- Radius: 12px cards, 8px buttons and inputs, 20px pills
- All transitions: 0.15s ease
- Generous spacing, never crowd elements
- Custom scrollbar: 6px, var(--bg) track, var(--border) thumb
- Global reset: box-sizing border-box, no default margin or padding

### Accent usage — var(--accent) burnt orange

Used for: logo mark background, active nav tab underline, primary buttons,
Vis Score circle and label, user message bubbles, send button, Generate
Full Report button, key totals (monthly payment), tier badge.

Never overuse it. It is the single brand color. Everything else is the
grey scale.

---

## BRANDING

- App name: Vis
- Domain: vis.realestate
- Tagline: "See the market clearly"
- Logo mark: 28x28px square, radius 8px, var(--accent) bg, white "V"
  inside, IBM Plex Mono bold 13px
- Wordmark: "vis" DM Sans 800, then ".realestate" IBM Plex Mono 10px muted

---

## NAVIGATION

Four items: Chat (home), Reports, Saved, Settings
Plus a tier badge pill showing Buyer / Agent / Enterprise
Active tab: var(--text), 2px solid var(--accent) bottom border
Inactive: var(--muted)
Nav height 48px, var(--bg) background, 1px solid var(--border) bottom

---

## CHAT EXPERIENCE — THE HOME SCREEN

Clean chat interface. No forms. Logo and tagline above input on a new chat.

Message types in the thread:
- User message: right-aligned, var(--accent) background, white text,
  radius 10px 0 10px 10px
- AI message: left-aligned, var(--card) background, var(--text) text,
  radius 0 10px 10px 10px, with orange V logo avatar to the left
- Inline data card: renders inside an AI message, var(--bg) background,
  1px var(--border), shows structured property or market data
- Generate Full Report button: var(--accent), full width, appears below
  AI responses that contain reportable data
- Typing indicator: three dots animating while Claude thinks

Suggested prompt chips on a new chat (clickable, pre-fill the input):
  Look up a property / Check market conditions / Calculate my affordability
  / Compare two markets / Ask anything about real estate

Input bar fixed to bottom of chat area:
  var(--card) background, var(--bg) input field, var(--accent) send button

Chat sessions:
- Each conversation auto-saved as a named session
- AI names the session from the first topic
- Browsable in a sidebar (desktop) or menu (mobile), reopenable
- Stored in localStorage key: vis-sessions
- Each session stores full message history and any generated reports
- The AI remembers the full session for follow-up questions

---

## REPORTS

Generated from chat via Generate Full Report, or directly from two default
templates in the nav. Reports open in a full view over the chat with a
back button.

### Property Report sections (in order)

1. White label header (branding per tier)
2. Property header — address, city/state/zip, key stats row
   (beds, baths, sqft, lot, year built, listing status)
3. Vis Property Score — 0-100 circle, label
   (Great Buy / Good Value / Fair / Overpriced / Avoid), one-sentence
   explanation, color: accent for great/good, a warning tone for fair,
   muted-red for overpriced/avoid
4. Property facts block — prev sale price + date, estimated value,
   price/sqft, annual tax, HOA, flood zone, walk score, school rating +
   name, lot size, garage. Unknown values show "—" not errors.
5. User edit layer — before finalizing, user reviews the data Claude
   gathered, can add/correct/annotate any field. User additions labeled
   "added by user".
6. Area market conditions — median price, days on market, active listings,
   list-to-sale ratio, price reductions, avg price/sqft
7. Loan calculator (see below)
8. AI property summary — 2-3 plain language paragraphs
9. Share / export / save bar
10. Send to Client button (Agent + Enterprise only)

### Market Conditions Report sections (in order)

1. White label header
2. Area header — location, report date
3. Vis Market Score — 0-100, label
   (Hot / Seller's Market / Balanced / Cooling / Buyer's Market)
4. Market metrics grid — median price, DOM, inventory, list-to-sale,
   price reductions, price/sqft, all with directional change
5. Rate context — current 30yr rate, recent trend, next Fed meeting,
   plain language rate impact summary
6. AI market summary — 2 plain language paragraphs
7. Share / export / save bar

---

## LOAN CALCULATOR

Lives in the Property Report and can be invoked in chat.

Inputs:
- Purchase price (pre-filled from estimate, editable)
- Down payment (toggle: dollar amount or percentage)
- Loan term (30yr / 15yr / 5-1 ARM)
- Interest rate (pre-filled with current rate, editable)
- Credit score range (optional)
- Toggle: include taxes and insurance in monthly total
- Income (optional) — if entered, AI adds a one-sentence
  payment-to-income context line

Output: clean monthly breakdown — P&I, taxes, HOA, insurance, total.
Insurance estimated at 0.5-1% of home value annually.
Taxes pulled from property data.

All loan math in src/utils/loanMath.js.
All loan inputs are local only. Never sent to a server. Never stored
beyond the session.

Standard mortgage formula:
  M = P * [ r(1+r)^n ] / [ (1+r)^n - 1 ]
  where P = principal, r = monthly rate, n = number of payments
Round all displayed numbers.

---

## AI INTEGRATION — CLAUDE API

All AI calls go through src/utils/claudeApi.js. Never call the API
directly from components.

Always enable the web search tool so Claude gathers live public data:

```javascript
tools: [{ type: "web_search_20250305", name: "web_search" }]
```

### System prompt — use on every call

```
You are Vis, an AI real estate analysis assistant. You generate clear,
accurate, plain language property and market analysis for home buyers,
sellers, agents, and brokerages. You search the web for current public
information and synthesize it.

Follow these rules without exception:

ACCURACY
- Base analysis only on data you actually find or that the user provides
- Never invent, infer, or hallucinate property details
- If data is missing, say so plainly — do not fill gaps with guesses
- Qualify all valuations clearly as estimates, not appraisals

FAIR HOUSING COMPLIANCE — CRITICAL
- Never reference race, ethnicity, religion, national origin, sex,
  disability, familial status, or any protected class
- Never use coded language that could steer buyers based on demographics
- Never describe neighborhoods using demographic characteristics
- Focus only on property facts and market data

TONE
- Plain language a first-time buyer understands
- Professional enough for an agent to send to a client
- Honest about risks and weaknesses, not just positives
- No jargon without explanation

LEGAL BOUNDARIES
- No legal advice, no financial advice, no contract interpretation
- Always make clear these are AI-generated insights, not professional
  appraisals or valuations

FORMAT
- Flowing prose, no bullet points in the main summary
- Summaries 250-350 words
- End with one sentence on what type of buyer the property suits
```

### Report generation call returns JSON

Ask Claude to return only valid JSON (no markdown, no preamble) with:
visScore, visScoreLabel, visScoreReason, aiSummary, keyStrengths (array),
keyRisks (array), bestSuitedFor. Parse safely and handle errors.

---

## MOCK DATA

All mock data in src/data/mockData.js. Import everywhere. Use this for all
UI development before the Claude API is wired in.

```javascript
export const MOCK_PROPERTY = {
  address: "2847 Riverside Drive",
  city: "Austin", state: "TX", zip: "78741",
  beds: 4, baths: 3, sqft: 2340, lotSize: "0.18 acres", yearBuilt: 2019,
  listingStatus: "Active",
  prevSalePrice: 418000, prevSaleDate: "Jun 2022",
  estimatedValue: 487500, estimatedValueRange: { low: 465000, high: 510000 },
  pricePerSqft: 208, annualTax: 9840, hoa: 120,
  floodZone: "Zone X - Low Risk",
  walkScore: 72, walkScoreLabel: "Very Walkable",
  schoolRating: 8, schoolName: "Zavala Elementary",
  garage: "2-car attached",
};

export const MOCK_MARKET = {
  area: "Austin, TX",
  medianPrice: 487000, medianPriceChange: -3.2,
  avgDaysOnMarket: 42, avgDaysChange: 14,
  activeListings: 4218, activeListingsChange: 22,
  listToSaleRatio: 97.1, listToSaleChange: -1.8,
  priceReductions: 24.3, priceReductionsChange: 6.1,
  avgPricePerSqft: 210, currentRate30yr: 6.84,
  nextFedMeeting: "Jun 12, 2026", fedExpectation: "Rate hold expected",
};

export const MOCK_AI_RESPONSE = {
  visScore: 74,
  visScoreLabel: "Good Value",
  visScoreReason: "Competitively priced against recent comps in a moderating but stable market.",
  aiSummary: "2847 Riverside Drive presents a solid opportunity in Austin's 78741 ZIP code. The estimated value of $487,500 is supported by recent comparable sales, and at $208 per square foot it sits in line with the neighborhood average. The Austin market has moderated over the past year, with days on market rising and price reductions becoming more common, giving buyers more negotiating room than in 2022. The 2019 build means modern systems without near-term renovation risk. The 8/10 school rating and Zone X flood status add durable value that tends to hold through market cycles. At current rates, a 20% down payment puts the monthly principal and interest near $2,590, improving meaningfully if rates fall. The main risk is broader market softening, with nearly a quarter of area listings taking price cuts.",
  keyStrengths: [
    "2019 build - modern systems, no immediate renovation costs",
    "8/10 school rating at Zavala Elementary",
    "Zone X flood zone - lowest risk category"
  ],
  keyRisks: [
    "Austin market softening - days on market up 14 days year over year",
    "24% of area listings have taken price reductions"
  ],
  bestSuitedFor: "Families prioritizing school quality and modern construction with long-term holding plans."
};
```

---

## AGENT / BROKERAGE WHITE LABEL

Stored in localStorage key: vis-agent-settings
Fields: name, brokerage, licenseNumber, email, phone, logo (base64),
brandColor (default #DA6B3A)

Logo upload: PNG, JPG, SVG, max 5MB, stored as base64.
If no logo: initials circle (first + last initial), white text on
brandColor background.

White label header only shows when tier is Agent or Enterprise AND
settings are filled in. Buyer tier reports always show Vis branding.
Enterprise uses brokerage name/logo instead of individual.

---

## LEGAL COMPLIANCE

Every report footer:
"This report is generated using publicly available data and AI analysis.
It is for informational purposes only and does not constitute financial,
legal, or real estate advice. Verify all property information
independently before making any decisions. Generated by Vis ·
vis.realestate"

All AI content visibly labeled "Vis AI Analysis".
Scores always labeled as AI estimates, not appraisals.
Fair Housing guardrails enforced in the system prompt.
Loan data never stored server-side.

---

## LOCALSTORAGE KEYS

vis-theme            — charcoal / black / light
vis-tier             — buyer / agent / enterprise
vis-sessions         — array of chat session objects
vis-saved-reports    — array of saved report objects
vis-agent-settings   — white label settings object
vis-subscription     — subscription status placeholder

---

## CODING RULES — EVERY SESSION

1. Never hardcode hex colors. Always CSS variables.
2. Never hardcode data in components. Import from mockData.js.
3. Numbers always IBM Plex Mono. Text always DM Sans. No exceptions.
4. Do not install libraries without asking first.
5. Do not modify components unrelated to the current session task.
6. Keep components under 200 lines. Split if larger.
7. All Claude API calls go through src/utils/claudeApi.js only.
8. Always handle loading, empty, and error states.
9. Never show a broken UI. Always show a graceful fallback.
10. Round every displayed number.
11. End every session with: files changed, what was built, what to
    prepare for next session, any warnings.

---

## BUILD ORDER

Session 1  — Environment: Vite, React, Tailwind, GitHub, Vercel deployed
Session 2  — Chat shell: thread, message bubbles, input bar, typing dots
Session 3  — Claude API + web search wired to chat input
Session 4  — Chat session management: save, name, list, reopen
Session 5  — Suggested prompt chips on new chat
Session 6  — Inline data cards in chat thread
Session 7  — Generate Full Report button logic
Session 8  — Property Report view: full layout, mock data
Session 9  — Property facts block + user edit layer
Session 10 — Area market conditions block
Session 11 — Vis Property Score: circle, label, color logic
Session 12 — Loan calculator: inputs, monthly breakdown, income context
Session 13 — AI property summary block
Session 14 — Market Conditions Report: full layout
Session 15 — Three-tier system: vis-tier, feature gates
Session 16 — Buyer tier branding + usage limit UI
Session 17 — Agent white label: logo upload, brand color, report header
Session 18 — Enterprise branding + higher limits + priority badge
Session 19 — Share / export / save: link, PDF, save to sessions
Session 20 — Send to Client button (Agent + Enterprise)
Session 21 — Settings page: theme, branding, account
Session 22 — Subscription gate: paywall, upgrade prompts
Session 23 — Theme system: Charcoal, True Black, Light switcher
Session 24 — Mobile optimization: responsive pass
Session 25 — Performance + error handling
Session 26 — Beta deployment + feedback
Session 27 — Bug fixes + launch prep

---

## CURRENT SESSION STATUS

Update this at the end of every session.

Last completed session: Session 1 — Environment setup
Current status: Environment deployed and ready
Next task: Session 2 — Chat shell (thread, message bubbles, input bar,
           typing dots)
Known issues: None
Files added/changed in Session 1:
  - index.html (Google Fonts: DM Sans + IBM Plex Mono; theme bootstrap
    inline script reads vis-theme from localStorage before first paint;
    title and theme-color meta)
  - src/index.css (design-system foundation: @import "tailwindcss",
    Charcoal/Black/Light theme variables, global reset, body styles,
    custom 6px scrollbar, selection color)
  - src/theme.js (applyTheme / setTheme / getStoredTheme; theme stored
    in localStorage key vis-theme; default charcoal removes data-theme
    attribute so :root vars apply)
  - src/main.jsx (calls applyTheme() before React render)
  - src/App.jsx (Vis logo mark + wordmark + tagline placeholder using
    CSS variables — proves fonts, colors, and Tailwind all wire up)
  - public/favicon.svg (V mark, burnt orange, white path V)
  - package.json (name "app" -> "vis-app")
  Removed: src/App.css, src/assets/, public/icons.svg (Vite scaffold
  leftovers)
Notes: Tailwind v4 is wired via @tailwindcss/vite. Design system uses
       semantic CSS variables (--bg, --card, --border, --muted, --text,
       --white, --accent) — components reference them via var(--*) and
       Tailwind arbitrary values bg-[var(--bg)]. Three themes already
       defined as :root + [data-theme="black"] + [data-theme="light"];
       the switcher UI lands in Session 23.
       Default model in API integration: claude-opus-4-7. Do not scope
       creep into a full dashboard.
