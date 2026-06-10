import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase.js";

/* ─── Helpers ─── */
function fmt(n) {
  if (n == null) return "—";
  return typeof n === "number" ? n.toLocaleString() : n;
}
function fmtUSD(n) {
  if (n == null) return "—";
  return "$" + Number(n).toLocaleString();
}

const SEC = { fontFamily: "Arial, sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#888", borderBottom: "2px solid #222", paddingBottom: 6, marginBottom: 14 };
const ROW_L = { fontFamily: "Arial, sans-serif", fontSize: 13, color: "#555", padding: "9px 0", borderBottom: "1px solid #eee" };
const ROW_V = { fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: "#222", textAlign: "right", padding: "9px 0", borderBottom: "1px solid #eee" };

function Row({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <tr>
      <td style={ROW_L}>{label}</td>
      <td style={ROW_V}>{value}</td>
    </tr>
  );
}

/* ─── Agent branding mark ─── */
function AgentMark({ agent }) {
  const name = agent.ai_name || "Agent";
  if (agent.logo_url) {
    return <img src={agent.logo_url} alt={name} style={{ height: 40, maxWidth: 140, objectFit: "contain", display: "block" }} />;
  }
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent)", display: "grid", placeItems: "center", flexShrink: 0 }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>{name[0].toUpperCase()}</span>
      </div>
      <span style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 800, fontSize: 18, color: "#1a1a18" }}>{name}</span>
    </div>
  );
}

function VisMark() {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <img src="/vis-logo.png" alt="Vis" style={{ width: 28, height: 28, borderRadius: 8, objectFit: "cover" }} />
      <span style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 800, fontSize: 18, color: "#1a1a18" }}>vis<span style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: 10, color: "#9b8ea0" }}>.realestate</span></span>
    </div>
  );
}

/* ─── Report body by type ─── */
function PropertyBody({ data }) {
  return (
    <div>
      {data.estimatedValue && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff8f5", border: "1px solid #e8e6e3", borderRadius: 8, padding: "14px 20px", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "Arial, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#9b8ea0", textTransform: "uppercase", marginBottom: 4 }}>Estimated Value</div>
            <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 28, color: "var(--accent)", letterSpacing: "-0.02em" }}>{fmtUSD(data.estimatedValue)}</div>
          </div>
          {data.pricePerSqft && <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "Arial, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#9b8ea0", textTransform: "uppercase", marginBottom: 4 }}>Per sq ft</div>
            <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 20, color: "#2a2825" }}>{fmtUSD(data.pricePerSqft)}</div>
          </div>}
        </div>
      )}
      <div style={{ marginBottom: 24 }}><div style={SEC}>Property Details</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <Row label="Beds / Baths" value={data.beds && data.baths ? `${data.beds} bd / ${data.baths} ba` : null} />
            <Row label="Square Feet" value={data.sqft ? fmt(data.sqft) + " sqft" : null} />
            <Row label="Lot Size" value={data.lotSize} />
            <Row label="Year Built" value={data.yearBuilt} />
            <Row label="Status" value={data.listingStatus} />
            <Row label="Days on Market" value={data.daysOnMarket != null ? data.daysOnMarket + " days" : null} />
            <Row label="Listing Price" value={data.listPrice ? fmtUSD(data.listPrice) : null} />
            <Row label="Flood Zone" value={data.floodZone} />
          </tbody>
        </table>
      </div>
      {(data.keyStrengths?.length || data.keyRisks?.length) && (
        <div style={{ marginBottom: 24 }}><div style={SEC}>Highlights</div>
          {data.keyStrengths?.length > 0 && <div style={{ marginBottom: 10 }}>
            {data.keyStrengths.map((s, i) => <div key={i} style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#2a2825", padding: "4px 0 4px 12px", borderLeft: "3px solid var(--accent)", marginBottom: 6 }}>↑ {s}</div>)}
          </div>}
          {data.keyRisks?.length > 0 && <div>
            {data.keyRisks.map((r, i) => <div key={i} style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#2a2825", padding: "4px 0 4px 12px", borderLeft: "3px solid #9b8ea0", marginBottom: 6 }}>↓ {r}</div>)}
          </div>}
        </div>
      )}
    </div>
  );
}

function MarketBody({ data }) {
  return (
    <div>
      {data.medianPrice && (
        <div style={{ background: "#fff8f5", border: "1px solid #e8e6e3", borderRadius: 8, padding: "14px 20px", marginBottom: 20 }}>
          <div style={{ fontFamily: "Arial, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#9b8ea0", textTransform: "uppercase", marginBottom: 4 }}>Median Home Price</div>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 28, color: "var(--accent)", letterSpacing: "-0.02em" }}>{fmtUSD(data.medianPrice)}</div>
        </div>
      )}
      <div style={{ marginBottom: 24 }}><div style={SEC}>Market Conditions</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <Row label="Avg Days on Market" value={data.avgDaysOnMarket != null ? data.avgDaysOnMarket + " days" : null} />
            <Row label="Active Listings" value={data.activeListings ? fmt(data.activeListings) : null} />
            <Row label="List / Sale Ratio" value={data.listToSaleRatio != null ? data.listToSaleRatio + "%" : null} />
            <Row label="Price Reductions" value={data.priceReductions != null ? data.priceReductions + "%" : null} />
            <Row label="Avg Price / Sq Ft" value={data.avgPricePerSqft ? fmtUSD(data.avgPricePerSqft) : null} />
            <Row label="30yr Fixed Rate" value={data.currentRate30yr != null ? data.currentRate30yr + "%" : null} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvestorBody({ data }) {
  return (
    <div>
      {data.purchasePrice && (
        <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          {[["Purchase Price", fmtUSD(data.purchasePrice)], ["Est. ARV", fmtUSD(data.arv)], ["Potential Equity", fmtUSD(data.potentialEquity)]].map(([l, v]) => v && v !== "—" ? (
            <div key={l} style={{ flex: 1, minWidth: 140, background: "#fff8f5", border: "1px solid #e8e6e3", borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#9b8ea0", textTransform: "uppercase", marginBottom: 4 }}>{l}</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 20, color: "var(--accent)" }}>{v}</div>
            </div>
          ) : null)}
        </div>
      )}
      <div style={{ marginBottom: 24 }}><div style={SEC}>Deal Analysis</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <Row label="Gross Rental Yield" value={data.grossYield != null ? data.grossYield + "%" : null} />
            <Row label="Net Yield" value={data.netYield != null ? data.netYield + "%" : null} />
            <Row label="Cash-on-Cash" value={data.cashOnCash != null ? data.cashOnCash + "%" : null} />
            <Row label="Cap Rate" value={data.capRate != null ? data.capRate + "%" : null} />
            <Row label="Monthly Cash Flow" value={data.monthlyCashFlow ? fmtUSD(data.monthlyCashFlow) : null} />
            <Row label="Est. Monthly Rent" value={data.estimatedRent ? fmtUSD(data.estimatedRent) : null} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
function SharedReport({ token }) {
  const [report, setReport] = useState(null);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("shared_reports")
        .select("*")
        .eq("token", token)
        .maybeSingle();

      if (error || !data) { setNotFound(true); setLoading(false); return; }

      setReport(data);

      if (data.agent_profile_id) {
        const { data: ap } = await supabase
          .from("agent_profiles")
          .select("ai_name, logo_url, brand_color, handle, contact_name, contact_phone, contact_email, contact_brokerage")
          .eq("id", data.agent_profile_id)
          .maybeSingle();
        if (ap) {
          setAgent(ap);
          document.documentElement.style.setProperty("--accent", ap.brand_color || "#DA6B3A");
        }
      }

      supabase.from("shared_reports").update({ viewed_at: new Date().toISOString() }).eq("token", token);
      setLoading(false);
    }
    load();
  }, [token]);

  const PAGE = { minHeight: "100vh", background: "#f7f6f3", padding: "32px 16px 64px", fontFamily: "Arial, sans-serif" };
  const CARD = { background: "#fff", border: "1px solid #e8e6e3", borderRadius: 10, padding: "32px 36px", maxWidth: 860, margin: "0 auto" };

  if (loading) return (
    <div style={{ ...PAGE, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#9b8ea0", letterSpacing: "0.1em", textTransform: "uppercase" }}>Loading report…</span>
    </div>
  );

  if (notFound) return (
    <div style={{ ...PAGE, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "#1a1a18", marginBottom: 10 }}>Report not found</div>
        <div style={{ fontFamily: "Arial, sans-serif", fontSize: 14, color: "#9b8ea0" }}>This link may have expired or been removed.</div>
      </div>
    </div>
  );

  const { report_type, report_data: d } = report;
  const reportDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const headline =
    report_type === "property" ? (d.address || "Property Report")
    : report_type === "market" ? (d.area || "Market Report")
    : "Investor Report";
  const subtitle =
    report_type === "property" ? [d.city, d.state, d.zip].filter(Boolean).join(", ") + (d.city || d.state ? ` · ${reportDate}` : reportDate)
    : reportDate;

  return (
    <div style={PAGE}>
      <div style={CARD}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 18, borderBottom: "3px solid #1a1a18", marginBottom: 22 }}>
          <div>
            <div style={{ fontFamily: "Arial, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#9b8ea0", textTransform: "uppercase", marginBottom: 6 }}>
              {report_type === "property" ? "Property Report" : report_type === "market" ? "Market Report" : "Investor Report"}
            </div>
            <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 24, color: "#1a1a18", margin: "0 0 4px" }}>{headline}</h1>
            {subtitle && <div style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#9b8ea0" }}>{subtitle}</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            {agent ? <AgentMark agent={agent} /> : <VisMark />}
            {agent && (agent.contact_name || agent.ai_name) && (
              <div style={{ marginTop: 6, textAlign: "right" }}>
                {agent.contact_name && <div style={{ fontFamily: "Arial, sans-serif", fontSize: 12, fontWeight: 700, color: "#1a1a18" }}>{agent.contact_name}</div>}
                {agent.contact_brokerage && <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: "#6b6560" }}>{agent.contact_brokerage}</div>}
                {agent.contact_phone && <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: "#6b6560" }}>{agent.contact_phone}</div>}
                {agent.contact_email && <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: "#6b6560" }}>{agent.contact_email}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        {report_type === "property" && <PropertyBody data={d} />}
        {report_type === "market" && <MarketBody data={d} />}
        {report_type === "investor" && <InvestorBody data={d} />}

        {/* AI Summary */}
        {d.aiSummary && (
          <div style={{ marginBottom: 24 }}>
            <div style={SEC}>AI Analysis</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 14, color: "#2a2825", lineHeight: 1.8 }}>{d.aiSummary}</div>
            {d.bestSuitedFor && <div style={{ marginTop: 12, fontFamily: "Arial, sans-serif", fontSize: 12, color: "#6b6560", fontStyle: "italic" }}>Best suited for: {d.bestSuitedFor}</div>}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 24, paddingTop: 14, borderTop: "1px solid #e8e6e3", fontFamily: "Arial, sans-serif", fontSize: 10, color: "#9b8ea0", lineHeight: 1.8 }}>
          {agent
            ? <div>{[agent.contact_name || agent.ai_name, agent.contact_brokerage, agent.contact_phone].filter(Boolean).join(" · ")} — for informational purposes only, not financial or legal advice.</div>
            : <div>Generated by Vis · vis.realestate — for informational purposes only, not financial or legal advice.</div>
          }
          <div>AI-gathered data — accuracy not guaranteed. Always verify with a licensed agent, appraiser, or financial advisor.</div>
        </div>
      </div>
    </div>
  );
}

export default SharedReport;
