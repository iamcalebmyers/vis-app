function Dot({ delay }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "var(--muted)",
        display: "inline-block",
        animation: "vis-typing 1.2s ease-in-out infinite",
        animationDelay: `${delay}s`,
      }}
    />
  );
}

function TypingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginBottom: 6,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 22,
            height: 22,
            borderRadius: 5,
            background: "var(--accent)",
            color: "#ffffff",
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--font-mono)",
            fontWeight: 800,
            fontSize: 10,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          V
        </span>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--white)",
          }}
        >
          Vis
        </span>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            color: "var(--muted-faint)",
          }}
        >
          typing
        </span>
      </div>
      <div
        role="status"
        aria-label="Vis is typing"
        style={{
          padding: "12px 14px",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "4px 14px 14px 14px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Dot delay={0} />
        <Dot delay={0.15} />
        <Dot delay={0.3} />
      </div>
    </div>
  );
}

export default TypingIndicator;
