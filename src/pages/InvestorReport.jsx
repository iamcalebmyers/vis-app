import { useState } from "react";
import AISummary from "../components/AISummary.jsx";
import ShareExport from "../components/ShareExport.jsx";
import { TipRow } from "../components/ReportTooltip.jsx";
import { DEAL_TIPS, RETURNS_TIPS, PROJECTION_TIPS } from "../utils/tooltips.js";
import {
  MOCK_PROPERTY,
  MOCK_RENTAL_CARD,
  MOCK_RETURNS_CARD,
  MOCK_INVESTOR_AI,
} from "../data/mockData.js";
import { ReportFooterLine } from "../components/WhiteLabelHeader.jsx";
import ReportAgentHeader from "../components/ReportAgentHeader.jsx";
import { useAgent } from "../utils/AgentContext.jsx";

const SEC = { fontFamily: "Arial, sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", borderBottom: "2px solid var(--white)", paddingBottom: 6, marginBottom: 14 };
const TD_L = { fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", padding: "10px 0", borderBottom: "1px solid var(--border)" };
const TD_V = { fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--text)", textAlign: "right", padding: "10px 0", borderBottom: "1px solid var(--border)" };

const REC = {
  good:     { color: "#059669", label: "Good Deal" },
  marginal: { color: "#d97706", label: "Marginal"  },
  pass:     { color: "#dc2626", label: "Pass"      },
};

function BackButton({ onClick }) {
  return (
    <button type="button" onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", background: "var(--card)", color: "var(--muted-soft)", border: "1px solid var(--border)", borderRadius: 7, fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "color 0.15s ease, border-color 0.15s ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--white)"; e.currentTarget.style.borderColor = "var(--muted)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted-soft)"; e.currentTarget.style.borderColor = "var(--border)"; }}
    >
      <span aria-hidden="true">←</span> Back to chat
    </button>
  );
}

function InvestorReport({ data, onBack }) {
  const { isAgentDomain, aiName } = useAgent();
  const [agentInfo, setAgentInfo] = useState({ name: isAgentDomain ? aiName : "", brokerage: "", license: "", email: "", phone: "" });
  const [includeAI, setIncludeAI] = useState(true);

  const property = MOCK_PROPERTY;
  const deal = data || {};
  const rental = MOCK_RENTAL_CARD;
  const returns = MOCK_RETURNS_CARD;
  const ai = MOCK_INVESTOR_AI;

  const rec = REC[deal.recommendation] || REC.marginal;
  const reportDate = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const parseDollar = (str) => parseFloat(String(str).replace(/[^0-9.-]/g, "")) || 0;
  const monthlyRent = parseDollar(rental.estMonthlyRent);
  const monthlyCF = parseDollar(returns.monthlyCashFlow);
  const monthlyExp = Math.round(monthlyRent - monthlyCF);

  const summaryStats = [
    { label: "Purchase Price", value: deal.purchasePrice || "$487,500" },
    { label: "Est. Monthly Rent", value: rental.estMonthlyRent },
    { label: "Monthly Cash Flow", value: returns.monthlyCashFlow, accent: true },
    { label: "Gross Yield", value: returns.grossYield },
  ];

  const dealRows = [
    ["Purchase Price", deal.purchasePrice],
    ["Estimated ARV", deal.estARV],
    ["Repair Estimate", deal.repairEstimate],
    ["Max Offer (70% Rule)", deal.maxOffer],
    ["Potential Equity", deal.potentialEquity],
  ].filter(([, v]) => v);

  const returnsRows = [
    ["Gross Rental Yield", returns.grossYield],
    ["Net Rental Yield", returns.netYield],
    ["Cash-on-Cash Return", returns.cashOnCash],
    ["Cap Rate", returns.capRate],
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--bg)", zIndex: 5 }}>
        <BackButton onClick={onBack} />
        <span className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Investor Report</span>
        <label style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: includeAI ? "var(--text)" : "var(--muted)", transition: "color 0.15s ease" }}>AI Analysis</span>
          <input type="checkbox" checked={includeAI} onChange={() => setIncludeAI(v => !v)} style={{ display: "none" }} />
          <div style={{ width: 36, height: 20, borderRadius: 10, background: includeAI ? "var(--accent)" : "var(--border)", position: "relative", transition: "background 0.2s ease", flexShrink: 0 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: includeAI ? 19 : 3, transition: "left 0.2s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </div>
        </label>
      </div>

      <main style={{ flex: 1, padding: "20px 20px 40px" }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "28px 32px", maxWidth: 900, margin: "0 auto" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 16, borderBottom: "3px solid var(--white)", marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>Investor Report</div>
              <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 22, color: "var(--white)", margin: "0 0 4px" }}>{property.address}</h1>
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "var(--muted)" }}>{property.city}, {property.state} {property.zip} · {reportDate}</div>
            </div>
            <ReportAgentHeader info={agentInfo} onChange={setAgentInfo} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px", marginBottom: 4 }}>
            {summaryStats.map(({ label, value, accent }) => (
              <div key={label}>
                <div style={{ fontFamily: "Arial, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: accent ? 22 : 18, color: accent ? "var(--accent)" : "var(--white)", letterSpacing: "-0.01em", lineHeight: 1 }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 28 }}>
            <div style={{ ...SEC, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Deal Analysis</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, color: rec.color, background: `${rec.color}20`, padding: "2px 10px", borderRadius: 20, textTransform: "none", letterSpacing: 0 }}>{rec.label}</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {dealRows.map(([label, value]) => (
                  <TipRow key={label} label={label} value={value} tip={DEAL_TIPS[label]} labelStyle={TD_L} valueStyle={TD_V} />
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 28 }}>
            <div style={SEC}>Returns Breakdown</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {returnsRows.map(([label, value]) => (
                  <TipRow key={label} label={label} value={value} tip={RETURNS_TIPS[label]} labelStyle={TD_L} valueStyle={TD_V} />
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 28 }}>
            <div style={SEC}>Rental Comp Summary · {rental.estMonthlyRent}/mo est. ({rental.rentRange})</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {rental.comps?.map((c, i) => (
                  <tr key={i}>
                    <td style={TD_L}>{c.address} · {c.beds}bd / {c.baths}ba · {c.distance}</td>
                    <td style={TD_V}>{c.rent}/mo</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rental.source && <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", marginTop: 6 }}>Source: {rental.source}</div>}
          </div>

          <div style={{ marginTop: 28 }}>
            <div style={SEC}>12-Month Cash Flow Projection</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <TipRow
                  label="Gross Rent"
                  value={`$${monthlyRent.toLocaleString()}/mo`}
                  tip={PROJECTION_TIPS["Gross Rent"]}
                  labelStyle={TD_L}
                  valueStyle={TD_V}
                  extraCells={<td style={{ ...TD_V, paddingLeft: 16 }}>${(monthlyRent * 12).toLocaleString()}/yr</td>}
                />
                <TipRow
                  label="Est. Expenses (mortgage, tax, insurance, HOA)"
                  value={`−$${monthlyExp.toLocaleString()}/mo`}
                  tip={PROJECTION_TIPS["Est. Expenses (mortgage, tax, insurance, HOA)"]}
                  labelStyle={TD_L}
                  valueStyle={TD_V}
                  extraCells={<td style={{ ...TD_V, paddingLeft: 16 }}>−${(monthlyExp * 12).toLocaleString()}/yr</td>}
                />
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "2px solid var(--white)", marginTop: 2 }}>
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, color: "var(--white)" }}>Net Cash Flow</span>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 26, color: "var(--accent)", letterSpacing: "-0.01em" }}>{returns.monthlyCashFlow}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--muted)", marginLeft: 14 }}>${(monthlyCF * 12).toLocaleString()}/yr</span>
              </div>
            </div>
            <div style={{ marginTop: 8, fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)" }}>
              Estimates only. Does not include vacancy, capital expenditures, or property management fees.
            </div>
          </div>

          {includeAI && (
            <div style={{ marginTop: 28 }}>
              <div style={SEC}>AI Analysis</div>
              <AISummary summary={ai.aiSummary} strengths={ai.keyStrengths} risks={ai.keyRisks} bestSuitedFor={ai.bestSuitedFor} />
            </div>
          )}

          <div style={{ marginTop: 28, paddingTop: 14, borderTop: "1px solid var(--border)", fontFamily: "Arial, sans-serif", fontSize: 10, color: "var(--muted)", lineHeight: 1.8 }}>
            <ReportFooterLine agentInfo={agentInfo} />
            <div>AI-gathered data — accuracy not guaranteed. Always verify with a licensed agent, appraiser, or financial advisor.</div>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "16px auto 0" }}>
          <ShareExport />
        </div>
      </main>
    </div>
  );
}

export default InvestorReport;
