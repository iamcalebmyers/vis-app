import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const MODEL = "claude-opus-4-7";
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

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    });

    const { reply, card } = extractStructured(response.content);
    if (!reply) {
      res.status(502).json({
        error: "Empty response from model",
      });
      return;
    }

    // Increment usage
    if (userId && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const { data: userRow } = await supabase.from("users").select("usage_current, usage_limit, overage_rate, overage_accrued").eq("id", userId).maybeSingle();
      if (userRow) {
        const newUsage = (userRow.usage_current || 0) + 1;
        const overLimit = userRow.usage_limit && newUsage > userRow.usage_limit;
        const updates = { usage_current: newUsage, last_active_at: new Date().toISOString() };
        if (overLimit && userRow.overage_rate) {
          updates.overage_accrued = (userRow.overage_accrued || 0) + userRow.overage_rate;
        }
        await supabase.from("users").update(updates).eq("id", userId);
      }
    }

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
