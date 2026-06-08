import { useState } from "react";

function TipBubble({ text }) {
  return (
    <span
      className="vis-no-export"
      style={{
        position: "absolute",
        bottom: "calc(100% + 6px)",
        left: 0,
        background: "rgba(20,20,20,0.93)",
        color: "#f0ede9",
        fontFamily: "var(--font-sans)",
        fontSize: 11,
        fontWeight: 400,
        lineHeight: 1.5,
        padding: "7px 11px",
        borderRadius: 7,
        maxWidth: 260,
        zIndex: 50,
        pointerEvents: "none",
        whiteSpace: "normal",
        boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
      }}
    >
      {text}
    </span>
  );
}

// Drop-in replacement for a report <tr> with an optional hover tooltip on the label.
function TipRow({ label, value, tip, labelStyle, valueStyle, extraCells }) {
  const [show, setShow] = useState(false);
  return (
    <tr
      onMouseEnter={() => tip && setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <td style={{ ...labelStyle, position: "relative" }}>
        {label}
        {tip && show && <TipBubble text={tip} />}
      </td>
      {extraCells}
      <td style={valueStyle}>{value}</td>
    </tr>
  );
}

export { TipBubble, TipRow };
