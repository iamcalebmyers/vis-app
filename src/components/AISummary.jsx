import { useState, useEffect } from "react";

function Bullet({ children, tone }) {
  return (
    <li style={{ position: "relative", paddingLeft: 18, marginBottom: 8, fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text)", lineHeight: 1.5 }}>
      <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 8, width: 6, height: 6, borderRadius: 3, background: tone === "risk" ? "var(--muted)" : "var(--accent)" }} />
      {children}
    </li>
  );
}

function Section({ title, items, tone }) {
  if (!items?.length) return null;
  return (
    <div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
        {title}
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item, i) => <Bullet key={i} tone={tone}>{item}</Bullet>)}
      </ul>
    </div>
  );
}

function AISummary({ summary, strengths, risks, bestSuitedFor, aiName = "Vis" }) {
  const [editedSummary, setEditedSummary] = useState(summary || "");
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    setEditedSummary(summary || "");
    setIsModified(false);
  }, [summary]);

  function handleChange(e) {
    setEditedSummary(e.target.value);
    setIsModified(e.target.value !== summary);
  }

  return (
    <section style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {aiName} AI Analysis
        </div>
        {isModified && (
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, color: "var(--muted)", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 4, padding: "2px 7px", letterSpacing: "0.04em" }}>
            Modified
          </span>
        )}
      </div>

      {summary !== undefined && (
        <textarea
          value={editedSummary}
          onChange={handleChange}
          rows={6}
          style={{
            width: "100%",
            boxSizing: "border-box",
            fontFamily: "var(--font-sans)",
            fontSize: 15,
            color: "var(--text)",
            lineHeight: 1.65,
            marginBottom: 24,
            background: "transparent",
            border: "1px solid transparent",
            borderRadius: 6,
            padding: "6px 8px",
            resize: "vertical",
            outline: "none",
            transition: "border-color 0.15s ease, background 0.15s ease",
          }}
          onFocus={e => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "var(--border-soft)"; }}
          onBlur={e => { e.target.style.borderColor = "transparent"; e.target.style.background = "transparent"; }}
        />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: bestSuitedFor ? 24 : 0 }}>
        <Section title="Strengths" items={strengths} tone="strength" />
        <Section title="Risks" items={risks} tone="risk" />
      </div>

      {bestSuitedFor && (
        <div style={{ padding: 16, background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 10 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
            Best suited for
          </div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text)", lineHeight: 1.5 }}>
            {bestSuitedFor}
          </p>
        </div>
      )}
    </section>
  );
}

export default AISummary;
