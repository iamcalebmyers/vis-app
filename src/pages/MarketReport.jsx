function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 30,
        padding: "0 12px",
        background: "var(--card)",
        color: "var(--muted-soft)",
        border: "1px solid var(--border)",
        borderRadius: 7,
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        transition: "color 0.15s ease, border-color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--white)";
        e.currentTarget.style.borderColor = "var(--muted)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--muted-soft)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <span aria-hidden="true">←</span>
      Back to chat
    </button>
  );
}

function MarketReport({ data, onBack }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <BackButton onClick={onBack} />
        <span
          className="mono"
          style={{
            fontSize: 11,
            color: "var(--muted)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Market Report
        </span>
      </div>

      <main
        style={{
          flex: 1,
          padding: "40px 20px",
          width: "100%",
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 800,
            fontSize: 32,
            color: "var(--white)",
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}
        >
          Market conditions report
        </h1>
        <p
          style={{
            color: "var(--muted)",
            fontFamily: "var(--font-sans)",
            fontSize: 15,
            marginBottom: 32,
          }}
        >
          Full layout lands in Session 14 — this is the Session 7 shell so
          the Generate Full Report button has somewhere to navigate to.
        </p>

        {data && (
          <pre
            style={{
              padding: 16,
              background: "var(--border-soft)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text)",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </main>
    </div>
  );
}

export default MarketReport;
