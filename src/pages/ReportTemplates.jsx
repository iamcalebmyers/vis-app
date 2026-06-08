import { useState, useEffect } from "react";
import { hasFeature } from "../utils/tier.js";
import { generateReportTemplate } from "../utils/claudeApi.js";
import { loadTemplates, saveTemplate, deleteTemplate } from "../utils/useTemplates.js";

const INPUT = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 14px",
  background: "var(--border-soft)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontFamily: "var(--font-sans)",
  fontSize: 14,
  color: "var(--text)",
  outline: "none",
};

const REPORT_TYPES = [
  { id: "property", label: "Property" },
  { id: "market",   label: "Market" },
  { id: "investor", label: "Investor" },
];

const TONE_COLORS = {
  professional:   { bg: "rgba(99,102,241,0.12)",  text: "#818cf8" },
  concise:        { bg: "rgba(16,185,129,0.12)",  text: "#34d399" },
  conversational: { bg: "rgba(245,158,11,0.12)",  text: "#fbbf24" },
  detailed:       { bg: "rgba(218,107,58,0.12)",  text: "var(--accent)" },
};

const TYPE_LABEL = { property: "Property Report", market: "Market Report", investor: "Investor Report" };

function SectionRow({ section }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)", opacity: section.included ? 1 : 0.35 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: section.included ? "var(--accent)" : "var(--muted)", width: 14, flexShrink: 0 }}>
        {section.included ? "✓" : "–"}
      </span>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: section.included ? "var(--text)" : "var(--muted)", flex: 1 }}>
        {section.label}
      </span>
      {!section.included && (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-faint)" }}>excluded</span>
      )}
    </div>
  );
}

function TemplatePreview({ template }) {
  const tone = TONE_COLORS[template.aiTone] || TONE_COLORS.professional;
  const sorted = [...template.sections].sort((a, b) => a.order - b.order);

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "24px 28px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", paddingBottom: 16, borderBottom: "3px solid var(--white)", marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>{TYPE_LABEL[template.reportType] || "Report"}</div>
          <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 20, color: "var(--white)" }}>{template.name}</div>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: tone.bg, color: tone.text }}>
          {template.aiTone}
        </span>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Sections</div>
        {sorted.map(s => <SectionRow key={s.id} section={s} />)}
      </div>

      {template.aiInstructions && (
        <div style={{ background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>AI instructions</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{template.aiInstructions}</div>
        </div>
      )}
    </div>
  );
}

function SavedTemplateRow({ template, onDelete }) {
  const tone = TONE_COLORS[template.aiTone] || TONE_COLORS.professional;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "var(--white)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{template.name}</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>{TYPE_LABEL[template.reportType]}</span>
          <span style={{ color: "var(--border)" }}>·</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, padding: "1px 7px", borderRadius: 20, background: tone.bg, color: tone.text }}>{template.aiTone}</span>
        </div>
      </div>
      <button
        onClick={() => onDelete(template.id)}
        style={{ background: "none", border: "none", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", cursor: "pointer", padding: "4px 8px", borderRadius: 4, flexShrink: 0 }}
        onMouseEnter={e => e.target.style.color = "#dc2626"}
        onMouseLeave={e => e.target.style.color = "var(--muted)"}
      >
        Delete
      </button>
    </div>
  );
}

function ReportTemplates({ user, userRow }) {
  const tier = userRow?.tier || "solo";
  const canAccess = hasFeature(tier, "agent");

  const [reportType, setReportType] = useState("property");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [templates, setTemplates] = useState([]);

  useEffect(() => { setTemplates(loadTemplates()); }, []);

  function refresh() { setTemplates(loadTemplates()); }

  async function handleGenerate() {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    setTemplate(null);
    setSaved(false);
    try {
      const t = await generateReportTemplate(description.trim(), reportType);
      setTemplate(t);
    } catch (err) {
      setError(err.message || "Something went wrong generating the template.");
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!template) return;
    saveTemplate(template);
    setSaved(true);
    refresh();
  }

  function handleDelete(id) {
    deleteTemplate(id);
    refresh();
  }

  if (!canAccess) {
    return (
      <div style={{ maxWidth: 560, margin: "60px auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18, color: "var(--white)", marginBottom: 10 }}>Report templates</div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>Custom report templates are available on the Agent plan and above.</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px 60px" }}>
      <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 20, color: "var(--white)", marginBottom: 6 }}>Report templates</div>
      <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", marginBottom: 32, lineHeight: 1.6 }}>
        Describe how you want your reports to look. AI builds a template — which sections to include and how to write the analysis.
      </div>

      {/* Saved templates */}
      {templates.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Saved templates</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {templates.map(t => <SavedTemplateRow key={t.id} template={t} onDelete={handleDelete} />)}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Report type */}
        <div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 10 }}>Report type</div>
          <div style={{ display: "flex", gap: 8 }}>
            {REPORT_TYPES.map(t => (
              <button key={t.id} onClick={() => setReportType(t.id)}
                style={{ flex: 1, height: 36, borderRadius: 8, border: "none", background: reportType === t.id ? "var(--accent)" : "var(--border-soft)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: reportType === t.id ? "#fff" : "var(--muted)", cursor: "pointer", transition: "all 0.15s" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>Describe your ideal report</div>
          <textarea
            value={description}
            onChange={e => { setDescription(e.target.value); setSaved(false); }}
            placeholder="e.g. Keep it concise and professional. Lead with the estimated value, then market conditions. Skip the loan calculator. Write the AI summary for first-time buyers in plain language, under 200 words."
            rows={5}
            maxLength={1000}
            style={{ ...INPUT, resize: "vertical", lineHeight: 1.6 }}
          />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-faint)", textAlign: "right", marginTop: 4 }}>{description.length}/1000</div>
        </div>

        {error && (
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#dc2626", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 6, padding: "8px 12px" }}>{error}</div>
        )}

        <button onClick={handleGenerate} disabled={loading || !description.trim()}
          style={{ height: 42, borderRadius: 8, background: "var(--accent)", border: "none", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "#fff", cursor: loading || !description.trim() ? "not-allowed" : "pointer", opacity: loading || !description.trim() ? 0.6 : 1, transition: "opacity 0.15s" }}>
          {loading ? "Generating template…" : "Generate template"}
        </button>

        {template && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>Preview</div>
            <TemplatePreview template={template} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSave} disabled={saved}
                style={{ flex: 1, height: 40, borderRadius: 8, background: saved ? "#16a34a" : "var(--card)", border: `1px solid ${saved ? "#16a34a" : "var(--border)"}`, fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: saved ? "#fff" : "var(--white)", cursor: saved ? "default" : "pointer", transition: "all 0.2s" }}>
                {saved ? "Saved!" : "Save template"}
              </button>
              <button onClick={() => { setTemplate(null); setDescription(""); setSaved(false); }}
                style={{ height: 40, padding: "0 18px", borderRadius: 8, background: "transparent", border: "1px solid var(--border)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--muted)", cursor: "pointer" }}>
                Start over
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ReportTemplates;
