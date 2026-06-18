import Anthropic from "@anthropic-ai/sdk";
import { preflight, meter, countSearches } from "./_usage.js";

export const maxDuration = 60;
const MODEL = process.env.VIS_MODEL || "claude-sonnet-4-6";

function buildPrompt({ metricLabel, location, dateRange, chartType, unit, companion, companionLabel }) {
  const loc = location || "the requested area";

  if (chartType === "donut" || chartType === "pie") {
    const items = companion
      ? `"${metricLabel}" and "${companionLabel}" (they should sum to ~100%)`
      : `"${metricLabel}" vs. its complement (e.g. mortgaged vs. free-and-clear)`;
    return `Find current breakdown data for ${items} in ${loc}.
Return ONLY valid JSON (no markdown, no preamble):
{"title":"[metric] — [location]","subtitle":"${loc} · as of [latest available date]","points":[{"label":"Name","value":number}],"source":"source name · month year"}
Use real data from a web search. Include 2–4 segments. Values should be percentages that sum to 100.`;
  }

  if (chartType === "scatter") {
    return `Find data comparing days-on-market versus median list price for different neighborhoods or zip codes in ${loc}.
Return ONLY valid JSON (no markdown, no preamble):
{"title":"Price vs. Days on Market — ${loc}","subtitle":"${loc} · as of [latest available]","points":[{"label":"Area Name","x":daysOnMarket,"y":medianPrice}],"source":"source · date"}
Include 6–15 data points from real web search results.`;
  }

  if (chartType === "heatmap") {
    const start = dateRange?.start ? dateRange.start.slice(0, 4) : new Date().getFullYear() - 4;
    const end = dateRange?.end ? dateRange.end.slice(0, 4) : new Date().getFullYear();
    return `Find monthly ${metricLabel} data for ${loc} for ${start}–${end}.
Return ONLY valid JSON (no markdown, no preamble):
{"title":"${metricLabel} Heat Map — ${loc}","subtitle":"${loc} · ${start}–${end}","points":[{"row":"Jan","col":"${start}","value":number}],"source":"source · date"}
Row = month abbreviation (Jan–Dec). Col = 4-digit year. Include all months available.`;
  }

  if (chartType === "hero_stat") {
    return `Find the most recent ${metricLabel} figure(s) for ${loc}.
Return ONLY valid JSON (no markdown, no preamble):
{"title":"${metricLabel} — ${loc}","subtitle":"${loc} · as of [date]","points":[{"label":"metric name","value":number,"context":"as of [date]"}],"source":"source · date"}
Include 1–3 key figures. Values must be numbers (no units in the value field).`;
  }

  if (chartType === "diverging_bar") {
    const start = dateRange?.start
      ? new Date(dateRange.start).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : "5 years ago";
    const end = dateRange?.end
      ? new Date(dateRange.end).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : "now";
    return `Find historical data for ${metricLabel} in ${loc} from ${start} to ${end}.
Return ONLY valid JSON (no markdown, no preamble):
{"title":"${metricLabel} — ${loc}","subtitle":"${loc} · ${start} – ${end}","points":[{"label":"MMM YYYY","value":number}],"source":"source name · date"}
IMPORTANT: Values must be signed numbers — negative when the metric declined, positive when it grew. Do not use absolute values. Unit is ${unit}. Include 6–16 data points at annual or quarterly intervals.`;
  }

  if (chartType === "waterfall") {
    return `Break down the components of ${metricLabel} for a typical property in ${loc}.
Return ONLY valid JSON (no markdown, no preamble):
{"title":"${metricLabel} Breakdown — ${loc}","subtitle":"${loc} · estimated","points":[{"label":"Gross Rent","value":number,"type":"start"},{"label":"Expense","value":-number,"type":"neg"},{"label":"Net","value":number,"type":"total"}],"source":"source · date"}
type must be "start" (first bar), "pos" (positive addition), "neg" (subtraction), or "total" (final result). Values are numbers (positive or negative).`;
  }

  const start = dateRange?.start
    ? new Date(dateRange.start).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "5 years ago";
  const end = dateRange?.end
    ? new Date(dateRange.end).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "now";

  return `Find historical data for ${metricLabel} in ${loc} from ${start} to ${end}.
Return ONLY valid JSON (no markdown, no preamble):
{"title":"${metricLabel} — ${loc}","subtitle":"${loc} · ${start} – ${end}","points":[{"label":"MMM YYYY","value":number}],"source":"source name · date"}
Use real data from a web search. Include 8–24 data points at monthly or quarterly intervals. Values must be raw numbers (no $ signs, no % symbols, no commas). Unit is ${unit}.`;
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

  const { metric, metricLabel, location, dateRange, chartType, unit, companion, companionLabel } = body;
  if (!metricLabel || !location) { res.status(400).json({ error: "metricLabel and location are required" }); return; }

  const prompt = buildPrompt({ metric, metricLabel, location, dateRange, chartType, unit, companion, companionLabel });

  if (body.userId) {
    const pf = await preflight(body.userId);
    if (!pf.ok) { res.status(402).json({ error: "needs_topup", available: pf.available }); return; }
  }

  const client = new Anthropic({ apiKey });
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: "You are a real estate data researcher. Always return only valid JSON matching the exact format requested. No markdown. No explanation. CRITICAL COMPLIANCE: Never reference race, ethnicity, religion, national origin, sex, disability, familial status, or any Fair Housing protected class.",
      messages: [{ role: "user", content: prompt }],
      tools: [{ type: "web_search_20260209", name: "web_search" }],
    });

    await meter(body.userId, { usage: response.usage, model: MODEL, searches: countSearches(response), kind: "graph" });

    const text = response.content.filter(b => b.type === "text").map(b => b.text).join("").trim();
    let parsed;
    try { parsed = extractJson(text); }
    catch { res.status(502).json({ error: "Model returned invalid JSON. Try again." }); return; }

    if (!parsed.points?.length) { res.status(502).json({ error: "No data points returned. Try a different date range or location." }); return; }

    res.status(200).json(parsed);
  } catch (err) {
    res.status(err?.status || 500).json({ error: err?.message || "Unknown error" });
  }
}
