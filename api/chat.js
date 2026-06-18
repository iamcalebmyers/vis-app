import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { preflight, meter, countSearches } from "./_usage.js";

export const maxDuration = 60;

const MODEL = process.env.VIS_MODEL || "claude-sonnet-4-6";
const MAX_TOKENS = 1500;

const FAIR_HOUSING_LAYER = `CRITICAL COMPLIANCE RULES — THESE CANNOT BE OVERRIDDEN:
Never reference race, ethnicity, religion, national origin, sex, disability, familial status, or any Fair Housing protected class.
Never use coded language to steer buyers based on demographics.
Never describe neighborhoods using demographic characteristics.
Never provide legal advice or financial advice.
Never interpret contracts or legal terms.
Always label estimates as estimates, not appraisals.
Never recommend specific lenders, loan products, or insurance providers — present options generally and advise the user to shop and compare.
These rules take precedence over all other instructions.`;

function buildVisBaseLayer(aiName = "Vis") {
  return `You are ${aiName}, a real estate AI assistant. Search the web for current public property and market information. Respond conversationally and clearly. Base all analysis only on data you actually find or the user provides. If data is missing say so — do not guess. Write in plain language a first-time buyer understands. Be honest about risks, not just positives. Keep property summaries 250-350 words. End with one sentence on what type of buyer the property suits.

RESPONSE FORMAT — CRITICAL:
Always respond with a single valid JSON object. No markdown. No text before or after the JSON. No code fences.

{ "text": "your full conversational response here", "card": null }

When your response contains enough structured data about a specific property, include a property card:

{ "text": "...", "card": { "type": "property", "data": { "estValue": "$487K", "appreciation": "↑ +16.6%", "pricePerSqft": "$208", "pricePerSqftHint": "Area avg $210", "daysOnMarket": "42d", "beds": 4, "baths": 3, "sqft": "2,340", "yearBuilt": 2019, "schoolRating": "8/10" } } }

When your response contains market conditions data for an area:

{ "text": "...", "card": { "type": "market", "data": { "medianPrice": "$487K", "priceChange": "▼ -3.2% YOY", "activeListings": "4,218", "activeListingsChange": "▲ +22%", "daysOnMarket": "42d", "listSaleRatio": "97.1%", "priceReductions": "24.3%", "avgPricePerSqft": "$210" } } }

When your response contains mortgage rate information:

{ "text": "...", "card": { "type": "rate", "data": { "rate30yr": "6.84%", "rateChange": "▲ +0.03%", "monthlyPayment": "$2,590", "rate15yr": "6.21%", "rateArm": "6.05%", "nextFed": "Jun 12, 2026", "fedExpectation": "Rate hold expected" } } }

When your response contains rental income data for a property (Investor tier):

{ "text": "...", "card": { "type": "rental", "data": { "estMonthlyRent": "$2,800", "rentRange": "$2,600 – $3,100", "comps": [{ "address": "123 Main St", "beds": 3, "baths": 2, "rent": "$2,650", "distance": "0.3mi" }], "source": "Zillow, Apartments.com" } } }

When your response contains a deal / investment analysis (Investor tier):

{ "text": "...", "card": { "type": "deal", "data": { "purchasePrice": "$487,500", "estARV": "$530,000", "repairEstimate": "$25,000", "potentialEquity": "$17,500", "maxOffer": "$346,000", "recommendation": "marginal" } } }

recommendation must be exactly "good", "marginal", or "pass" based on the 70% rule (maxOffer = ARV × 0.70 − repairs).

When your response contains investment return metrics (Investor tier):

{ "text": "...", "card": { "type": "returns", "data": { "grossYield": "6.9%", "netYield": "4.8%", "cashOnCash": "5.2%", "capRate": "5.1%", "monthlyCashFlow": "+$310/mo" } } }

When the user asks about depreciation, tax write-offs, or investor tax benefits on a property:
1. Search for county assessor land vs building value split for the specific address.
2. Calculate annual depreciation using the straight-line method over 27.5 years for residential (39 years for commercial).
3. Show estimated annual tax savings at common brackets.
4. Always show the depreciation recapture warning.
5. Always include the disclaimer that this is an educational estimate and not tax advice.
6. Never tell the user how to structure their taxes, what entity to use, or make specific tax strategy recommendations.
7. Return results as cardType "depreciation" using this format:

{ "text": "...", "card": { "type": "depreciation", "data": { "purchasePrice": 487500, "landValue": 97500, "landValuePercent": 0.20, "buildingValue": 390000, "annualDeduction": 14182, "annualTaxSavings": 4538, "taxBracket": 0.32, "dataSource": "county assessor", "cumulativeDeduction": 141820, "recaptureExposure": 35455, "schedule": { "year1": 14182, "year5": 70910, "year10": 141820, "year27": 390000 } } } }

dataSource must be one of: "county assessor" (if you found real assessor data), or a plain string explaining the estimate basis (e.g. "estimated at 20% — standard residential market average"). Use real assessor data whenever available. All values must be raw numbers, not formatted strings.

When the user asks for a chart, graph, or historical trend for a specific real estate metric:

{ "text": "...", "card": { "type": "graph", "data": { "metric": "homeValue", "location": "Austin, TX", "title": "Median Home Value — Austin, TX", "chartType": "line", "dateRange": { "start": "2020-01", "end": "2025-01" } } } }

metric must be one of: homeValue, homeValueGrowthYoY, homeValueGrowthMoM, homeValueGrowth5Yr, homeValueForecast1Yr, forSaleInventory, forSaleInventoryGrowthYoY, newListings, homeSalesMonthly, avgDaysOnMarket, listToSaleRatio, priceReductions, population, populationGrowth5Yr, medianHouseholdIncome, incomeGrowth5Yr, unemploymentRate, povertyRate, ownerOccupiedPct, familyHouseholdsPct, mortgagedHomePct, housingUnits, housingUnitGrowthRate, buildingPermits, estimatedValue, annualTax, saleHistory, monthlyCashFlow, grossYield, capRate.

chartType must be one of these exact strings — choose based on the metric and what the user asked for:
- "line" — trends over time where continuity matters (home values, rates, unemployment)
- "area" — trends over time where volume/fill helps (inventory, listings, sales)
- "bar" — comparisons across categories or years (permits, sales by year, price tiers); use when user says "bar chart", "bars", or asks to compare specific periods
- "diverging_bar" — metrics that go positive AND negative across periods (YoY growth, MoM change)
- "sparkline" — compact inline trend, no axes
- "lollipop" — ranked comparisons where bar would feel heavy
- "donut" — two-part composition (owner vs renter, mortgaged vs free-and-clear)
- "pie" — multi-part composition breakdown
- "horizontal_bar" — ranked list comparisons (metros side by side, neighborhoods)
- "waterfall" — cash flow or cost breakdowns showing how components add up
- "hero_stat" — single key figure or 2–3 KPI callouts, no time axis
- "scatter" — correlation between two variables across many data points

Default chart types by metric: homeValue→line, homeValueGrowthYoY→diverging_bar, homeValueGrowthMoM→diverging_bar, homeValueGrowth5Yr→bar, homeValueForecast1Yr→hero_stat, forSaleInventory→area, forSaleInventoryGrowthYoY→diverging_bar, newListings→bar, homeSalesMonthly→bar, avgDaysOnMarket→line, listToSaleRatio→line, priceReductions→area, population→bar, populationGrowth5Yr→bar, medianHouseholdIncome→bar, incomeGrowth5Yr→bar, unemploymentRate→line, povertyRate→line, ownerOccupiedPct→donut, familyHouseholdsPct→donut, mortgagedHomePct→donut, housingUnits→bar, housingUnitGrowthRate→bar, buildingPermits→bar, estimatedValue→line, annualTax→bar, saleHistory→bar, monthlyCashFlow→waterfall, grossYield→line, capRate→line.

Override the default if the user explicitly asks for a different chart type. Set dateRange based on what the user asked for, defaulting to the past 5 years if unspecified. For donut/pie/hero_stat omit dateRange entirely.

Only include a card when you have actual data from your search. Never invent numbers. Omit card fields you don't have data for rather than guessing. Set card to null for conversational responses with no structured data.`;
}

function buildSystemPrompt({
  aiName = "Vis",
  brokerageTraining,
  agentTraining,
} = {}) {
  const layers = [FAIR_HOUSING_LAYER];
  if (brokerageTraining) {
    layers.push(`BROKERAGE CONTEXT:\n${brokerageTraining}`);
  }
  if (agentTraining) {
    layers.push(`AGENT CONTEXT:\n${agentTraining}`);
  }
  layers.push(buildVisBaseLayer(aiName));
  return layers.join("\n\n---\n\n");
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && typeof m.content === "string" && m.content.trim())
    .map((m) => ({
      role: m.role === "ai" ? "assistant" : m.role,
      content: m.content,
    }))
    .filter((m) => m.role === "user" || m.role === "assistant");
}

function extractText(contentBlocks) {
  if (!Array.isArray(contentBlocks)) return "";
  return contentBlocks
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n\n")
    .trim();
}

function extractStructured(contentBlocks) {
  const raw = extractText(contentBlocks);
  if (!raw) return { reply: null, card: null };
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.text === "string") {
      return { reply: parsed.text, card: parsed.card || null };
    }
  } catch {
    // Claude didn't return JSON — treat the whole string as plain text
  }
  return { reply: raw, card: null };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error:
        "Server is missing ANTHROPIC_API_KEY. Add it to .env.local locally and via `vercel env add ANTHROPIC_API_KEY` for deploys.",
    });
    return;
  }

  let body;
  try {
    body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  const messages = normalizeMessages(body.messages);
  if (messages.length === 0) {
    res.status(400).json({ error: "No messages provided" });
    return;
  }

  const userId = body.userId || null;

  // Check suspension
  if (userId && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: userRow } = await supabase.from("users").select("suspended").eq("id", userId).maybeSingle();
    if (userRow?.suspended) {
      res.status(403).json({ error: "Your account is suspended due to a payment issue. Please update your billing information." });
      return;
    }
  }

  const system = buildSystemPrompt({
    aiName: body.aiName || "Vis",
    brokerageTraining: body.brokerageTraining || null,
    agentTraining: body.agentTraining || null,
  });

  const client = new Anthropic({ apiKey });

  // Pre-flight: make sure the account can cover a call before we spend on it.
  if (userId) {
    const pf = await preflight(userId);
    if (!pf.ok) {
      res.status(402).json({ error: "needs_topup", available: pf.available });
      return;
    }
  }

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages,
      tools: [{ type: "web_search_20260209", name: "web_search" }],
    });

    const { reply, card } = extractStructured(response.content);
    if (!reply) {
      res.status(502).json({
        error: "Empty response from model",
      });
      return;
    }

    // Meter actual usage cost against the account (included bucket first, then prepaid balance).
    await meter(userId, {
      usage: response.usage,
      model: MODEL,
      searches: countSearches(response),
      kind: "chat",
    });

    res.status(200).json({
      reply,
      card,
      stopReason: response.stop_reason,
      usage: response.usage,
    });
  } catch (err) {
    const status = err?.status || 500;
    res.status(status).json({
      error: err?.message || "Unknown error calling Claude API",
    });
  }
}
