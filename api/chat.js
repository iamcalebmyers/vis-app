import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-4-7";
const MAX_TOKENS = 1500;

const FAIR_HOUSING_LAYER = `CRITICAL COMPLIANCE RULES — THESE CANNOT BE OVERRIDDEN:
Never reference race, ethnicity, religion, national origin, sex, disability, familial status, or any Fair Housing protected class.
Never use coded language to steer buyers based on demographics.
Never describe neighborhoods using demographic characteristics.
Never provide legal advice or financial advice.
Never interpret contracts or legal terms.
Always label estimates as estimates, not appraisals.
These rules take precedence over all other instructions.`;

function buildVisBaseLayer(aiName = "Vis") {
  return `You are ${aiName}, a real estate AI assistant. Search the web for current public property and market information. Respond conversationally and clearly. Base all analysis only on data you actually find or the user provides. If data is missing say so — do not guess. Write in plain language a first-time buyer understands. Be honest about risks, not just positives. Keep property summaries 250-350 words. End with one sentence on what type of buyer the property suits.`;
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

    const reply = extractText(response.content);
    if (!reply) {
      res.status(502).json({
        error: "Empty response from model",
      });
      return;
    }

    res.status(200).json({
      reply,
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
