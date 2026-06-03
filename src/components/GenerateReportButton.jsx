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
        background: "var(--accent)",
        color: "#ffffff",
        border: "none",
        borderRadius: 6,
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.01em",
        cursor: "pointer",
        opacity: hover ? 0.88 : 1,
        transition: "opacity 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}

export default GenerateReportButton;
