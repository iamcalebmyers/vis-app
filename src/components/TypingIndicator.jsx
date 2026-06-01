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
        alignItems: "flex-end",
        gap: 8,
        margin: "8px 0",
      }}
    >
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
          flexShrink: 0,
        }}
      >
        V
      </span>
      <div
        role="status"
        aria-label="Vis is typing"
        style={{
          background: "var(--card)",
          borderRadius: "0 10px 10px 10px",
          padding: "12px 14px",
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
