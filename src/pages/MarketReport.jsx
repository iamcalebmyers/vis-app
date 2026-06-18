import { useState, useRef, useCallback } from "react";
import SendToClientModal from "../components/SendToClientModal.jsx";
import ShareLinkModal from "../components/ShareLinkModal.jsx";
import { exportReportPDF } from "../utils/pdfExport.js";
import { useReportActions } from "../utils/useReportActions.js";
import MarketDataGrid from "../components/MarketDataGrid.jsx";
import AISummary from "../components/AISummary.jsx";
import ShareExport from "../components/ShareExport.jsx";
import { MOCK_MARKET, MOCK_RATE_CARD, MOCK_MARKET_AI } from "../data/mockData.js";
import { ReportFooterLine } from "../components/WhiteLabelHeader.jsx";
import ReportAgentHeader from "../components/ReportAgentHeader.jsx";
import TemplatePicker from "../components/TemplatePicker.jsx";
import { useAgentInfo } from "../utils/useAgentInfo.js";
import { sectionVisible } from "../utils/useTemplates.js";
import GraphModal from "../components/GraphModal.jsx";
import GraphCard from "../components/GraphCard.jsx";

const SEC = { fontFamily: "Arial, sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", borderBottom: "2px solid var(--white)", paddingBottom: 6, marginBottom: 14 };
const TD_L = { fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text)", padding: "10px 0", borderBottom: "1px solid var(--border)" };
const TD_V = { fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--text)", textAlign: "right", padding: "10px 0", borderBottom: "1px solid var(--border)" };

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

function SectionToggle({ enabled, onToggle }) {
  return (
    <button type="button" onClick={onToggle} aria-label={enabled ? "Hide section" : "Show section"}
      style={{ width: 28, height: 16, borderRadius: 8, background: enabled ? "var(--accent)" : "var(--border)", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s ease", padding: 0 }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: enabled ? 15 : 3, transition: "left 0.2s ease", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

function RateSection({ rate, enabled, onToggle }) {
  if (!rate) return null;
  const rows = [
    ["30-year fixed", rate.rate30yr],
    ["15-year fixed", rate.rate15yr],
    ["5/1 ARM", rate.rateArm],
    ["Week-over-week change", rate.rateChange],
    ["Next Fed meeting", rate.nextFed],
    ["Fed outlook", rate.fedExpectation],
  ];
  return (
    <div style={{ marginTop: 28, opacity: enabled ? 1 : 0.3, transition: "opacity 0.15s ease" }}>
      <div style={{ ...SEC, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Rate Context</span>
        <SectionToggle enabled={enabled} onToggle={onToggle} />
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td style={TD_L}>{label}</td>
              <td style={TD_V}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarketReport({ data, onBack, user, userRow }) {
  const [agentInfo, setAgentInfo] = useAgentInfo();
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [includeAI, setIncludeAI] = useState(true);
  const [includeRate, setIncludeRate] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [graphModal, setGraphModal] = useState(null);
  const [savedGraphs, setSavedGraphs] = useState([]);
  const reportRef = useRef();

  const handleAddGraph = useCallback((graphData) => {
    setSavedGraphs(prev => [...prev, { ...graphData, id: Date.now() }]);
  }, []);
  const market = MOCK_MARKET;

  const { shareLoading, shareUrl, showShareModal, setShowShareModal, saved, saveError, handleShare, handleSave } =
    useReportActions("market", data, user, userRow);

  async function handleExportPDF() {
    if (!reportRef.current) return;
    const area = market.area?.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "market";
    await exportReportPDF(reportRef.current, `${area}-report.pdf`);
  }
  const rate = MOCK_RATE_CARD;
  const ai = MOCK_MARKET_AI;
  const reportDate = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--bg)", zIndex: 5 }}>
        <BackButton onClick={onBack} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Market Report</span>
        <TemplatePicker reportType="market" selected={activeTemplate} onSelect={setActiveTemplate} />
      </div>

      <main style={{ flex: 1, padding: "20px 20px 40px" }}>
        <div ref={reportRef} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "28px 32px", maxWidth: 900, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 16, borderBottom: "3px solid var(--white)", marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>Market Conditions Report</div>
              <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 22, color: "var(--white)", margin: "0 0 4px" }}>{market.area}</h1>
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "var(--muted)" }}>{reportDate}</div>
            </div>
            <ReportAgentHeader info={agentInfo} onChange={setAgentInfo} />
          </div>

          {sectionVisible(activeTemplate, "ai_summary") && (
            <div style={{ marginTop: 4, opacity: includeAI ? 1 : 0.3, transition: "opacity 0.15s ease" }}>
              <div style={{ ...SEC, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>AI Analysis</span>
                <SectionToggle enabled={includeAI} onToggle={() => setIncludeAI(v => !v)} />
              </div>
              <AISummary summary={ai.aiSummary} strengths={ai.keyStrengths} risks={ai.keyRisks} bestSuitedFor={ai.bestSuitedFor} />
            </div>
          )}

          {sectionVisible(activeTemplate, "market_data") && <MarketDataGrid market={market} onGraph={(key) => setGraphModal({ metricKey: key, location: market.area })} />}

          {sectionVisible(activeTemplate, "rate_context") && (
            <RateSection rate={rate} enabled={includeRate} onToggle={() => setIncludeRate(v => !v)} />
          )}

          {/* Saved charts */}
          {savedGraphs.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <div style={{ ...SEC, display: "flex", justifyContent: "space-between", alignItems: "center" }}>Charts</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {savedGraphs.map((g) => (
                  <div key={g.id} style={{ position: "relative" }}>
                    <button type="button" onClick={() => setSavedGraphs(prev => prev.filter(x => x.id !== g.id))}
                      title="Remove chart" style={{ position: "absolute", top: 8, right: 8, zIndex: 2, background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", color: "var(--muted)", fontSize: 13, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                    <GraphCard
                      metricLabel={g.metricLabel} chartType={g.chartType} colorScheme={g.colorScheme}
                      data={g.data} unit={g.unit} title={g.title} subtitle={g.subtitle} source={g.source}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 28, paddingTop: 14, borderTop: "1px solid var(--border)", fontFamily: "Arial, sans-serif", fontSize: 10, color: "var(--muted)", lineHeight: 1.8 }}>
            <div>Data sources: Zillow ZHVI · Realtor.com · US Census Bureau ACS · NCEI</div>
            <ReportFooterLine />
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "16px auto 0" }}>
          <ShareExport
            user={user}
            userRow={userRow}
            onShare={handleShare}
            onExport={handleExportPDF}
            onSave={() => handleSave(market.area)}
            onSendToClient={() => setShowSendModal(true)}
            shareLoading={shareLoading}
            saved={saved}
            saveError={saveError}
          />
        </div>
      </main>
      {graphModal && (
        <GraphModal
          metricKey={graphModal.metricKey}
          location={graphModal.location}
          onClose={() => setGraphModal(null)}
          onAddToReport={handleAddGraph}
        />
      )}
      {showSendModal && (
        <SendToClientModal reportType="market" onExportPDF={handleExportPDF} onClose={() => setShowSendModal(false)} />
      )}
      {showShareModal && shareUrl && (
        <ShareLinkModal url={shareUrl} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}

export default MarketReport;
