import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SECTION_DEFS = {
  property: [
    { id: "estimated_value",  label: "Estimated Value" },
    { id: "property_facts",   label: "Property Facts" },
    { id: "market_conditions",label: "Area Market Conditions" },
    { id: "loan_calculator",  label: "Loan Calculator" },
    { id: "ai_summary",       label: "AI Analysis" },
  ],
  market: [
    { id: "market_data",  label: "Market Data" },
    { id: "rate_context", label: "Rate Context" },
    { id: "ai_summary",   label: "AI Analysis" },
  ],
  investor: [
    { id: "deal_analysis",        label: "Deal Analysis" },
    { id: "returns_breakdown",    label: "Returns Breakdown" },
    { id: "rental_comps",         label: "Rental Comp Summary" },
    { id: "cash_flow_projection", label: "12-Month Cash Flow Projection" },
    { id: "ai_summary",           label: "AI Analysis" },
  ],
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { description, reportType = "property" } = req.body || {};
  if (!description?.trim()) return res.status(400).json({ error: "Description is required" });

  const sections = SECTION_DEFS[reportType] || SECTION_DEFS.property;
  const sectionList = sections.map(s => `- ${s.id}: ${s.label}`).join("\n");

  const prompt = `You are a report template generator for a real estate AI tool called Vis.

An agent described their ideal ${reportType} report. Generate a JSON template from their description.

Available sections:
${sectionList}

Agent description:
"${description}"

Return ONLY valid JSON — no markdown, no explanation:
{
  "name": "short descriptive name (3-5 words)",
  "sections": [
    { "id": "section_id", "label": "Section Label", "included": true, "order": 1 }
  ],
  "aiTone": "professional|concise|conversational|detailed",
  "aiInstructions": "1-3 sentences of specific tone, focus, or constraints for AI-generated content"
}

Rules:
- Include ALL available sections — set included: true/false based on the description
- Order them logically (1 = first)
- aiTone must be one of the four options
- Default to including all sections if the agent didn't mention a section
- aiInstructions captures any emphasis, length constraints, or audience the agent mentioned`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content.find(b => b.type === "text")?.text || "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(502).json({ error: "AI returned invalid response" });

    const template = JSON.parse(match[0]);

    const labelMap = Object.fromEntries(sections.map(s => [s.id, s.label]));
    template.sections = (template.sections || []).map((s, i) => ({
      ...s,
      label: labelMap[s.id] || s.label || s.id,
      order: s.order ?? i + 1,
    }));
    template.reportType = reportType;
    template.description = description;

    res.json({ template });
  } catch (err) {
    console.error("generate-template error:", err.message);
    res.status(502).json({ error: "Failed to generate template" });
  }
}
