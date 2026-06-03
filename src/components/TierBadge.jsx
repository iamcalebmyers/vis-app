import { useEffect, useState } from "react";

const LABELS = {
  buyer: "Buyer",
  agent: "Agent",
  enterprise: "Enterprise",
};

function readTier() {
  try {
    const t = localStorage.getItem("vis-tier");
    return LABELS[t] ? t : "buyer";
  } catch {
    return "buyer";
  }
}

function TierBadge() {
  const [tier, setTier] = useState("buyer");

  useEffect(() => {
    setTier(readTier());
  }, []);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        padding: "0 9px",
        borderRadius: 20,
        background: "var(--card)",
        border: "1px solid var(--border)",
        color: "var(--muted-soft)",
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        fontSize: 10,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {LABELS[tier]}
    </span>
  );
}

export default TierBadge;
