// Session 8: renders prose summary + strengths + risks + bestSuitedFor
// from MOCK_AI_RESPONSE. Session 13 wires real AI generation.

function Bullet({ children, tone }) {
  return (
    <li
      style={{
        position: "relative",
        paddingLeft: 18,
        marginBottom: 8,
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        color: "var(--text)",
        lineHeight: 1.5,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 8,
          width: 6,
          height: 6,
          borderRadius: 3,
          background: tone === "risk" ? "var(--muted)" : "var(--accent)",
        }}
      />
      {children}
    </li>
  );
}

function Section({ title, items, tone }) {
  if (!items?.length) return null;
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--muted)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item, i) => (
          <Bullet key={i} tone={tone}>
            {item}
          </Bullet>
        ))}
      </ul>
    </div>
  );
}

function AISummary({ summary, strengths, risks, bestSuitedFor, aiName = "Vis" }) {
  return (
    <section
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--muted)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        {aiName} AI Analysis
      </div>

      {summary && (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 15,
            color: "var(--text)",
            lineHeight: 1.65,
            marginBottom: 24,
          }}
        >
          {summary}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginBottom: bestSuitedFor ? 24 : 0,
        }}
      >
        <Section title="Strengths" items={strengths} tone="strength" />
        <Section title="Risks" items={risks} tone="risk" />
      </div>

      {bestSuitedFor && (
        <div
          style={{
            padding: 16,
            background: "var(--border-soft)",
            border: "1px solid var(--border)",
            borderRadius: 10,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--muted)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Best suited for
          </div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              color: "var(--text)",
              lineHeight: 1.5,
            }}
          >
            {bestSuitedFor}
          </p>
        </div>
      )}
    </section>
  );
}

export default AISummary;
