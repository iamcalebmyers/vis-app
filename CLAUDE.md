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
      TypingIndicator.jsx
      GenerateReportButton.jsx
      SessionSidebar.jsx
      PropertyReport.jsx
      MarketReport.jsx
      PropertyFacts.jsx
      MarketConditions.jsx
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
/* Light (default) — warm cream */
--bg:           #f7f6f3   /* page background */
--card:         #ffffff   /* cards, surfaces */
--card-tint:    #fff8f5   /* warm accent-tinted surface (headline stats) */
--border:       #e8e6e3   /* primary borders */
--border-soft:  #f0ede9   /* sidebar bg + tertiary borders + inset surfaces */
--muted:        #9b8ea0   /* labels */
--muted-soft:   #6b6560   /* secondary text */
--muted-faint:  #c0b8b4   /* timestamps, tertiary */
--text:         #2a2825   /* body text */
--white:        #1a1a18   /* strongest text — headlines, key values */
--accent:       #DA6B3A   /* brand orange */
--accent-soft:  rgba(218, 107, 58, 0.08)  /* halo / focus ring tint */
--shadow-card:  0 1px 3px rgba(0, 0, 0, 0.04)

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

- DM Sans: ALL labels, body text, buttons, nav, chat messages, summaries
- IBM Plex Mono: ALL numbers, data values, percentages, dollar amounts,
  dates in data context, URLs, codes
- Numbers always mono. Words always DM Sans.
- DM Sans weights used: 400, 700, 800
- IBM Plex Mono weights used: 400, 700

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

Two default report formats live alongside any custom templates an
agent builds (see Sessions 21.5 / 21.6 below):

A. Modern card layout (default — dark Vis aesthetic):
   1. White label header (branding per tier and URL context)
   2. Property header — address, stats row
   3. Property facts block — all key fields, unknown = "—"
   4. User edit layer — review/correct/add before finalizing
   5. Area market conditions — metric cards
   6. Loan calculator
   7. AI summary — 250-350 word prose
   8. Share / export / save
   9. Send to Client (Agent + Enterprise only)

B. Print / document layout (default — Georgia serif, white bg,
   formal table-driven aesthetic; see docs/vis_reporting.html):
   Same data, same section order, different visual treatment.
   Optimized for PDF export and formal sharing.

Market Conditions Report sections (order)

1. White label header
2. Area header — location, date
3. Metrics grid — 6 cards with directional change
4. Rate context — current rate, trend, Fed meeting
5. AI market summary — 2 paragraphs
6. Share / export / save

Market Report supports both default formats (A and B) too.

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
Session 5  — (removed: suggested prompt chips not wanted in Vis)
Session 6  — Inline data cards in chat thread
Session 7  — Generate Full Report button logic
Session 8  — Property Report view: full layout, mock data
Session 9  — Property facts block + user edit layer
Session 10 — Area market conditions block
Session 11 — (removed: Vis Property Score concept dropped — no scoring
              anywhere in the product)
Session 12 — Loan calculator: inputs, monthly breakdown
Session 13 — AI property summary block
Session 14 — Market Conditions Report: full layout (modern card)
Session 14.5 — AI response card emission: update system prompt + parse
               structured payload so real Claude replies attach a
               cardType + cardData to the message. Tuned live against
               the API once the key is in
Session 14.6 — Print/document report format (default #2): Georgia
               serif + white bg + table-driven layout, format selector
               at top of report views, both Property + Market reports
               support it. Reference: docs/vis_reporting.html
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
Session 21.5 — Custom template schema + AI-driven generation: define
               a JSON template schema (sections + which existing
               components + custom-section primitives); add a "Train
               Your Template" textarea where the agent describes the
               report they want; Claude converts the description into
               a valid template JSON; preview pane renders the result
Session 21.6 — Custom template storage + picker UI + reuse: Supabase
               agent_templates table; save / list / delete custom
               templates per agent; format/template picker at top of
               every report view shows the 2 defaults (Modern card +
               Print document) plus the agent's saved custom templates
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

Last completed: UI redesign — Light theme as default, new chat
patterns
Current status: Whole app moved to the new warm-light aesthetic.
Light is the default theme at :root; Charcoal + True Black are
opt-in via [data-theme]. New tokens (--card-tint, --border-soft,
--muted-soft, --muted-faint, --shadow-card, --accent-soft). Nav has
frosted backdrop + LIVE indicator. AI messages now show V avatar +
"Vis" name + relative timestamp above the bubble; bubbles use
asymmetric 4/14/14/14 radius with subtle shadow. ChatInput has
persistent disclaimer below. SessionSidebar in cream with dashed
"+ New chat" button. DataCard has tinted accent column on the
headline stat. GenerateReportButton is outlined (fills on hover).
Reports keep the same structure, now light. Empty state hero
unchanged in spirit, just light. Session 11 (VisScore) remains
removed.
Next task: Session 9 — Property facts inline edit layer (let user
correct or annotate any field; user additions labelled "added by
user")
Known issues / pending: ANTHROPIC_API_KEY still not configured;
chat-side AI replies surface a graceful error bubble until added.
File-structure deviation: PropertyReport.jsx + MarketReport.jsx live
in src/pages/ (page-shaped views) rather than src/components/ as the
spec lists them. All sub-components are in src/components/ per spec.
Known issues / pending:
  - **PENDING: ANTHROPIC_API_KEY not yet set.** User stepped away
    before adding the key. To resume: open
    /Users/calebmyers/projects/vis-app/.env.local in any editor and
    paste the key after `ANTHROPIC_API_KEY=`, then run
    `vercel env add ANTHROPIC_API_KEY` for Production / Preview /
    Development, then `vercel --prod` to redeploy. Until then, every
    chat send returns a graceful "ANTHROPIC_API_KEY missing" error
    bubble — UI works, model calls don't.
  - Test locally with `npm run dev:api` (not `npm run dev`) — vite
    alone cannot serve /api functions.
  - Web search is the only tool wired. Layer 2 (brokerage training)
    and Layer 3 (agent training) are accepted as inputs to api/chat
    but always null until Supabase + AgentContext arrive (Sessions
    16-19).

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
Default API model: claude-opus-4-7. Do not scope creep into a
dashboard. AgentContext + subdomain routing land in Session 19, not
earlier — vis.realestate is the only branding context until then.
