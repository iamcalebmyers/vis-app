import { useAgent } from "../utils/AgentContext.jsx";

export function ReportBrandMark() {
  const { isAgentDomain, aiName, logoUrl } = useAgent();

  if (isAgentDomain) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {logoUrl
          ? <img src={logoUrl} alt={aiName} style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover" }} />
          : <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent)", display: "grid", placeItems: "center" }}>
              <span style={{ color: "#fff", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 11 }}>{aiName[0]?.toUpperCase() || "A"}</span>
            </div>
        }
        <span style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 15, color: "var(--white)" }}>{aiName}</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent)", display: "grid", placeItems: "center" }}>
        <span style={{ color: "#fff", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 11 }}>V</span>
      </div>
      <div style={{ lineHeight: 1 }}>
        <span style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 15, color: "var(--white)" }}>vis</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", marginLeft: 2 }}>.realestate</span>
      </div>
    </div>
  );
}

export function ReportFooterLine({ agentInfo }) {
  const { isAgentDomain, aiName } = useAgent();

  if (isAgentDomain) {
    const parts = [aiName];
    if (agentInfo?.brokerage) parts.push(agentInfo.brokerage);
    if (agentInfo?.phone) parts.push(agentInfo.phone);
    return <div>{parts.join(" · ")} — for informational purposes only, not financial or legal advice.</div>;
  }

  const parts = [];
  if (agentInfo?.name) parts.push(agentInfo.name);
  if (agentInfo?.brokerage) parts.push(agentInfo.brokerage);
  if (agentInfo?.phone) parts.push(agentInfo.phone);
  const prefix = parts.length > 0 ? parts.join(" · ") + " — " : "";
  return <div>{prefix}For informational purposes only, not financial or legal advice.</div>;
}

function WhiteLabelHeader({ reportType = "Property Report" }) {
  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
      <ReportBrandMark />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {reportType}
      </span>
    </header>
  );
}

export default WhiteLabelHeader;
