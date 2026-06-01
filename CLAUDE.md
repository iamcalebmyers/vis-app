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
completely invisible to clients on agent and enterprise URLs.

DO NOT scope creep into a full market dashboard with tickers, live
charts, or a complex data pipeline. This is a chat interface plus
AI-generated reports plus white labeled agent experiences. Keep
everything focused on that.

THREE SUBSCRIPTION TIERS

Tier stored in localStorage key: vis-tier (buyer / agent / enterprise)
Same features, different branding, limits, and customization depth.

BUYER/SELLER

- Full chat, property reports, market reports, loan calculator
- Vis branding throughout
- Capped: 10 saved sessions, 10 saved reports, monthly usage limit
- No white label, no custom URL, no AI training

AGENT

- Everything in Buyer/Seller
- Custom AI name (agent chooses, no default)
- Custom URL: agentname.vis.realestate
- Agent logo replaces Vis logo everywhere on their URL
- Agent brand color replaces Vis orange throughout their URL
- AI training via text box (5000 char) or document upload (10K chars extracted)
- White labeled reports (Vis invisible)
- Unlimited saved sessions and reports
- Higher monthly usage limits
- Send to Client button

ENTERPRISE/BROKERAGE

- Everything in Agent
- Brokerage URL: brokeragename.vis.realestate
- Individual agent sub-URLs: agentname.brokeragename.vis.realestate
- Brokerage-level AI training baseline applied to all agents
- Agents layer own training on top of brokerage baseline
- Brokerage baseline cannot be overridden, only added to
- Highest usage limits, priority AI speed, brokerage billing

TECH STACK

- React with Vite
- Tailwind CSS
- Claude API with web search tool enabled — entire data + intelligence layer
- Model: claude-opus-4-7 (use Opus unless told otherwise in a specific session). Max tokens 1500.
- Google Fonts: DM Sans (text), IBM Plex Mono (numbers)
- Vercel with wildcard subdomain routing (*.vis.realestate)
- GitHub version control
- Supabase (free tier) — agent settings and subdomain registry database
- localStorage — sessions, saved reports, theme, tier
- html2canvas + jsPDF — PDF export
- NO MLS API, NO ATTOM, NO Zillow API, NO paid data subscriptions

Do not add libraries without asking the user first.

SUPABASE SCHEMA

Two tables. Keep schema minimal.

```
agents
id            uuid primary key
subdomain     text unique        -- e.g. "sarah" for sarah.vis.realestate
brokerage_id  uuid nullable      -- null if individual agent
ai_name       text nullable      -- what the agent names their AI
logo_url      text nullable      -- stored in Supabase storage
brand_color   text default '#DA6B3A'
tier          text               -- agent / enterprise
created_at    timestamp

agent_training
id            uuid primary key
agent_id      uuid references agents(id)
training_text text               -- raw text from textbox or extracted doc
updated_at    timestamp

brokerages
id            uuid primary key
subdomain     text unique        -- e.g. "kw" for kw.vis.realestate
name          text
logo_url      text nullable
brand_color   text default '#DA6B3A'
training_text text nullable      -- brokerage baseline training
created_at    timestamp
```

On subdomain load: query agents table by subdomain, get branding +
training. For brokerage sub-agents: combine brokerage training_text
(first) + agent training_text (appended after) into one system prompt
block.

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
      AgentChatHeader.jsx
      ShareExport.jsx
      ThemeSwitcher.jsx
      SubscriptionGate.jsx
      TierBadge.jsx
    pages/
      Chat.jsx
      Reports.jsx
      Saved.jsx
      Settings.jsx
      AgentSettings.jsx
      TrainAI.jsx
    data/
      mockData.js
    utils/
      claudeApi.js
      subdomainLoader.js
      formatters.js
      loanMath.js
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
/* Charcoal (default) */
--bg:       #111111
--card:     #3D3D3D
--border:   #3D3D3D
--muted:    #888888
--text:     #D8D8D8
--white:    #FFFFFF
--accent:   #DA6B3A

/* True Black */
--bg:       #000000
--card:     #1a1a1a
--border:   #2a2a2a
--muted:    #777777
--text:     #e8e8e8
--white:    #FFFFFF
--accent:   #DA6B3A

/* Light */
--bg:       #F4F4F2
--card:     #FFFFFF
--border:   #D8D8D8
--muted:    #888888
--text:     #111111
--white:    #111111
--accent:   #C05A2A
```

On agent custom URLs var(--accent) is replaced with the agent's
brand_color from Supabase. Apply by overriding --accent on
document.documentElement after subdomain data loads.

Theme saved to localStorage key: vis-theme.
Apply before first render. Default: Charcoal.

Typography — strict, no exceptions

- DM Sans: ALL labels, body text, buttons, nav, chat messages, summaries
- IBM Plex Mono: ALL numbers, data values, percentages, dollar amounts,
  scores, dates in data context, URLs, codes
- Numbers always mono. Words always DM Sans.
- DM Sans weights used: 400, 700, 800
- IBM Plex Mono weights used: 400, 700

Visual rules

- Background: always var(--bg)
- Cards: var(--card) bg, 1px solid var(--border), radius 12px
- No drop shadows anywhere. Borders only.
- Primary buttons: var(--accent) bg, white text, 700 weight
- Secondary buttons: var(--card) bg, 1px solid var(--border)
- Radius: 12px cards, 8px buttons and inputs, 20px pills
- Transitions: 0.15s ease on all interactive elements
- Spacing: generous, never crowd elements
- Scrollbar: 6px, var(--bg) track, var(--border) thumb
- Global reset: box-sizing border-box, no default margin or padding
- Round every displayed number — no floating point artifacts

Accent color

var(--accent) is used for: logo mark, active nav underline, primary
buttons, Vis/agent score circle, user message bubbles, send button,
Generate Full Report button, key totals, AI avatar background.

On vis.realestate this is #DA6B3A.
On agent URLs this is the agent's brand_color from Supabase.

BRANDING — TWO MODES

On vis.realestate (Vis branding)

- Logo mark: 28x28px square, radius 8px, var(--accent) bg, white "V",
  IBM Plex Mono bold 13px
- Wordmark: "vis" DM Sans 800 + ".realestate" IBM Plex Mono 10px muted
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

Suggested prompt chips on new chat (clickable, pre-fill input):
Look up a property / Check market conditions /
Calculate my affordability / Compare two markets /
Ask anything about real estate

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
  "visScore": 74,
  "visScoreLabel": "Good Value",
  "visScoreReason": "one sentence",
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
  visScore: 74,
  visScoreLabel: "Good Value",
  visScoreReason: "Competitively priced against recent comps in a moderating but stable market.",
  aiSummary: "2847 Riverside Drive presents a solid opportunity in Austin's 78741 ZIP code. The estimated value of $487,500 is supported by recent comparable sales, and at $208 per square foot it sits in line with the neighborhood average. The Austin market has moderated over the past year with days on market rising and price reductions becoming more common, giving buyers more negotiating room than in 2022. The 2019 build means modern systems without near-term renovation risk. The 8/10 school rating and Zone X flood status add durable value that holds through market cycles. At current rates a 20% down payment puts monthly principal and interest near $2,590, improving if rates fall. The main risk is broader market softening with nearly a quarter of area listings taking price cuts.",
  keyStrengths: [
    "2019 build - modern systems, no immediate renovation costs",
    "8/10 school rating at Zavala Elementary",
    "Zone X flood zone - lowest risk category",
  ],
  keyRisks: [
    "Austin market softening - days on market up 14 days year over year",
    "24% of area listings have taken price reductions",
  ],
  bestSuitedFor: "Families prioritizing school quality and modern construction with long-term holding plans.",
};
```

REPORTS

Property Report sections (order)

1. White label header (branding per tier and URL context)
2. Property header — address, stats row
3. Score — 0-100 circle, label, one-sentence reason, color coded
4. Property facts block — all key fields, unknown = "—"
5. User edit layer — review/correct/add before finalizing
6. Area market conditions — metric cards
7. Loan calculator
8. AI summary — 250-350 word prose
9. Share / export / save
10. Send to Client (Agent + Enterprise only)

Market Conditions Report sections (order)

1. White label header
2. Area header — location, date
3. Market score — 0-100, plain language label
4. Metrics grid — 6 cards with directional change
5. Rate context — current rate, trend, Fed meeting
6. AI market summary — 2 paragraphs
7. Share / export / save

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
Scores: always labeled as AI estimates, not appraisals.

LOCALSTORAGE KEYS

vis-theme          — charcoal / black / light
vis-tier           — buyer / agent / enterprise
vis-sessions       — array of chat session objects
vis-saved-reports  — array of saved report objects
vis-subscription   — subscription status placeholder

Agent settings (logo, brand color, AI name, subdomain) live in
Supabase, not localStorage. They must be server-side for subdomain
routing to work.

CODING RULES — EVERY SESSION

1. Never hardcode hex colors. Always CSS variables.
2. Never hardcode data in components. Import from mockData.js.
3. Numbers always IBM Plex Mono. Text always DM Sans. No exceptions.
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

Session 1  — Environment: Vite, React, Tailwind, Supabase, GitHub, Vercel
Session 2  — Chat shell: thread, bubbles, input bar, typing indicator
Session 3  — Claude API + web search wired to chat
Session 4  — Chat session management: save, name, list, reopen
Session 5  — Suggested prompt chips on new chat
Session 6  — Inline data cards in chat thread
Session 7  — Generate Full Report button logic
Session 8  — Property Report view: full layout, mock data
Session 9  — Property facts block + user edit layer
Session 10 — Area market conditions block
Session 11 — Vis Property Score: circle, label, color logic
Session 12 — Loan calculator: inputs, monthly breakdown
Session 13 — AI property summary block
Session 14 — Market Conditions Report: full layout
Session 15 — Three tier system: vis-tier, feature gates per tier
Session 16 — Supabase schema: agents, agent_training, brokerages tables
Session 17 — Agent settings page: AI name, logo upload, brand color,
             subdomain claim and availability check
Session 18 — AI training page: text box, document upload, doc extraction,
             save to Supabase, preview button
Session 19 — Subdomain routing: Vercel wildcard domain config,
             subdomainLoader.js, AgentContext, branding application
Session 20 — Agent branded chat UI: logo replaces V, AI name applied,
             brand color applied, Vis invisible
Session 21 — Agent branded reports: agent logo, name, no Vis mention
Session 22 — Enterprise brokerage URL + brokerage training baseline
Session 23 — Agent sub-URLs under brokerage subdomain
Session 24 — Combined system prompt: brokerage layer + agent layer
Session 25 — White label report footers: no Vis on agent/enterprise
Session 26 — Send to Client button (Agent + Enterprise)
Session 27 — Buyer tier branding + usage limit UI
Session 28 — Share / export / save: link, PDF, save to sessions
Session 29 — Settings page: theme, account, subscription status
Session 30 — Subscription gate: paywall, upgrade prompts on limit hit
Session 31 — Theme system: Charcoal, True Black, Light switcher
Session 32 — Mobile optimization: responsive pass all pages
Session 33 — Performance + error handling: loading states, fallbacks
Session 34 — Beta deployment + feedback collection
Session 35 — Bug fixes + launch prep

CURRENT SESSION STATUS

Update this section at the end of every session.

Last completed: Session 2 — Chat shell
Current status: Chat shell renders on vis.realestate; stub AI reply
demonstrates the bubble + typing-indicator loop
Next task: Session 3 — Claude API + web search wired to chat (replace
stub reply with real Claude calls via src/utils/claudeApi.js)
Known issues: None

Done so far (covers both Session 1 work from prior commit and
Session 2 from this commit):
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
Default API model: claude-opus-4-7. Do not scope creep into a
dashboard. AgentContext + subdomain routing land in Session 19, not
earlier — vis.realestate is the only branding context until then.
