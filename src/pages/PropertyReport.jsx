import { useState, useEffect } from "react";
import AISummary from "../components/AISummary.jsx";
import ShareExport from "../components/ShareExport.jsx";
import PropertyFacts from "../components/PropertyFacts.jsx";
import LoanCalculator from "../components/LoanCalculator.jsx";
import { TipRow } from "../components/ReportTooltip.jsx";
import { generatePropertySummary } from "../utils/claudeApi.js";
import { ReportFooterLine } from "../components/WhiteLabelHeader.jsx";
import ReportAgentHeader from "../components/ReportAgentHeader.jsx";
import TemplatePicker from "../components/TemplatePicker.jsx";
import { useAgentInfo } from "../utils/useAgentInfo.js";
import { sectionVisible } from "../utils/useTemplates.js";
import { MOCK_PROPERTY, MOCK_MARKET, MOCK_AI_RESPONSE } from "../data/mockData.js";
import { PROPERTY_MARKET_TIPS } from "../utils/tooltips.js";

const SEC = {
  fontFamily: "Arial, sans-serif",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--muted)",
  borderBottom: "2px solid var(--white)",
  paddingBottom: 6,
  marginBottom: 14,
};
const TD_L = {
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  color: "var(--muted)",
  padding: "10px 0",
  borderBottom: "1px solid var(--border)",
};
const TD_V = {
  fontFamily: "var(--font-mono)",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text)",
  textAlign: "right",
  padding: "10px 0",
  borderBottom: "1px solid var(--border)",
};

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", background: "var(--card)", color: "var(--muted-soft)", border: "1px solid var(--border)", borderRadius: 7, fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "color 0.15s ease, border-color 0.15s ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--white)"; e.currentTarget.style.borderColor = "var(--muted)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted-soft)"; e.currentTarget.style.borderColor = "var(--border)"; }}
    >
      <span aria-hidden="true">←</span> Back to chat
    </button>
  );
}

function PropertyReport({ data, onBack }) {
  const [agentInfo, setAgentInfo] = useAgentInfo();
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [includeAI, setIncludeAI] = useState(true);
  const [factOverrides, setFactOverrides] = useState({});
  function handleOverride(label, value) {
    setFactOverrides(prev => {
      if (value === undefined) { const n = { ...prev }; delete n[label]; return n; }
      return { ...prev, [label]: value };
    });
  }

  const property = MOCK_PROPERTY;
  const market = MOCK_MARKET;
  const [ai, setAi] = useState(MOCK_AI_RESPONSE);
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    generatePropertySummary(property, market)
      .then(setAi)
      .catch(() => { /* silently keep mock data on error */ })
      .finally(() => setAiLoading(false));
  }, []);

  const appreciation =
    property.prevSalePrice && property.estimatedValue
      ? (((property.estimatedValue - property.prevSalePrice) / property.prevSalePrice) * 100).toFixed(1)
      : null;

  const reportDate = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const marketMetrics = [
    { label: "Median price", value: `$${(market.medianPrice / 1000).toFixed(0)}K`, note: `${market.medianPriceChange > 0 ? "▲" : "▼"} ${Math.abs(market.medianPriceChange)}% YoY` },
    { label: "Days on market", value: `${market.avgDaysOnMarket}d`, note: `▲ +${market.avgDaysChange}d YoY` },
    { label: "Active listings", value: market.activeListings?.toLocaleString(), note: `▲ +${market.activeListingsChange}%` },
    { label: "List / Sale ratio", value: `${market.listToSaleRatio}%` },
    { label: "Price reductions", value: `${market.priceReductions}%` },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--bg)", zIndex: 5 }}>
        <BackButton onClick={onBack} />
        <span className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Property Report</span>
        <TemplatePicker reportType="property" selected={activeTemplate} onSelect={setActiveTemplate} />
        <label
          style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}
        >
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: includeAI ? "var(--text)" : "var(--muted)", transition: "color 0.15s ease" }}>
            AI Analysis
          </span>
          <input
            type="checkbox"
            checked={includeAI}
            onChange={() => setIncludeAI((v) => !v)}
            style={{ display: "none" }}
          />
          <div
            style={{
              width: 36,
              height: 20,
              borderRadius: 10,
              background: includeAI ? "var(--accent)" : "var(--border)",
              position: "relative",
              transition: "background 0.2s ease",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#ffffff",
                position: "absolute",
                top: 3,
                left: includeAI ? 19 : 3,
                transition: "left 0.2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        </label>
      </div>

      <main style={{ flex: 1, padding: "20px 20px 40px" }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "28px 32px", maxWidth: 900, margin: "0 auto" }}>

          {property.photoUrl && (
            <img src={property.photoUrl} alt="Property exterior" style={{ width: "100%", height: 260, objectFit: "cover", display: "block", marginBottom: 24 }} />
          )}

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 16, borderBottom: "3px solid var(--white)", marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>Property Report</div>
              <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 22, color: "var(--white)", margin: "0 0 4px" }}>{property.address}</h1>
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "var(--muted)" }}>{property.city}, {property.state} {property.zip} · {reportDate}</div>
            </div>
            <ReportAgentHeader info={agentInfo} onChange={setAgentInfo} />
          </div>

          {sectionVisible(activeTemplate, "estimated_value") && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 20px", marginBottom: 4 }}>
              <div>
                <div style={{ fontFamily: "Arial, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>Estimated Value</div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 30, color: "var(--accent)", letterSpacing: "-0.02em" }}>${property.estimatedValue?.toLocaleString()}</div>
                {property.estimatedValueRange && (
                  <div style={{ fontFamily: "Arial, sans-serif", fontSize: 12, color: "var(--muted)", marginTop: 3 }}>Range: ${property.estimatedValueRange.low?.toLocaleString()} — ${property.estimatedValueRange.high?.toLocaleString()}</div>
                )}
              </div>
              {appreciation && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: "var(--muted)" }}>Since purchase</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 22, color: "#059669" }}>+{appreciation}%</div>
                  <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: "var(--muted)" }}>${property.prevSalePrice?.toLocaleString()} → ${property.estimatedValue?.toLocaleString()}</div>
                </div>
              )}
            </div>
          )}

          {sectionVisible(activeTemplate, "property_facts") && (
            <PropertyFacts property={property} overrides={factOverrides} onOverride={handleOverride} />
          )}

          {sectionVisible(activeTemplate, "market_conditions") && (
            <div style={{ marginTop: 28 }}>
              <div style={SEC}>Area Market Conditions · {market.area}</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {marketMetrics.map((m) => (
                    <TipRow
                      key={m.label}
                      label={m.label}
                      value={<>{m.value}{m.note && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-soft)", marginLeft: 8 }}>{m.note}</span>}</>}
                      tip={PROPERTY_MARKET_TIPS[m.label]}
                      labelStyle={TD_L}
                      valueStyle={TD_V}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {sectionVisible(activeTemplate, "loan_calculator") && (
            <div style={{ marginTop: 28 }}>
              <div style={SEC}>Loan Estimate</div>
              <LoanCalculator property={property} market={market} />
            </div>
          )}

          {includeAI && sectionVisible(activeTemplate, "ai_summary") && (
            <div style={{ marginTop: 28 }}>
              <div style={SEC}>AI Analysis</div>
              {aiLoading ? (
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", padding: "16px 0", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "vis-typing 1s ease-in-out infinite" }} />
                  Generating analysis…
                </div>
              ) : (
                <AISummary summary={ai.aiSummary} strengths={ai.keyStrengths} risks={ai.keyRisks} bestSuitedFor={ai.bestSuitedFor} />
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 28, paddingTop: 14, borderTop: "1px solid var(--border)", fontFamily: "Arial, sans-serif", fontSize: 10, color: "var(--muted)", lineHeight: 1.8 }}>
            {property.dataSources?.length > 0 && (
              <div>Data sources: {property.dataSources.join(" · ")}</div>
            )}
            <ReportFooterLine />
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "16px auto 0" }}>
          <ShareExport />
        </div>
      </main>
    </div>
  );
}

export default PropertyReport;
