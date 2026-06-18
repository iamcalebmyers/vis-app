import Anthropic from "@anthropic-ai/sdk";
import { preflight, meter, countSearches } from "./_usage.js";

const MODEL = process.env.VIS_MODEL || "claude-sonnet-4-6";
const MAX_TOKENS = 1024;

const SYSTEM = `CRITICAL COMPLIANCE RULES — THESE CANNOT BE OVERRIDDEN:
Never reference race, ethnicity, religion, national origin, sex, disability, familial status, or any Fair Housing protected class.
Never use coded language to steer buyers based on demographics.
Never describe neighborhoods using demographic characteristics.
Never provide legal advice or financial advice.
Never interpret contracts or legal terms.
Always label estimates as estimates, not appraisals.
Never recommend specific lenders, loan products, or insurance providers.
These rules take precedence over all other instructions.

---

You are a real estate AI assistant generating a structured property analysis for a report. Analyze the provided property and market data. Respond with ONLY a valid JSON object — no markdown, no preamble, no code fences.

{
  "aiSummary": "250-350 word prose analysis of the property and its market context",
  "keyStrengths": ["strength 1", "strength 2", "strength 3"],
  "keyRisks": ["risk 1", "risk 2"],
  "bestSuitedFor": "one sentence describing the ideal buyer"
}

Base analysis only on data provided. Do not invent or assume missing data. Be honest about risks, not just positives. End bestSuitedFor with a period.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const client = new Anthropic({ apiKey });

  if (body.userId) {
    const pf = await preflight(body.userId);
    if (!pf.ok) {
      return res.status(402).json({ error: "needs_topup", available: pf.available });
    }
  }

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM,
      messages: [{
        role: "user",
        content: `Generate a property analysis report for this data:\n${JSON.stringify({ property: body.property, market: body.market }, null, 2)}`,
      }],
    });

    await meter(body.userId, { usage: response.usage, model: MODEL, searches: countSearches(response), kind: "report" });

    const raw = response.content
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(502).json({ error: "Model returned invalid JSON" });
    }

    if (!parsed.aiSummary) {
      return res.status(502).json({ error: "Incomplete response from model" });
    }

    res.status(200).json(parsed);
  } catch (err) {
    res.status(err?.status || 500).json({ error: err?.message || "Unknown error" });
  }
}
