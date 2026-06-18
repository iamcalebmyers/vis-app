import { useRef, useState } from "react";
import GraphChart from "./GraphChart.jsx";
import HeatMapCard from "./HeatMapCard.jsx";
import { CHART_COLORS } from "../utils/graphData.js";

export default function GraphCard({ metricLabel, chartType, colorScheme = "colorful", data, unit, title, subtitle, source, onAddToReport, compact, scaleInvert }) {
  if (chartType === "heatmap") {
    return (
      <HeatMapCard
        data={data} title={title} subtitle={subtitle} source={source}
        metricLabel={metricLabel} unit={unit} scaleInvert={scaleInvert}
        onAddToReport={onAddToReport}
      />
    );
  }
  const cardRef = useRef();
  const [exporting, setExporting] = useState(false);
  const s = CHART_COLORS[colorScheme] || CHART_COLORS.colorful;
  const chartHeight = compact ? 180 : 240;

  async function handleExport() {
    setExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, { backgroundColor: s.background, scale: 2, useCORS: true });
      const link = document.createElement("a");
      link.download = `${(title || "chart").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }

  function handleAddToReport() {
    onAddToReport?.({ metricLabel, chartType, colorScheme, data, unit, title, subtitle, source });
  }

  return (
    <div>
      <div ref={cardRef} style={{ background: s.background, borderRadius: 8, padding: "20px 24px 16px", border: `1px solid ${s.grid}` }}>
        <div style={{ height: 3, width: 36, background: s.accentTop, borderRadius: 2, marginBottom: 14 }} />
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: s.axis, marginBottom: 6 }}>
          {metricLabel || "Data Chart"}
        </div>
        {title && (
          <div style={{ fontFamily: "Georgia, serif", fontSize: compact ? 15 : 18, fontWeight: 700, color: s.strong, lineHeight: 1.3, marginBottom: subtitle ? 4 : 12 }}>
            {title}
          </div>
        )}
        {subtitle && (
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: s.axis, marginBottom: 14 }}>
            {subtitle}
          </div>
        )}
        <GraphChart type={chartType} scheme={colorScheme} data={data} unit={unit} height={chartHeight} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 8, borderTop: `1px solid ${s.grid}` }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: s.axis }}>{source || ""}</span>
          <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 11, color: s.accentTop }}>Vis</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button type="button" onClick={handleExport} disabled={exporting}
          style={{ flex: 1, height: 34, background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 7, fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--muted-soft)", cursor: "pointer", transition: "color 0.15s ease" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--white)"} onMouseLeave={e => e.currentTarget.style.color = "var(--muted-soft)"}>
          {exporting ? "Exporting…" : "↓ Export Graph"}
        </button>
        {onAddToReport && (
          <button type="button" onClick={handleAddToReport}
            style={{ flex: 1, height: 34, background: "var(--accent)", border: "none", borderRadius: 7, fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
            + Add to Report
          </button>
        )}
      </div>
    </div>
  );
}
