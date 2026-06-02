function WhiteLabelHeader({ reportType = "Property Report" }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 0",
        borderBottom: "1px solid var(--border)",
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "var(--accent)",
            color: "#ffffff",
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: 13,
            lineHeight: 1,
          }}
        >
          V
        </span>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 800,
            fontSize: 18,
            color: "var(--white)",
            letterSpacing: "-0.01em",
            lineHeight: 1,
          }}
        >
          vis
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 400,
              fontSize: 10,
              color: "var(--muted)",
              marginLeft: 2,
            }}
          >
            .realestate
          </span>
        </span>
      </div>

      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--muted)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {reportType}
      </span>
    </header>
  );
}

export default WhiteLabelHeader;
