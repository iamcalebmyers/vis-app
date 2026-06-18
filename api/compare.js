import Anthropic from "@anthropic-ai/sdk";
import { preflight, meter, countSearches } from "./_usage.js";

export const maxDuration = 60;
const MODEL = process.env.VIS_MODEL || "claude-sonnet-4-6";

// Token-light by design: Claude returns ONLY raw web-sourced facts for one
// property (~10 fields). All derived metrics (yields, cap rate, cash-on-cash,
// cash flow, max offer) are computed client-side in computePropertyMetrics().
function buildPrompt(address) {
  return `Find current public facts for the property at "${address}".
Return ONLY valid JSON (no markdown, no preamble, no code fences):
{"address":"street address","city":"City","state":"ST","listPrice":number,"estimatedValue":number,"rentEstimate":number,"annualTax":number,"hoaMonthly":number,"sqft":number,"beds":number,"baths":number,"yearBuilt":number,"estARV":number,"source":"source name · month year"}

Rules:
- Use real data from a web search. Do not invent numbers.
- listPrice = current list price if actively listed; otherwise omit it.
- estimatedValue = best automated value estimate (Zestimate-style).
- rentEstimate = estimated MONTHLY market rent.
- annualTax = most recent annual property tax in dollars.
- hoaMonthly = monthly HOA dollars, or 0 if none.
- estARV = after-repair value if available, otherwise omit it.
- All numeric fields must be raw numbers (no $, %, or commas).
- Omit any field you cannot find rather than guessing. Always include address, city, state, and source.`;
}

function extractJson(text) {
  const clean = text.trim();
  const fenced = clean.match(/```(?:json)?\s*([\s\S]+?)```/);
  if (fenced) return JSON.parse(fenced[1].trim());
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start !== -1 && end !== -1) return JSON.parse(clean.slice(start, end + 1));
  return JSON.parse(clean);
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) { res.status(500).json({ error: "Missing ANTHROPIC_API_KEY" }); return; }

  let body;
  try { body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}; }
  catch { res.status(400).json({ error: "Invalid JSON body" }); return; }

  const address = (body.address || "").trim();
  if (!address) { res.status(400).json({ error: "address is required" }); return; }

  if (body.userId) {
    const pf = await preflight(body.userId);
    if (!pf.ok) { res.status(402).json({ error: "needs_topup", available: pf.available }); return; }
  }

  const client = new Anthropic({ apiKey });
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: "You are a real estate data researcher. Always return only valid JSON matching the exact format requested. No markdown. No explanation. CRITICAL COMPLIANCE: Never reference race, ethnicity, religion, national origin, sex, disability, familial status, or any Fair Housing protected class.",
      messages: [{ role: "user", content: buildPrompt(address) }],
      tools: [{ type: "web_search_20260209", name: "web_search" }],
    });

    await meter(body.userId, { usage: response.usage, model: MODEL, searches: countSearches(response), kind: "compare" });

    const text = response.content.filter(b => b.type === "text").map(b => b.text).join("").trim();
    let parsed;
    try { parsed = extractJson(text); }
    catch { res.status(502).json({ error: "Model returned invalid JSON. Try again." }); return; }

    if (!parsed.address) { res.status(502).json({ error: "Could not find facts for that address. Try a more specific address." }); return; }

    res.status(200).json(parsed);
  } catch (err) {
    res.status(err?.status || 500).json({ error: err?.message || "Unknown error" });
  }
}
