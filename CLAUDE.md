CLAUDE.md — Vis App Project Intelligence

Read automatically by Claude Code at the start of every session.
Follow every instruction here precisely. Do not deviate unless the
user explicitly says so in the current session.

WHAT THIS PRODUCT IS

Vis (vis.realestate) is a chat-first AI real estate tool. A user opens
the app and types anything about a property, neighborhood, market, or
buying situation. The AI searches the web for current public information
and responds conversationally. When a response has enough data for a
report a Generate Full Report button appears inline.

Core loop:
Open chat -> type anything -> AI searches web and responds ->
quick answers in chat -> expand into full report -> save / share / export

Agents and brokerages get a fully white labeled version of this product
under their own subdomain. Their clients see a completely branded AI
that looks, feels, and responds as if the agent built it. Vis is
completely invisible to clients on agent and brokerage URLs.

DO NOT scope creep into a full market dashboard with tickers, live
charts, or a complex data pipeline. This is a chat interface plus
AI-generated reports plus white labeled agent experiences. Keep
everything focused on that.

FOUR SUBSCRIPTION TIERS

All paid. No free tier. Monthly subscription with usage limit included.
At 80% usage: soft warning banner. At 100%: modal to confirm overage.
Overage billed per unit above the limit at a rate set above API cost.
Prices, limits, and overage rates are configurable in admin without
touching code (stored in tier_config table).

Do not expose raw token counts to users anywhere. Usage is described
in plain language: Standard (Solo), Heavy (Investor), Professional
(Agent), Team (Brokerage).

Tier stored in localStorage key: vis-tier (solo / investor / agent /
brokerage) until auth is live, then read from users table in Supabase.

SOLO — $19/month

- Full AI chat with web search
- Inline data cards: property, market, loan, rate
- Property report + market report
- Loan calculator
- 5 saved reports
- PDF export
- Standard usage limit
- Vis branding throughout
- No custom URL, no white label, no investor tools

INVESTOR — $49/month

- Everything in Solo
- Rental yield estimate card
- Rent comp card
- ARV / deal analysis card
- Cash-on-cash calculator
- Cap rate calculator
- Net rental yield calculator
- Monthly cash flow calculator
- Multi-property comparison (up to 3)
- Investor report (full PDF with all metrics)
- 25 saved reports
- Report sharing link
- Heavy usage limit

AGENT — $99/month

- Everything in Investor
- Custom AI name (agent chooses)
- Custom subdomain: handle.vis.realestate (auto-provisioned on signup)
- Agent logo replaces Vis logo on their subdomain
- Agent brand color replaces Vis orange on their subdomain
- AI training via text box (5,000 char) or document upload (10,000
  chars extracted)
- White labeled reports — Vis completely invisible on custom subdomains
- Send to Client button
- Unlimited saved reports
- Professional usage limit

BROKERAGE — $249/month

- Everything in Agent
- Brokerage subdomain: handle.vis.realestate (auto-provisioned)
- Brokerage-level AI training baseline (Layer 2 — all linked agents
  inherit, cannot override)
- Agent management dashboard (add/remove agents, view per-agent usage)
- Consolidated billing for all linked agents
- Priority AI speed
- Team usage limit shared across all agents

SUBDOMAIN MODEL

No nested subdomains. Every Agent and Brokerage gets one clean
subdomain. Brokerage agents are linked to their brokerage via Supabase
relationships (brokerage_id on agent_profiles), not via URL nesting.

URL format:
  Agent:     handle.vis.realestate
  Brokerage: handle.vis.realestate

Wildcard DNS `*.vis.realestate` is configured once at the registrar
pointing to Vercel. New subdomains are provisioned automatically via
the Vercel API when a user claims their handle — no manual DNS changes
ever needed after initial setup.

Subdomain automation flow:
1. User enters desired handle during onboarding
2. App checks handle_registry table — must be globally unique
3. If available, app calls Vercel API to register handle.vis.realestate
4. Vercel provisions subdomain (live within seconds)
5. Supabase stores handle, links to user account, stores branding config
6. Any visit to handle.vis.realestate reads Supabase, applies branding
7. Client sees fully branded experience — no Vis references anywhere

Vercel API call (serverless only — VERCEL_API_TOKEN never in client):
```js
await fetch(`https://api.vercel.com/v10/projects/${PROJECT_ID}/domains`, {
  method: "POST",
  headers: { Authorization: `Bearer ${VERCEL_API_TOKEN}` },
  body: JSON.stringify({ name: `${handle}.vis.realestate` }),
});
```

TECH STACK

- React with Vite
- Tailwind CSS
- Claude API with web search tool enabled — entire data + intelligence layer
- Model: claude-sonnet-4-6 (cost-driven default; set via VIS_MODEL env var, falls back to Sonnet 4.6). Opus is not used for the API. Max tokens 1500.
- Google Fonts: DM Sans (text), Inter Semibold 600 (numbers)
- Vercel with wildcard subdomain routing (*.vis.realestate)
- Vercel API — programmatic subdomain provisioning (VERCEL_API_TOKEN
  stored as env var, never exposed to client)
- GitHub version control
- Supabase — auth, database (agent profiles, users, billing, handles)
- localStorage — sessions, saved reports, theme, tier (pre-auth)
- html2canvas + jsPDF — PDF export
- NO MLS API, NO ATTOM, NO Zillow API, NO paid data subscriptions

Do not add libraries without asking the user first.

SUPABASE SCHEMA

Five tables. Schema is admin-configurable for pricing/limits.

```
users
id                  uuid references auth.users, primary key
email               text
tier                text               -- solo / investor / agent / brokerage
usage_current       integer default 0  -- current billing period usage units
usage_limit         integer            -- from tier_config, overridable per user
overage_rate        numeric            -- per unit above limit
overage_accrued     numeric default 0  -- current period overage charges
comped              boolean default false
comp_expires_at     timestamp nullable
billing_cycle_start timestamp
suspended           boolean default false
created_at          timestamp
last_active_at      timestamp

agent_profiles
id                  uuid primary key
user_id             uuid references auth.users
handle              text unique        -- e.g. "mikejones"
subdomain           text unique        -- e.g. "mikejones.vis.realestate"
ai_name             text nullable
logo_url            text nullable      -- Supabase storage
brand_color         text default '#DA6B3A'
training_text       text nullable      -- text box, max 5,000 chars
training_doc_text   text nullable      -- extracted from upload, max 10,000 chars
brokerage_id        uuid nullable      -- references brokerage_profiles
created_at          timestamp

brokerage_profiles
id                  uuid primary key
user_id             uuid references auth.users
handle              text unique
subdomain           text unique
ai_name             text nullable
logo_url            text nullable
brand_color         text default '#DA6B3A'
training_baseline   text nullable      -- Layer 2 — inherited by all linked agents
created_at          timestamp

handle_registry
handle              text primary key   -- global uniqueness: agents + brokerages
account_type        text               -- agent / brokerage
account_id          uuid
created_at          timestamp

tier_config
tier                text primary key   -- solo / investor / agent / brokerage
monthly_price       numeric
usage_limit         integer
overage_rate        numeric
updated_at          timestamp
```

On subdomain load: query agent_profiles or brokerage_profiles by
subdomain. For agents with a brokerage_id: fetch brokerage_profiles
too and combine training_baseline (first) + training_text + training_
doc_text (appended) into the Layer 2 + Layer 3 system prompt blocks.

FILE STRUCTURE

Maintain exactly. Do not reorganize without asking.

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
      TypingIndicator.jsx
      GenerateReportButton.jsx
      SessionSidebar.jsx
      PropertyFacts.jsx
      MarketConditions.jsx
      MarketDataGrid.jsx
      LoanCalculator.jsx
      AISummary.jsx
      UserEditLayer.jsx
      WhiteLabelHeader.jsx
      AgentChatHeader.jsx
      ShareExport.jsx
      ThemeSwitcher.jsx
      SubscriptionGate.jsx
      TierBadge.jsx
      UsageBar.jsx
      InvestorCalculator.jsx
    pages/
      Chat.jsx
      PropertyReport.jsx
      MarketReport.jsx
      InvestorReport.jsx
      Reports.jsx
      Saved.jsx
      Settings.jsx
      AgentSettings.jsx
      TrainAI.jsx
      Admin.jsx
    data/
      mockData.js
    utils/
      claudeApi.js
      subdomainLoader.js
      formatters.js
      loanMath.js
      investorMath.js
      docExtractor.js
    theme.js
    App.jsx
    index.css
  index.html
  CLAUDE.md
```

DESIGN SYSTEM — FOLLOW EXACTLY EVERY SESSION

Colors — CSS variables only. Never hardcode hex in components.

```css
/* Light (default) — clean white */
--bg:           #ffffff   /* page background */
--card:         #ffffff   /* cards, surfaces */
--card-tint:    #f8f9fb   /* lightly tinted surface (highlighted areas) */
--border:       #ebebeb   /* primary borders — very light */
--border-soft:  #f7f8fa   /* sidebar bg + tertiary borders + inset surfaces */
--muted:        #9ca3af   /* labels */
--muted-soft:   #6b7280   /* secondary text */
--muted-faint:  #d1d5db   /* timestamps, tertiary */
--text:         #374151   /* body text */
--white:        #111827   /* strongest text — headlines, key values */
--accent:       #DA6B3A   /* brand orange */
--accent-soft:  rgba(218, 107, 58, 0.08)  /* halo / focus ring tint */
--shadow-card:  0 1px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04)

/* Charcoal (alternate, opt-in via data-theme="charcoal") */
--bg:           #111111
--card:         #3D3D3D
--card-tint:    #2a201a
--border:       #3D3D3D
--border-soft:  #2a2a2a
--muted:        #888888
--muted-soft:   #aaaaaa
--muted-faint:  #555555
--text:         #D8D8D8
--white:        #FFFFFF
--accent:       #DA6B3A
--accent-soft:  rgba(218, 107, 58, 0.18)
--shadow-card:  none

/* True Black (alternate, opt-in via data-theme="black") */
--bg:           #000000
--card:         #1a1a1a
--card-tint:    #1f1410
--border:       #2a2a2a
--border-soft:  #1a1a1a
--muted:        #777777
--muted-soft:   #999999
--muted-faint:  #444444
--text:         #e8e8e8
--white:        #FFFFFF
--accent:       #DA6B3A
--accent-soft:  rgba(218, 107, 58, 0.18)
--shadow-card:  none
```

`--white` is semantic: it means "strongest text color in this theme" — actual
white on dark themes, near-black `#1a1a18` on Light. Same for `--text` (body
text) and `--muted-*` (the muted ladder).

On agent custom URLs var(--accent) is replaced with the agent's
brand_color from Supabase. Apply by overriding --accent on
document.documentElement after subdomain data loads.

Theme saved to localStorage key: vis-theme.
Apply before first render. Default: Charcoal.

Typography — strict, no exceptions

- Inter: ALL UI text — labels, body text, buttons, nav, chat messages,
  summaries (weights 300, 400, 500, 600, 700 loaded)
- Inter Semibold (weight 600): ALL numbers, data values, percentages,
  dollar amounts, dates in data context, URLs, codes
- Numbers always Inter 600. UI text uses Inter 400/500/700 as appropriate.
- --font-sans and --font-mono both resolve to Inter
- Report pages (PropertyReport, MarketReport, InvestorReport) use Georgia
  serif for formal print headers — do not change those

Visual rules

- Background: always var(--bg)
- Cards: var(--card) bg, 1px solid var(--border), radius 8-12px
- Inset surfaces (cards inside cards, fact pills): var(--border-soft) bg
- Drop shadows: only the subtle var(--shadow-card) on AI message bubbles
  and the chat input bar in Light theme. None in Charcoal / Black. No
  shadows elsewhere
- Primary buttons: var(--accent) bg, white text, 600-700 weight, radius 7
- Secondary buttons: var(--border-soft) bg, 1px solid var(--border),
  hover lifts to var(--card)
- Outlined buttons (Generate Full Report): transparent bg, 1.5px solid
  var(--accent), accent text, fills accent on hover
- Radius: 8-12px cards, 6-8px buttons, 20px pills, 6-10px inner pills
- Transitions: 0.15s ease on all interactive elements
- Spacing: generous, never crowd elements
- Scrollbar: 4px thin, transparent track, var(--border) thumb
- Global reset: box-sizing border-box, no default margin or padding
- Round every displayed number — no floating point artifacts

Chat patterns

- Nav: 48px, frosted backdrop (rgba(247,246,243,0.92) + blur(12px)),
  1px var(--border) bottom. Logo left, tabs center, TierBadge + LIVE
  indicator right. LIVE = 7px accent dot with var(--accent-soft) halo
  + "LIVE" uppercase mono label
- AI message: V avatar + "Vis" name + relative timestamp ABOVE the
  bubble. Bubble var(--card) bg, 1px var(--border), radius
  4/14/14/14, var(--shadow-card), max-width 88% (92% with a card)
- User message: orange bubble, white text, radius 14/14/4/14, max-width
  72%. No avatar, no header
- Page title block at top of thread: session name + "Started {date}"
  in muted
- Chat input: white card + var(--shadow-card), pill input field +
  orange Send button (7px radius). Persistent disclaimer line below:
  "Vis uses AI and publicly available data · Not financial or legal
  advice"
- Sidebar: var(--border-soft) bg, "Recent chats" mono header, sessions
  as flat rows, active session in white card with border, "+ New chat"
  is a 1.5px dashed border button at the bottom of the list

Accent color

var(--accent) is used for: logo mark, active nav underline, primary
buttons, headline values in cards (est. value, median price),
user message bubbles, send button, Generate Full Report button,
key totals (monthly payment), AI avatar background.

No Vis Score / Market Score concept anywhere — Vis does not assign
scores to properties or markets. The accent color highlights the
single most important value in each context instead.

On vis.realestate this is #DA6B3A.
On agent URLs this is the agent's brand_color from Supabase.

BRANDING — TWO MODES

On vis.realestate (Vis branding)

- Logo mark: 28x28px square, radius 8px, var(--accent) bg, white "V",
  Inter bold 13px
- Wordmark: "vis" DM Sans 800 + ".realestate" Inter 10px muted
- AI avatar in chat: orange V square
- AI name in chat: "Vis"
- Report header: Vis logo and name

On agentname.vis.realestate (agent branding)

- Logo: agent's uploaded logo image, replaces V mark everywhere
- If no logo: initials circle in brand color
- AI name: agent's chosen name (required field — must be set before
  the subdomain goes live)
- AI avatar in chat: agent logo or initials circle
- Report header: agent logo + agent name + brokerage
- Vis completely invisible — no V logo, no "vis" wordmark, no mention
- Footer on reports: agent name and contact only, no Vis reference

NAVIGATION

On vis.realestate: Chat, Reports, Saved, Settings + tier badge pill
On agent URLs: same tabs but labeled with agent's branding, no tier
badge visible to clients (clients don't see subscription details)

Nav height 48px, var(--bg) bg, 1px solid var(--border) bottom border
Active tab: var(--white), 2px solid var(--accent) bottom border
Inactive: var(--muted)

SUBDOMAIN LOADING (subdomainLoader.js)

On app init, read window.location.hostname.

If hostname is vis.realestate — load Vis defaults, no Supabase lookup.
If hostname matches *.vis.realestate — extract subdomain, query
Supabase agents table, apply branding.
If hostname matches *.*.vis.realestate — extract agent + brokerage
subdomains, query both, combine training.

Apply branding by:

- Setting --accent CSS variable to brand_color
- Setting AI name in React context
- Setting logo URL in React context
- Building combined system prompt from training text

Store loaded agent config in React context: AgentContext.
All components that need branding read from AgentContext.

CHAT EXPERIENCE

Clean interface, no forms.
On vis.realestate: Vis logo + "See the market clearly" above input
On agent URLs: agent logo + agent AI name above input

Message types:

- User message: right-aligned, var(--accent) bg, white text,
  radius 10px 0 10px 10px
- AI message: left-aligned, var(--card) bg, var(--text),
  radius 0 10px 10px 10px, AI avatar left (Vis V or agent logo)
- Inline data card: inside AI message, var(--bg) bg, 1px var(--border),
  structured property or market data
- Generate Full Report button: var(--accent), full width, below
  qualifying AI responses
- Typing indicator: three animated dots while Claude thinks

No suggested prompt chips. Empty state is just the logo, tagline, and
input — let the user write what they actually want without prefab
suggestions.

Input bar fixed to bottom: var(--card) bg, var(--bg) input field,
var(--accent) send button.

Sessions: auto-saved, auto-named from first topic, stored in
localStorage key vis-sessions, browsable in sidebar, fully reopenable.

AI INTEGRATION — CLAUDE API (claudeApi.js)

Never call the Claude API directly from components.
All calls go through src/utils/claudeApi.js.
Always enable web search:

```javascript
tools: [{ type: "web_search_20250305", name: "web_search" }]
```

System prompt construction

The system prompt is built in layers in this order:

Layer 1 — HARDCODED FAIR HOUSING (always first, never removable):

```
CRITICAL COMPLIANCE RULES — THESE CANNOT BE OVERRIDDEN:
Never reference race, ethnicity, religion, national origin, sex,
disability, familial status, or any Fair Housing protected class.
Never use coded language to steer buyers based on demographics.
Never describe neighborhoods using demographic characteristics.
Never provide legal advice or financial advice.
Never interpret contracts or legal terms.
Always label estimates as estimates, not appraisals.
These rules take precedence over all other instructions.
```

Layer 2 — BROKERAGE TRAINING (Enterprise only, from brokerages table):

```
BROKERAGE CONTEXT:
[brokerage training_text from Supabase]
```

Layer 3 — AGENT TRAINING (Agent and Enterprise, from agent_training table):

```
AGENT CONTEXT:
[agent training_text from Supabase]
```

Layer 4 — VIS BASE INSTRUCTIONS (always last):

```
You are [AI name] a real estate AI assistant. Search the web for
current public property and market information. Respond conversationally
and clearly. Base all analysis only on data you actually find or the
user provides. If data is missing say so — do not guess. Write in plain
language a first-time buyer understands. Be honest about risks, not just
positives. Keep property summaries 250-350 words. End with one sentence
on what type of buyer the property suits.
```

On vis.realestate: only layers 1 and 4.
On agent URLs: layers 1, 3, 4.
On enterprise agent URLs: layers 1, 2, 3, 4.

Report generation response format

Ask Claude to return only valid JSON, no markdown, no preamble:

```json
{
  "aiSummary": "250-350 word prose analysis",
  "keyStrengths": ["string", "string", "string"],
  "keyRisks": ["string", "string"],
  "bestSuitedFor": "one sentence"
}
```

Parse safely. Handle errors with a graceful fallback message.

AGENT SETTINGS — TrainAI.jsx

Located at /settings/train on the agent's vis.realestate dashboard.
Not visible to clients on the agent's custom URL.

Text box:

- Label: "Train your AI"
- Placeholder: "Tell your AI about your market, your clients, your
  preferred tone, local knowledge, anything you want it to know..."
- Max 5000 characters with live counter
- Auto-saves to Supabase agent_training table on blur or save button

Document upload:

- Accepts PDF, DOCX, TXT
- Max 5MB
- Text extracted via docExtractor.js (use pdf.js for PDF, mammoth for DOCX)
- Extracted text appended to or replaces the text box content
- User can edit extracted text before saving
- Max 10,000 characters after extraction

Preview button: shows a sample chat response using the current training
so the agent can test how their AI behaves before clients see it.

LOAN CALCULATOR (loanMath.js)

Standard mortgage formula:
M = P * [r(1+r)^n] / [(1+r)^n - 1]
P = principal, r = monthly rate, n = number of payments

Inputs: purchase price (pre-filled, editable), down payment (dollar or
% toggle), loan term (30yr/15yr/ARM), interest rate (pre-filled with
current rate, editable), credit score range (optional), taxes and
insurance toggle, income (optional).

Output: P&I, est. tax, HOA, est. insurance, total monthly.
Insurance estimated at 0.75% of home value annually divided by 12.
Taxes from property data. HOA from property data.

Income input: if entered, compute payment-to-income ratio and output
one sentence like "At this income this home represents X% of gross
monthly income."

All loan data local only. Never sent to server. Never stored.

MOCK DATA (src/data/mockData.js)

```javascript
export const MOCK_PROPERTY = {
  address: "2847 Riverside Drive",
  city: "Austin", state: "TX", zip: "78741",
  beds: 4, baths: 3, sqft: 2340, lotSize: "0.18 acres",
  yearBuilt: 2019, listingStatus: "Active",
  prevSalePrice: 418000, prevSaleDate: "Jun 2022",
  estimatedValue: 487500,
  estimatedValueRange: { low: 465000, high: 510000 },
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
  nextFedMeeting: "Jun 12, 2026",
  fedExpectation: "Rate hold expected",
};

export const MOCK_AGENT = {
  aiName: "Ask Sarah",
  subdomain: "sarah",
  brandColor: "#2563EB",
  logoUrl: null,
  trainingText: "I specialize in Austin TX residential. My clients are mostly first-time buyers aged 28-40. Always be encouraging and explain everything simply.",
};

export const MOCK_AI_RESPONSE = {
  // property-specific AI summary (see mockData.js for full content)
};

export const MOCK_MARKET_AI = {
  // market-specific AI summary: prose + keyStrengths + keyRisks + bestSuitedFor
  // (see mockData.js for full content)
};
```

REPORTS

One report format only — print / document layout (Georgia serif,
white bg, formal table-driven aesthetic; see docs/vis_reporting.html).
No modern card layout. No format selector.

Property Report sections (order):
   1. White label header (branding per tier and URL context)
   2. Property header — address, stats row
   3. Property facts block — all key fields, unknown = "—"
   4. User edit layer — review/correct/add before finalizing
   5. Area market conditions — metric cards
   6. Loan calculator
   7. AI summary — 250-350 word prose
   8. Share / export / save
   9. Send to Client (Agent + Enterprise only)

Market Conditions Report sections (order):
1. White label header
2. Area header — location, date
3. Market data grid — all fields, same print table style
4. Rate context — current rate, trend, Fed meeting
5. AI market summary
6. Share / export / save

Report footers

On vis.realestate: "Generated by Vis · vis.realestate —
for informational purposes only, not financial or legal advice."

On agent URLs: "[Agent name] · [agent contact] — for informational
purposes only, not financial or legal advice." No Vis mention.

LEGAL COMPLIANCE

Fair Housing guardrails are Layer 1 of the system prompt.
They are hardcoded. Agent training cannot override them.
Brokerage training cannot override them.
No exceptions.

Loan data: local only, never stored server-side.
AI content: always labeled (as agent's AI name on custom URLs).
All AI-generated estimates labeled clearly as estimates, not appraisals.

INLINE DATA CARD TYPES

All tiers:
  property — Property snapshot: est. value (accent), price/sqft, days
             on market, beds/baths, sqft, year built, school rating.
             Shows Generate Full Report button.
  loan     — Monthly breakdown: P&I, property tax, HOA, insurance,
             total monthly (accent). No report button.
  market   — Market conditions: median price (accent), active listings,
             days on market, list/sale ratio, price reductions,
             avg price/sqft. Shows Generate Full Report button.
  rate     — Rate snapshot: 30yr fixed, monthly payment (accent),
             15yr fixed, ARM, next Fed meeting, Fed expectation.
             No report button.

  depreciation — Depreciation analysis: annual deduction (accent),
               est. tax savings at selected bracket (accent),
               building value, 27.5yr schedule, bracket dropdown
               (22/24/32/37%), recapture warning pill.
               Generate Full Report button: Agent + Brokerage only.
               Card visible to all tiers.

Investor tier and above only:
  rental   — Rental estimate: est. monthly rent, rent range, nearby
             rental comps (address, beds/baths, rent). Source note.
             No report button.
  deal     — Deal analysis: purchase price, est. ARV, repair estimate,
             potential equity, recommendation flag (good deal /
             marginal / pass). Shows Generate Full Report button.
  returns  — Returns snapshot: gross yield %, net yield %,
             cash-on-cash %, cap rate %, monthly cash flow.
             No report button.

Never invent numbers. Only emit a card when Claude has real data from
its web search. card: null for conversational responses.
No Vis Score or Market Score anywhere — accent color highlights the
single most important value per card instead.

INVESTOR TOOLS (Investor tier and above)

All rental data sourced via Claude web search (Zillow, Apartments.com,
Rentals.com). All calculators are pure math in investorMath.js —
no external data API required.

Calculators:
  Cash-on-cash: annual pre-tax cash flow ÷ total cash invested
  Cap rate: net operating income ÷ property value
  ARV: Claude pulls sold comps; user provides repair estimate;
       max offer = 70% of ARV minus repairs (fix-and-flip formula)
  Gross rental yield: (annual rent ÷ purchase price) × 100
  Net rental yield: (net annual income ÷ purchase price) × 100
  Monthly cash flow: rent minus (mortgage + tax + insurance + HOA +
                     maintenance)

Investor report includes: property snapshot, rental estimate, deal
analysis, all four return metrics, rental comp summary, 12-month cash
flow projection. PDF exportable. Shareable via link (Investor+).

Multi-property comparison: up to 3 properties, Claude runs all calcs
for each, renders comparison table with Generate Full Report button.

DEPRECIATION ANALYSIS

Available to all tiers for the inline card. Generate Full Report
button and the PropertyReport block are Agent + Brokerage only.

Calculation (calcDepreciation in loanMath.js):
  buildingValue = purchasePrice × (1 − landValuePercent)
  annualDeduction = buildingValue ÷ 27.5
  annualTaxSavings = annualDeduction × taxBracket
  Recovery period: 27.5yr residential, 39yr commercial

Land value defaults (use county assessor data when available):
  Standard residential:     20%
  High cost coastal market: 35%
  Rural / low cost market:  10%

Tax bracket options (bracket dropdown in card and report):
  22% — middle income
  24% — upper middle
  32% — high income (default)
  37% — top bracket

System prompt instructions (Layer 4 in claudeApi.js):
  1. Search county assessor for land vs building split.
  2. Use assessor data when found, label "county assessor".
     Otherwise use market-based default, label with explanation.
  3. Calculate straight-line depreciation over 27.5yr (residential).
  4. Return cardType "depreciation" with raw numbers (not strings).
  5. Always include recapture warning and educational disclaimer.
  6. Never give specific tax strategy advice.

DataCard type="depreciation" layout:
  Header: "DEPRECIATION ANALYSIS"
  Top row (3 cols): Annual Deduction (accent), Est. Tax Savings
    (accent, recalculates on bracket change), Building Value (white)
  Bracket dropdown: 22/24/32/37%
  Schedule grid (2 cols): Year 1, Year 5, Year 10, Year 27.5
  Data source note (county assessor or estimated)
  Warning pill: rgba(218,107,58,0.12) bg, orange border, CPA note
  Generate Full Report button: Agent + Brokerage only

PropertyReport block:
  Position: after Loan Calculator, before AI Analysis
  Toggle: "Depreciation (Investors)" in sticky bar, default OFF
  Visible to: Agent + Brokerage tiers only
  Sections: header, key metrics, assumptions box, schedule table
    (Year 1–5, 10, 15, 20, 27.5), recapture warning, disclaimer
  Disclaimer always rendered, cannot be removed

ADMIN PANEL

Protected route — accessible only to Vis owner. Separate admin
password or magic link. Not visible to any users. Built within
the Vis codebase at /admin.

User management: view all users (name, email, tier, join date, last
active), search/filter, manually change tier, comp an account (set
price to $0 for a period), adjust usage limit per user, reset usage
counter, suspend or reactivate.

Usage & limits: usage % per user, flag at 80% (yellow) and 100%
(red), overage charges accrued, usage history by month, highest-usage
users across tiers.

Tier & pricing config: edit monthly price, usage limit, overage rate
per tier. Changes saved to tier_config table, reflected immediately.
Price changes apply to new subscribers.

Agent & brokerage management: view all brokerage accounts with linked
agents, per-agent usage, add/remove agents from brokerage, view
training content for any account.

Revenue overview: total MRR, subscribers per tier, overage revenue
this month, new signups, churned users.

System config: maintenance mode toggle, view Fair Housing guardrail
text (read-only), view and edit Layer 4 Vis base system prompt.

LOCALSTORAGE KEYS

vis-theme          — charcoal / black / light
vis-tier           — solo / investor / agent / brokerage (pre-auth)
vis-sessions       — array of chat session objects
vis-saved-reports  — array of saved report objects

After auth is live, tier is read from users table in Supabase.
Agent branding (logo, brand color, AI name, subdomain) always lives
in Supabase — required for subdomain routing to work.

CODING RULES — EVERY SESSION

1. Never hardcode hex colors. Always CSS variables.
2. Never hardcode data in components. Import from mockData.js.
3. Numbers always Inter Semibold (600) via var(--font-mono). Text always DM Sans. No exceptions.
4. Do not add libraries without asking the user first.
5. Do not modify components unrelated to the current session task.
6. Keep components under 200 lines. Split if larger.
7. All Claude API calls go through src/utils/claudeApi.js only.
8. Always handle loading, empty, and error states.
9. Never show a broken UI. Always show a graceful fallback.
10. Round all displayed numbers.
11. Fair Housing guardrails are always Layer 1 of system prompt.
    Never let agent training appear before them.
12. End every session: files changed, what was built, what to prepare
    for next session, any warnings.

BUILD ORDER

Session 1  — Environment: Vite, React, Tailwind, GitHub, Vercel ✓
Session 2  — Chat shell: thread, bubbles, input bar, typing indicator ✓
Session 3  — Claude API + web search wired to chat ✓
Session 4  — Chat session management: save, name, list, reopen ✓
Session 5  — (removed: suggested prompt chips not wanted)
Session 6  — Inline data cards in chat thread ✓
Session 7  — Generate Full Report button logic ✓
Session 8  — Property Report view: full layout, mock data ✓
Session 9  — Property facts block + user edit layer ✓
Session 10 — Area market conditions block ✓
Session 11 — (removed: Vis Property Score dropped)
Session 12 — Loan calculator: inputs, monthly breakdown ✓
Session 13 — AI property summary block ✓
Session 14.5 — AI response card emission ✓
Session 15a — Investor cards + math: rental, deal, returns card types
              added to DataCard.jsx; investorMath.js (cash-on-cash, cap
              rate, ARV, gross/net yield, monthly cash flow); system
              prompt updated to emit investor card types
Session 15b — Investor report + comparison: InvestorReport.jsx (full
              PDF-ready layout matching print style); multi-property
              comparison table; InvestorCalculator.jsx component
Session 12b — Depreciation calculator ✓
              - calcDepreciation() added to loanMath.js
              - type="depreciation" DataCard with bracket dropdown
              - Depreciation block added to PropertyReport (Agent+,
                toggle OFF by default)
              - Depreciation card format added to claudeApi.js
                system prompt (Layer 4)
              - MOCK_DEPRECIATION + MOCK_DEPRECIATION_CARD added to
                mockData.js; demo card added to demoMessages.js
              - showButton gated to agent+ in Chat.jsx
Session 16 — Supabase schema: create all 5 tables (users,
             agent_profiles, brokerage_profiles, handle_registry,
             tier_config) in Supabase dashboard
Session 16.5 — Auth: Supabase Auth (email + Google OAuth), login /
               signup UI, protect chat + report routes, write user row
               to users table on first login
Session 16.6 — Onboarding flow: post-signup tier selection screen,
               payment entry (Stripe Checkout), handle claim for Agent
               + Brokerage (availability check + Vercel API
               provisioning), profile setup — user lands in chat
               only after onboarding is complete
Session 17 — Stripe integration: Stripe subscriptions wired to tiers,
             Stripe webhooks update users table (payment failed →
             suspend, upgraded/downgraded → change tier, cancelled →
             downgrade), billing portal link in settings, overage
             billing via Stripe metered add-ons
Session 17.5 — Tier system + usage: read tier from users table,
               feature gates per tier, upgrade prompts on locked
               features, per-API-call usage increment in users table,
               UsageBar.jsx, 80%/100% warning banners, overage modal
Session 18 — Agent settings: AI name, logo upload, brand color,
             handle claim + availability check, Vercel API subdomain
             provisioning
Session 19 — AI training: text box, document upload, doc extraction,
             save to agent_profiles, preview button
Session 20 — Subdomain routing: subdomainLoader.js, AgentContext,
             branding application on load
Session 21 — Agent branded chat UI: logo replaces V, AI name applied,
             brand color applied, Vis invisible
Session 22 — Agent branded reports: agent logo, name, no Vis mention
Session 22.5 — Custom report templates: JSON schema, AI-driven
               generation from agent description, preview pane
Session 22.6 — Template storage + picker: agent_templates table,
               save/list/delete, picker at top of report views
Session 23 — Brokerage tier: brokerage_profiles, linked agents,
             training baseline (Layer 2), agent management dashboard
Session 24 — Combined system prompt: brokerage Layer 2 + agent Layer 3
Session 25 — White label report footers: no Vis on agent/brokerage
Session 26 — Send to Client button (Agent + Brokerage)
Session 27 — Share / export / save: PDF export, shareable link
             generation, save to saved reports
Session 27.5 — Client-facing shared report view: public read-only
               report page (no login required), rendered from a
               share token stored in Supabase, shows agent branding
               if shared from an agent account, Vis invisible on
               agent shares
Session 28 — Settings page: theme switcher, account info, billing
             portal link, subscription status, usage summary
Session 29 — Admin panel: user management, tier config, revenue
             overview, agent management, system config, maintenance
             mode toggle
Session 30 — Subscription gate: paywall UI, upgrade prompts on
             locked feature hit, upsell copy per tier
Session 31 — Theme system polish: system preference detection,
             per-tier defaults, theme dropdown with live previews
Session 32 — Mobile optimization: responsive pass all pages
Session 33 — Performance + error handling: loading states, fallbacks,
             error boundaries
Session 34 — Beta deployment + feedback collection
Session 35 — Bug fixes + launch prep

CURRENT SESSION STATUS

Update this section at the end of every session.

Last completed: Session 30 (+ UI design refresh)
Design refresh: light theme updated to clean white/neutral palette
(#f5f6fa bg, #ffffff cards, #e5e7eb borders, neutral gray type scale).
UI font changed from DM Sans → Inter across all components. Default
theme changed from charcoal to light. Report pages (PropertyReport,
MarketReport, InvestorReport) untouched — still Georgia serif + warm
colors. DM Sans removed from index.html font load.

Previous status: MarketReport.jsx rebuilt in PropertyReport print style
(Georgia serif header, same card container, SEC section headers, table
rows). MarketDataGrid.jsx: 3 sections (Home Price & Affordability,
Market Trends, Demographics), 30 fields total. Fields with no data
omit entirely. Per-field toggles dim rows to 30% opacity (still
visible, space held); export will capture all at full opacity. Sources
are dynamic — read from market[fieldKey + "Source"] with no hard-coded
fallback. If AI returns source alongside data, it shows; no source
field = no source shown. Section-level toggles for AI Analysis and
Rate Context (same opacity pattern). MOCK_MARKET_AI added with
market-specific prose summary, tailwinds, risks, best-suited-for.
PropertyReport footer sources now dynamic from property.dataSources
array (AI populates only what it used). Risk & Climate attribution
reads from property.riskDataSource — no hard-coded "First Street".
Both reports: zero hard-coded source strings anywhere.
Session 12 — Loan calculator with real inputs: src/utils/loanMath.js
created (calcMonthlyPI standard mortgage formula, calcInsurance at
0.75%/yr ÷ 12, calcPTI payment-to-income, fmtUSD, parseDollars).
LoanCalculator.jsx fully rewritten with live interactive inputs:
purchase price (pre-filled from property.listPrice or estimatedValue),
down payment (% or $ toggle, derived value shown below), term selector
(30yr/15yr/ARM button group), rate (pre-filled from market.currentRate30yr
/ currentRate15yr / currentRateArm — switches when term changes, user
can override). Breakdown: P&I, tax (property.annualTax ÷ 12), HOA
(property.hoaMonthly), insurance — all live. Optional income field
renders payment-to-income % sentence. PropertyReport inline loan table
replaced with <LoanCalculator property={property} market={market} />.
MOCK_MARKET expanded with currentRate15yr and currentRateArm numeric
fields. All loan data is local only — never sent to server.
Next task: Session 16 — Supabase schema

Known issues / pending:
  - ANTHROPIC_API_KEY not yet set. Add to .env.local and run
    `vercel env add ANTHROPIC_API_KEY` for deploys. Run locally
    with `npm run dev:api` (not `npm run dev`).
  - Layer 2 and Layer 3 always null until Supabase + AgentContext
    (Sessions 20+).
  - PropertyReport.jsx + MarketReport.jsx live in src/pages/ per
    convention — file structure spec updated to match.

Done so far:

  Session 9 — Property facts block + user edit layer:
    - src/components/PropertyFacts.jsx: full rewrite. 8 grouped
      sections (Public Facts, Sale History, Parking & Garage,
      Interior, Exterior, Financial, HOA & Community, Location &
      Scores, Risk & Climate). 4-column print table layout. Fields
      with no data omitted entirely. Inline editing on every row:
      hover reveals ✎ pencil, click turns value into input, save on
      Enter/blur, Escape cancels, "edited" badge on overridden fields.
      Clearing override reverts to original AI value. Accepts
      overrides (object) and onOverride (fn) props.
    - src/components/UserEditLayer.jsx: new component. Section below
      PropertyFacts. Dashed "+ Add a fact or note" button creates new
      label/value input pairs. Each row tagged "added by you". Delete
      with × on hover. Accepts facts array + onAdd/onChange/onDelete.
    - src/pages/PropertyReport.jsx: full rewrite to print-only layout.
      Removed card layout entirely. Cover photo (conditional on
      photoUrl). Georgia serif header. Estimated value block with
      appreciation since purchase. Inline market metrics. Inline loan
      table. AI Analysis section gated by sliding toggle in sticky
      bar. Required attribution footer. factOverrides + userFacts
      state wired to PropertyFacts and UserEditLayer.
    - src/data/mockData.js: MOCK_PROPERTY expanded from 17 to ~80
      fields covering all Redfin/Zillow property detail fields.
      saleHistory array added. photoUrl field added (null by default).
    - index.html + index.css + all data components: number/data font
      changed from IBM Plex Mono to Inter Semibold (600). --font-mono
      CSS variable now resolves to Inter.

Done so far (pre-Session 9):
  Session 1 — env + design system:
    - Vite + React 19 + Tailwind v4 (@tailwindcss/vite) scaffold
    - GitHub linked (iamcalebmyers/vis-app), Vercel project linked
      (vis-app), Vercel builds deploy successfully
    - Google Fonts (DM Sans 400/700/800, IBM Plex Mono 400/700)
    - src/index.css: design-system CSS variables for Charcoal default,
      [data-theme="black"], [data-theme="light"]; global reset; custom
      6px scrollbar; selection color; vis-typing keyframes
    - src/theme.js: applyTheme / setTheme / getStoredTheme;
      localStorage key vis-theme; inline boot script in index.html
      eliminates first-paint flash
    - public/favicon.svg: V mark in burnt orange
    - Supabase NOT YET SET UP — deferred from Session 1 because not
      needed until Session 16 (schema) and Session 19 (subdomain
      routing). Pick it up there.

  Session 4 — chat session management:
    - src/utils/sessions.js: loadSessions / getSession / saveSession /
      deleteSession / makeSessionName. localStorage key vis-sessions.
      Stored as array of { id, name, messages, createdAt, updatedAt }.
      makeSessionName takes the first user message and truncates to 40
      chars (with ellipsis). Pure local — no API call. When the API is
      live, a future enhancement can regenerate the name via a tiny
      Claude call after the first exchange.
    - src/utils/formatters.js: relativeTime(ms) — "just now", "Xm ago",
      "Xh ago", "Xd ago", then locale date. Used in the sidebar item
      timestamps. Will host currency / score / etc. formatters later.
    - src/components/SessionSidebar.jsx: 260px left sidebar, sticky
      full-height, var(--bg) bg with right border. "New chat" pill
      button on top (var(--accent)), then a scrollable list of saved
      sessions. Each item shows name (single-line ellipsis) plus a
      mono relative-time. Active session highlighted with var(--card)
      background. Empty state explains "Your saved chats will appear
      here." Hidden on screens narrower than 768px via .vis-sidebar
      media query in index.css.
    - src/pages/Chat.jsx: now owns sessions + activeSession state. An
      effect persists current messages to the active session on every
      message change and refreshes the sidebar list. handleNewChat
      clears state (no empty session is persisted — only chats with
      at least one message land in the sidebar). handleSelectSession
      loads a session's messages. handleSend creates a new session on
      first message if none is active.
    - src/components/ChatInput.jsx: refactored — single variant, no
      more fixed positioning. Parent decides layout (sticky bottom in
      active state, centered in empty state).
    - src/components/ChatThread.jsx: drops the fixed-bottom padding
      (input is now in flow), still smooth-scrolls to latest message.
    - New file structure deviation flagged: utils/sessions.js was not
      explicitly listed in CLAUDE.md's file structure block but
      formatters.js was. sessions.js is a small pragmatic addition.

  Session 3 — Claude API + web search:
    - api/chat.js (Vercel serverless function, Node runtime): reads
      ANTHROPIC_API_KEY from env, builds the layered system prompt
      (Layer 1 Fair Housing always first; Layer 2 brokerage and
      Layer 3 agent only when their training strings are passed;
      Layer 4 Vis base instructions last), normalizes messages
      ("ai" -> "assistant"), calls Claude with the web_search_20250305
      tool, extracts text content blocks, returns { reply, stopReason,
      usage }. Graceful 400/405/500/502 error responses
    - src/utils/claudeApi.js: thin frontend wrapper around POST
      /api/chat. Throws a human-readable Error on network failure,
      non-200 response, or empty reply. Accepts an optional AbortSignal
      for future cancellation
    - src/pages/Chat.jsx: replaces the 1.2s setTimeout stub with a
      real sendMessage() call; on error renders a graceful AI bubble
      explaining what went wrong instead of a broken UI
    - @anthropic-ai/sdk added as a dependency (server-side only — does
      not enter the client bundle since api/ files aren't imported by
      src/)
    - package.json: new "dev:api" script aliasing `vercel dev` so the
      full stack (vite + serverless) runs locally. Regular `npm run
      dev` stays as vite-only for fast UI work

  Session 2 — chat shell:
    - src/components/Nav.jsx: 48px sticky top nav with logo +
      wordmark, 4 tabs (Chat active, Reports/Saved/Settings inactive,
      no routing yet), TierBadge on the right
    - src/components/TierBadge.jsx: 20px-radius pill, reads vis-tier
      from localStorage (defaults to "buyer"), uppercase mono label
    - src/components/TypingIndicator.jsx: V avatar + AI bubble with
      three muted dots animated via @keyframes vis-typing (staggered
      0/0.15/0.3s delays)
    - src/components/ChatMessage.jsx: user bubble (accent bg, white
      text, radius 10/0/10/10, right-aligned) and AI bubble (card bg,
      var(--text) text, radius 0/10/10/10, V avatar, left-aligned),
      max-width 75%
    - src/components/ChatThread.jsx: 760px max-width centered column,
      bottom padding to clear fixed input bar, smooth-scrolls to
      latest message, shows empty-state Vis logo + tagline when no
      messages and not typing
    - src/components/ChatInput.jsx: fixed bottom, var(--card) container
      with var(--bg) input field + var(--accent) Send button, disabled
      while typing, Enter to send, trimmed empty messages blocked
    - src/pages/Chat.jsx: composes Nav + ChatThread + ChatInput, holds
      messages + typing state, handleSend stubs a fixed AI reply after
      1.2s while typing indicator shows. Stub gets replaced in Session
      3 by real Claude calls through claudeApi.js
    - src/App.jsx: now just renders <Chat />

Notes: Chat-first AI real estate tool. Three tiers. Agents and
enterprise get fully white labeled AI under custom subdomains. Vis
invisible to clients on agent URLs. Agent training injects into
system prompt as Layer 3, always after Fair Housing guardrails in
Layer 1. Palette #111 #3D3D3D #888 #D8D8D8 #FFF accent #DA6B3A.
Default API model: claude-sonnet-4-6 (via VIS_MODEL env). Do not scope creep into a
dashboard. AgentContext + subdomain routing land in Session 19, not
earlier — vis.realestate is the only branding context until then.
