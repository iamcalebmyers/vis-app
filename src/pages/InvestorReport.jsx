import { useState, useRef } from "react";
import { exportReportPDF } from "../utils/pdfExport.js";
import { useReportActions } from "../utils/useReportActions.js";
import SendToClientModal from "../components/SendToClientModal.jsx";
import ShareLinkModal from "../components/ShareLinkModal.jsx";
import AISummary from "../components/AISummary.jsx";
import ShareExport from "../components/ShareExport.jsx";
import { TipRow } from "../components/ReportTooltip.jsx";
import { DEAL_TIPS, RETURNS_TIPS, PROJECTION_TIPS } from "../utils/tooltips.js";
import { computePropertyMetrics } from "../utils/investorMath.js";
import { calcMonthlyPI } from "../utils/loanMath.js";
import {
  MOCK_PROPERTY,
  MOCK_RENTAL_CARD,
  MOCK_RETURNS_CARD,
  MOCK_INVESTOR_AI,
} from "../data/mockData.js";
import { ReportFooterLine } from "../components/WhiteLabelHeader.jsx";
import ReportAgentHeader from "../components/ReportAgentHeader.jsx";
import TemplatePicker from "../components/TemplatePicker.jsx";
import { useAgentInfo } from "../utils/useAgentInfo.js";
import { sectionVisible } from "../utils/useTemplates.js";

const SEC = { fontFamily: "Arial, sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", borderBottom: "2px solid var(--white)", paddingBottom: 6, marginBottom: 14 };
const TD_L = { fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", padding: "10px 0", borderBottom: "1px solid var(--border)" };
const TD_V = { fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--text)", textAlign: "right", padding: "10px 0", borderBottom: "1px solid var(--border)" };

const REC = {
  good:     { color: "#059669", label: "Good Deal" },
  marginal: { color: "#d97706", label: "Marginal"  },
  pass:     { color: "#dc2626", label: "Pass"      },
};

// Loan-estimate field styling (mirrors the Property Report's calculator).
const F_WRAP = { display: "inline-flex", flexDirection: "column", gap: 4 };
const F_LABEL = { fontFamily: "Arial, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "var(--muted)", textTransform: "uppercase" };
const F_BOX = { display: "inline-flex", alignItems: "center", gap: 2, height: 32, padding: "0 9px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 7 };
const F_INPUT = { border: "none", background: "transparent", color: "var(--white)", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 14, outline: "none", boxShadow: "none" };
const F_FIX = { fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--muted)" };
const F_HINT = { fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted-faint)" };
const STEP = { fontFamily: "Arial, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 10 };
const pNum = (s) => { const n = parseFloat(String(s ?? "").replace(/[^0-9.]/g, "")); return Number.isFinite(n) ? n : 0; };

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

function InvestorReport({ data, onBack, user, userRow }) {
  const [agentInfo, setAgentInfo] = useAgentInfo();
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [includeAI, setIncludeAI] = useState(true);
  const [rateStr, setRateStr] = useState("6.84");
  const [priceStr, setPriceStr] = useState(() => {
    const p = parseFloat(String(data?.purchasePrice ?? "").replace(/[^0-9.]/g, ""));
    return String(Number.isFinite(p) && p > 0 ? p : MOCK_PROPERTY.estimatedValue);
  });
  const [downStr, setDownStr] = useState("20");
  const [termYears, setTermYears] = useState(30);
  const [arvStr, setArvStr] = useState(() => String(pNum(data?.estARV) || 530000));
  const [repairStr, setRepairStr] = useState(() => String(pNum(data?.repairEstimate) || 25000));
  const [refiOn, setRefiOn] = useState(false);
  const [refiLtvStr, setRefiLtvStr] = useState("75");
  const [refiRateStr, setRefiRateStr] = useState("6.84");
  const [refiTermYears, setRefiTermYears] = useState(30);
  const [refiClosingStr, setRefiClosingStr] = useState("3");
  const [showSendModal, setShowSendModal] = useState(false);
  const reportRef = useRef();
  const property = MOCK_PROPERTY;

  const { shareLoading, shareUrl, showShareModal, setShowShareModal, saved, saveError, handleShare, handleSave } =
    useReportActions("investor", data, user, userRow);

  async function handleExportPDF() {
    if (!reportRef.current) return;
    const addr = property.address?.replace(/\s+/g, "-").toLowerCase() || "property";
    await exportReportPDF(reportRef.current, `${addr}-investor-report.pdf`);
  }
  const deal = data || {};
  const rental = MOCK_RENTAL_CARD;
  const returns = MOCK_RETURNS_CARD;
  const ai = MOCK_INVESTOR_AI;

  const rec = REC[deal.recommendation] || REC.marginal;
  const reportDate = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const parseDollar = (str) => parseFloat(String(str).replace(/[^0-9.-]/g, "")) || 0;
  const monthlyRent = parseDollar(rental.estMonthlyRent);

  // Live metrics driven by the editable loan estimate (price / down / term / rate).
  const purchasePrice = parseDollar(priceStr) || property.estimatedValue;
  const downPct = Math.min(Math.max((parseFloat(downStr) || 0) / 100, 0), 0.95);
  const downDollars = Math.round(purchasePrice * downPct);
  const ratePct = Number.isFinite(parseFloat(rateStr)) ? parseFloat(rateStr) : 6.84;
  const m = computePropertyMetrics(
    { listPrice: purchasePrice, rentEstimate: monthlyRent, annualTax: property.annualTax, hoaMonthly: property.hoa ?? 0, sqft: property.sqft, estARV: parseDollar(deal.estARV) || undefined },
    { ratePct, downPct, termYears }
  );
  const fmtUSD0 = (n) => (n == null ? "—" : `$${Math.round(n).toLocaleString()}`);
  const fmtPct = (n) => (n == null ? "—" : `${n}%`);
  const monthlyCF = m.monthlyCashFlow ?? 0;
  const cfStr = m.monthlyCashFlow == null ? "—" : `${m.monthlyCashFlow < 0 ? "−" : ""}$${Math.abs(m.monthlyCashFlow).toLocaleString()}`;
  const monthlyExp = Math.round(monthlyRent - monthlyCF);

  // BRRR refinance (Step 2) — recover capital after rehab via a cash-out refi.
  const arv = pNum(arvStr);
  const repair = pNum(repairStr);
  const acqLoan = Math.round(purchasePrice * (1 - downPct));
  const refiLtv = Math.min(Math.max((parseFloat(refiLtvStr) || 0) / 100, 0), 1.25);
  const refiRate = Number.isFinite(parseFloat(refiRateStr)) ? parseFloat(refiRateStr) : 6.84;
  const refiClosingPct = Math.max((parseFloat(refiClosingStr) || 0) / 100, 0);
  const newLoan = Math.round(arv * refiLtv);
  const payoff = acqLoan;
  const refiClosing = Math.round(newLoan * refiClosingPct);
  const cashOut = newLoan - payoff - refiClosing;
  const totalCashInvested = downDollars + repair;
  const cashLeft = totalCashInvested - cashOut;
  const postRefiPayment = Math.round(calcMonthlyPI(newLoan, refiRate, refiTermYears));
  const cashOutStr = cashOut >= 0 ? fmtUSD0(cashOut) : `${fmtUSD0(Math.abs(cashOut))} needed at refinance closing`;
  const cashLeftStr = cashLeft <= 0 ? "$0 — fully recycled" : fmtUSD0(cashLeft);

  const summaryStats = [
    { label: "Purchase Price", value: fmtUSD0(purchasePrice) },
    { label: "Est. Monthly Rent", value: `${fmtUSD0(monthlyRent)}/mo` },
    { label: "Monthly Cash Flow", value: `${cfStr}/mo`, accent: true },
    { label: "Gross Yield", value: fmtPct(m.grossYield) },
  ];

  const dealRows = [
    ["Max Offer (70% Rule)", deal.maxOffer],
    ["Potential Equity", deal.potentialEquity],
  ].filter(([, v]) => v);

  const returnsRows = [
    ["Gross Rental Yield", fmtPct(m.grossYield)],
    ["Net Rental Yield", fmtPct(m.netYield)],
    ["Cash-on-Cash Return", fmtPct(m.cashOnCash)],
    ["Cap Rate", fmtPct(m.capRate)],
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--bg)", zIndex: 5 }}>
        <BackButton onClick={onBack} />
        <span className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Investor Report</span>
        <TemplatePicker reportType="investor" selected={activeTemplate} onSelect={setActiveTemplate} />
        <label style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: includeAI ? "var(--text)" : "var(--muted)", transition: "color 0.15s ease" }}>AI Analysis</span>
          <input type="checkbox" checked={includeAI} onChange={() => setIncludeAI(v => !v)} style={{ display: "none" }} />
          <div style={{ width: 36, height: 20, borderRadius: 10, background: includeAI ? "var(--accent)" : "var(--border)", position: "relative", transition: "background 0.2s ease", flexShrink: 0 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: includeAI ? 19 : 3, transition: "left 0.2s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </div>
        </label>
      </div>

      <main style={{ flex: 1, padding: "20px 20px 40px" }}>
        <div ref={reportRef} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "28px 32px", maxWidth: 900, margin: "0 auto", boxShadow: "var(--shadow-card), inset 0 1px 0 var(--glass-sheen)" }}>

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

          {/* Loan estimate — editable inputs drive cash flow + returns throughout. */}
          <div style={{ marginTop: 12, padding: "14px 16px", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 8 }}>
            <div style={{ ...F_LABEL, marginBottom: 12 }}>Loan Estimate</div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
              <label style={F_WRAP}>
                <span style={F_LABEL}>Purchase Price</span>
                <span style={F_BOX}>
                  <span style={F_FIX}>$</span>
                  <input value={priceStr} onChange={(e) => setPriceStr(e.target.value)} inputMode="numeric" aria-label="Purchase price" style={{ ...F_INPUT, width: 92 }} />
                </span>
              </label>

              <label style={F_WRAP}>
                <span style={F_LABEL}>Down Payment</span>
                <span style={F_BOX}>
                  <input value={downStr} onChange={(e) => setDownStr(e.target.value)} inputMode="decimal" aria-label="Down payment percent" style={{ ...F_INPUT, width: 36, textAlign: "right" }} />
                  <span style={F_FIX}>%</span>
                </span>
                <span style={F_HINT}>= {fmtUSD0(downDollars)}</span>
              </label>

              <label style={F_WRAP}>
                <span style={F_LABEL}>Term</span>
                <span style={{ display: "inline-flex", border: "1px solid var(--border)", borderRadius: 7, overflow: "hidden", height: 32 }}>
                  {[30, 15].map((t) => (
                    <button key={t} type="button" onClick={() => setTermYears(t)}
                      style={{ padding: "0 12px", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, background: termYears === t ? "var(--accent)" : "var(--card)", color: termYears === t ? "var(--accent-text)" : "var(--muted-soft)" }}>
                      {t}yr
                    </button>
                  ))}
                </span>
              </label>

              <label style={F_WRAP}>
                <span style={F_LABEL}>Rate</span>
                <span style={F_BOX}>
                  <input value={rateStr} onChange={(e) => setRateStr(e.target.value)} inputMode="decimal" aria-label="Mortgage rate" style={{ ...F_INPUT, width: 48, textAlign: "right" }} />
                  <span style={F_FIX}>%</span>
                </span>
              </label>

              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <span style={{ ...F_LABEL, display: "block" }}>Est. Monthly Payment</span>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 18, color: "var(--accent)", marginTop: 4 }}>{fmtUSD0(m.mortgage)}/mo</div>
              </div>
            </div>
          </div>

          {sectionVisible(activeTemplate, "deal_analysis") && (
            <div style={{ marginTop: 28 }}>
              <div style={{ ...SEC, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Deal Analysis</span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, color: rec.color, background: `${rec.color}20`, padding: "2px 10px", borderRadius: 20, textTransform: "none", letterSpacing: 0 }}>{rec.label}</span>
              </div>
              {/* Step 1 — Rehab: editable ARV + repair drive the BRRR math below. */}
              <div style={STEP}>Step 1 · Rehab</div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 10 }}>
                <label style={F_WRAP}>
                  <span style={F_LABEL}>Estimated ARV</span>
                  <span style={F_BOX}>
                    <span style={F_FIX}>$</span>
                    <input value={arvStr} onChange={(e) => setArvStr(e.target.value)} inputMode="numeric" aria-label="Estimated ARV" style={{ ...F_INPUT, width: 92 }} />
                  </span>
                </label>
                <label style={F_WRAP}>
                  <span style={F_LABEL}>Repair Estimate</span>
                  <span style={F_BOX}>
                    <span style={F_FIX}>$</span>
                    <input value={repairStr} onChange={(e) => setRepairStr(e.target.value)} inputMode="numeric" aria-label="Repair estimate" style={{ ...F_INPUT, width: 80 }} />
                  </span>
                </label>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {dealRows.map(([label, value]) => (
                    <TipRow key={label} label={label} value={value} tip={DEAL_TIPS[label]} labelStyle={TD_L} valueStyle={TD_V} />
                  ))}
                </tbody>
              </table>

              {/* Step 2 — Refinance (BRRR cash-out). Optional; off by default. */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 22 }}>
                <div style={{ ...STEP, marginBottom: 0 }}>Step 2 · Refinance</div>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: refiOn ? "var(--text)" : "var(--muted)" }}>Model a refinance (BRRR)</span>
                  <input type="checkbox" checked={refiOn} onChange={() => setRefiOn(v => !v)} style={{ display: "none" }} />
                  <div style={{ width: 36, height: 20, borderRadius: 10, background: refiOn ? "var(--accent)" : "var(--border)", position: "relative", transition: "background 0.2s ease", flexShrink: 0 }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: refiOn ? 19 : 3, transition: "left 0.2s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </div>
                </label>
              </div>

              {refiOn && (
                <div style={{ marginTop: 12, padding: "14px 16px", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 8 }}>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 14 }}>
                    <label style={F_WRAP}>
                      <span style={F_LABEL}>Refi LTV</span>
                      <span style={F_BOX}>
                        <input value={refiLtvStr} onChange={(e) => setRefiLtvStr(e.target.value)} inputMode="decimal" aria-label="Refinance LTV percent" style={{ ...F_INPUT, width: 40, textAlign: "right" }} />
                        <span style={F_FIX}>%</span>
                      </span>
                    </label>
                    <label style={F_WRAP}>
                      <span style={F_LABEL}>Refi Rate</span>
                      <span style={F_BOX}>
                        <input value={refiRateStr} onChange={(e) => setRefiRateStr(e.target.value)} inputMode="decimal" aria-label="Refinance rate" style={{ ...F_INPUT, width: 48, textAlign: "right" }} />
                        <span style={F_FIX}>%</span>
                      </span>
                    </label>
                    <label style={F_WRAP}>
                      <span style={F_LABEL}>Refi Term</span>
                      <span style={{ display: "inline-flex", border: "1px solid var(--border)", borderRadius: 7, overflow: "hidden", height: 32 }}>
                        {[30, 15].map((t) => (
                          <button key={t} type="button" onClick={() => setRefiTermYears(t)}
                            style={{ padding: "0 12px", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, background: refiTermYears === t ? "var(--accent)" : "var(--card)", color: refiTermYears === t ? "var(--accent-text)" : "var(--muted-soft)" }}>
                            {t}yr
                          </button>
                        ))}
                      </span>
                    </label>
                    <label style={F_WRAP}>
                      <span style={F_LABEL}>Closing Costs</span>
                      <span style={F_BOX}>
                        <input value={refiClosingStr} onChange={(e) => setRefiClosingStr(e.target.value)} inputMode="decimal" aria-label="Refinance closing costs percent" style={{ ...F_INPUT, width: 36, textAlign: "right" }} />
                        <span style={F_FIX}>%</span>
                      </span>
                    </label>
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      {[
                        ["New Loan Amount", fmtUSD0(newLoan)],
                        ["Original Loan Payoff", fmtUSD0(payoff)],
                        ["Refi Closing Costs", fmtUSD0(refiClosing)],
                        ["Cash-Out Amount", cashOutStr],
                        ["Total Cash Invested", fmtUSD0(totalCashInvested)],
                        ["Cash Left in Deal", cashLeftStr],
                        ["Post-Refi Monthly Payment", `${fmtUSD0(postRefiPayment)}/mo`],
                      ].map(([label, value]) => (
                        <tr key={label}>
                          <td style={TD_L}>{label}</td>
                          <td style={TD_V}>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ marginTop: 10, fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
                    Assumes the lender will refinance based on ARV after a seasoning period (commonly 6–12 months).
                  </div>
                </div>
              )}
            </div>
          )}

          {sectionVisible(activeTemplate, "returns_breakdown") && (
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
          )}

          {sectionVisible(activeTemplate, "rental_comps") && (
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
          )}

          {sectionVisible(activeTemplate, "cash_flow_projection") && (
            <div style={{ marginTop: 28 }}>
              <div style={SEC}>12-Month Cash Flow Projection</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <TipRow label="Gross Rent" value={`$${monthlyRent.toLocaleString()}/mo`} tip={PROJECTION_TIPS["Gross Rent"]} labelStyle={TD_L} valueStyle={TD_V} extraCells={<td style={{ ...TD_V, paddingLeft: 16 }}>${(monthlyRent * 12).toLocaleString()}/yr</td>} />
                  <TipRow label="Est. Expenses (mortgage, tax, insurance, HOA)" value={`−$${monthlyExp.toLocaleString()}/mo`} tip={PROJECTION_TIPS["Est. Expenses (mortgage, tax, insurance, HOA)"]} labelStyle={TD_L} valueStyle={TD_V} extraCells={<td style={{ ...TD_V, paddingLeft: 16 }}>−${(monthlyExp * 12).toLocaleString()}/yr</td>} />
                </tbody>
              </table>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "2px solid var(--white)", marginTop: 2 }}>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, color: "var(--white)" }}>Net Cash Flow</span>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 26, color: "var(--accent)", letterSpacing: "-0.01em" }}>{`${cfStr}/mo`}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--muted)", marginLeft: 14 }}>${(monthlyCF * 12).toLocaleString()}/yr</span>
                </div>
              </div>
              <div style={{ marginTop: 8, fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)" }}>Estimates only. Does not include vacancy, capital expenditures, or property management fees.</div>
            </div>
          )}

          {includeAI && sectionVisible(activeTemplate, "ai_summary") && (
            <div style={{ marginTop: 28 }}>
              <div style={SEC}>AI Analysis</div>
              <AISummary summary={ai.aiSummary} strengths={ai.keyStrengths} risks={ai.keyRisks} bestSuitedFor={ai.bestSuitedFor} />
            </div>
          )}

          <div style={{ marginTop: 28, paddingTop: 14, borderTop: "1px solid var(--border)", fontFamily: "Arial, sans-serif", fontSize: 10, color: "var(--muted)", lineHeight: 1.8 }}>
            <ReportFooterLine />
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "16px auto 0" }}>
          <ShareExport
            user={user}
            userRow={userRow}
            onShare={handleShare}
            onExport={handleExportPDF}
            onSave={() => handleSave(`${property.address} — Investor`)}
            onSendToClient={() => setShowSendModal(true)}
            shareLoading={shareLoading}
            saved={saved}
            saveError={saveError}
          />
        </div>
      </main>
      {showSendModal && (
        <SendToClientModal reportType="investor" onExportPDF={handleExportPDF} onClose={() => setShowSendModal(false)} />
      )}
      {showShareModal && shareUrl && (
        <ShareLinkModal url={shareUrl} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}

export default InvestorReport;
