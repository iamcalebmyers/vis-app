import { useState } from "react";

function GenerateReportButton({ onClick, label = "Generate Full Report" }) {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%",
        marginTop: 10,
        padding: "10px 0",
        background: hover ? "var(--accent)" : "transparent",
        color: hover ? "#ffffff" : "var(--accent)",
        border: "1.5px solid var(--accent)",
        borderRadius: 6,
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.01em",
        cursor: "pointer",
        transition: "background 0.15s ease, color 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}

export default GenerateReportButton;
