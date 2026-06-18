import { useState } from "react";
import PropertyReport from "./PropertyReport.jsx";
import MarketReport from "./MarketReport.jsx";
import InvestorReport from "./InvestorReport.jsx";
import Compare from "./Compare.jsx";
import ReportTemplates from "./ReportTemplates.jsx";
import { hasFeature, TIER_LABELS } from "../utils/tier.js";
import { MOCK_DEAL_CARD } from "../data/mockData.js";

const CARDS = [
  {
    id: "property",
    emblem: "◉",
    title: "Property Report",
    desc: "A full breakdown of a single property.",
    includes: "Vis Score · Property facts · Loan calculator · AI summary",
    minTier: "solo",
  },
  {
    id: "market",
    emblem: "◧",
    title: "Market Report",
    desc: "How an area is performing right now.",
    includes: "Market conditions · Trends · Demographics · Rate context",
    minTier: "solo",
  },
  {
    id: "investor",
    emblem: "◆",
    title: "Investor Report",
    desc: "The numbers behind a rental or flip.",
    includes: "Rental estimate · Returns · Deal analysis · Depreciation",
    minTier: "solo",
  },
  {
    id: "compare",
    emblem: "▤",
    title: "Compare Properties",
    desc: "Up to four properties, side by side.",
    includes: "Price · Cash flow · Yields · Cap rate · Export",
    minTier: "solo",
  },
  {
    id: "templates",
    emblem: "✎",
    title: "Custom Templates",
    desc: "Design how your reports look and read.",
    includes: "Sections · Tone · AI instructions",
    minTier: "agent",
  },
];

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ReportCard({ card, locked, onOpen }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "20px 22px",
        background: "var(--card)",
        border: `1px solid ${hover && !locked ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 12,
        cursor: "pointer",
        transition: "border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease",
        transform: hover && !locked ? "translateY(-2px)" : "none",
        boxShadow: hover && !locked ? "var(--shadow-card)" : "none",
        minHeight: 150,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span aria-hidden="true" style={{ width: 40, height: 40, borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center", fontSize: 20, lineHeight: 1 }}>
          {card.emblem}
        </span>
        {locked && (
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>
            <LockIcon />
            {TIER_LABELS[card.minTier]}
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 800, color: "var(--white)" }}>
          {card.title}
        </span>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", lineHeight: 1.45 }}>
          {card.desc}
        </span>
      </div>

      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-faint)", letterSpacing: "0.02em", lineHeight: 1.5 }}>
        {card.includes}
      </span>

      <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: locked ? "var(--muted)" : "var(--accent)" }}>
        {locked ? `Upgrade to ${TIER_LABELS[card.minTier]} →` : "Open report →"}
      </span>
    </button>
  );
}

function Hub({ tier, onSelect }) {
  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "32px 32px 48px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 800, color: "var(--white)", margin: 0 }}>
          Reports
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", margin: "6px 0 28px" }}>
          Choose a report to build. Each opens with the toggles and options for that type.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(248px, 1fr))", gap: 16 }}>
          {CARDS.map((card) => {
            const locked = !hasFeature(tier, card.minTier);
            return (
              <ReportCard
                key={card.id}
                card={card}
                locked={locked}
                onOpen={() => onSelect(card.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Reports({ user, userRow, tier = "solo" }) {
  const [view, setView] = useState(null);
  const back = () => setView(null);

  // Locked cards never open — guard in case a gated id is reached.
  const card = CARDS.find((c) => c.id === view);
  if (view && card && !hasFeature(tier, card.minTier)) {
    setView(null);
    return null;
  }

  switch (view) {
    case "property":
      return <PropertyReport onBack={back} user={user} userRow={userRow} />;
    case "market":
      return <MarketReport onBack={back} user={user} userRow={userRow} />;
    case "investor":
      return <InvestorReport data={MOCK_DEAL_CARD} onBack={back} user={user} userRow={userRow} />;
    case "compare":
      return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <CompareHeader onBack={back} />
          <div style={{ flex: 1, minHeight: 0 }}>
            <Compare />
          </div>
        </div>
      );
    case "templates":
      return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <CompareHeader onBack={back} />
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            <ReportTemplates user={user} userRow={userRow} />
          </div>
        </div>
      );
    default:
      return <Hub tier={tier} onSelect={setView} />;
  }
}

// Compare and ReportTemplates have no built-in back button (unlike the three
// report pages), so wrap them with a lightweight header.
function CompareHeader({ onBack }) {
  return (
    <div style={{ flexShrink: 0, padding: "14px 24px", borderBottom: "1px solid var(--border)" }}>
      <button type="button" onClick={onBack}
        style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--muted)", padding: 0, display: "flex", alignItems: "center", gap: 6 }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--white)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
        ← All reports
      </button>
    </div>
  );
}
