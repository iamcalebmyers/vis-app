import { useRef, useState } from "react";

const HEAT_STOPS = ["#E8E2D6", "#D4C8B4", "#B87E60", "#C4603A", "#8B3A20"];
const MONTH_ORDER = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}

function heatColor(t) {
  const clamped = Math.max(0, Math.min(1, t));
  const n = HEAT_STOPS.length - 1;
  const i = Math.min(Math.floor(clamped * n), n - 1);
  const local = clamped * n - i;
  const [r1,g1,b1] = hexToRgb(HEAT_STOPS[i]);
  const [r2,g2,b2] = hexToRgb(HEAT_STOPS[i+1]);
  return `rgb(${Math.round(r1+(r2-r1)*local)},${Math.round(g1+(g2-g1)*local)},${Math.round(b1+(b2-b1)*local)})`;
}

function sortCols(cols) {
  const allMonths = cols.every(c => MONTH_ORDER.includes(c.toUpperCase()));
  if (allMonths) return [...cols].sort((a,b) => MONTH_ORDER.indexOf(a.toUpperCase()) - MONTH_ORDER.indexOf(b.toUpperCase()));
  return [...cols].sort();
}

function fmt(v, unit) {
  if (v == null) return "—";
  if (unit === "dollars") return v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v}`;
  if (unit === "percent") return `${v}%`;
  if (unit === "days") return `${v}d`;
  return String(v);
}

export default function HeatMapCard({ data = [], title, subtitle, source, metricLabel, unit, scaleInvert, onAddToReport }) {
  const cardRef = useRef();
  const [exporting, setExporting] = useState(false);

  const rows = [...new Map(data.map(d => [d.row, d.row])).values()];
  const rawCols = [...new Set(data.map(d => d.col))];
  const cols = sortCols(rawCols);

  const values = data.map(d => d.value).filter(v => v != null);
  const min = Math.min(...values);
  const max = Math.max(...values);

  function t(v) {
    const raw = max === min ? 0.5 : (v - min) / (max - min);
    return scaleInvert ? 1 - raw : raw;
  }

  async function handleExport() {
    setExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, { backgroundColor: "#FAF8F3", scale: 2, useCORS: true });
      const link = document.createElement("a");
      link.download = `${(title || "heatmap").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setExporting(false);
    }
  }

  const eyebrow = metricLabel || subtitle || "";

  const gridCols = `48px ${cols.map(() => "1fr").join(" ")}`;

  const labelStyle = {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 300,
    fontSize: 8,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#7D8A96",
  };

  return (
    <div>
      {/* Exportable card */}
      <div ref={cardRef} style={{ background: "#FAF8F3", borderRadius: 8, padding: "28px 28px 22px", border: "1px solid #EDE8E0" }}>
        {/* Accent line */}
        <div style={{ width: 24, height: 1.5, background: "#C4603A", borderRadius: 1, marginBottom: 14 }} />

        {/* Eyebrow */}
        <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#B87E60", marginBottom: 8 }}>
          {eyebrow}
        </div>

        {/* Headline */}
        {title && (
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400, fontSize: 19, lineHeight: 1.35, color: "#2A2825", marginBottom: 24 }}>
            {title}
          </div>
        )}

        {/* Month column headers */}
        <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: "0 4px", marginBottom: 4 }}>
          <div />
          {cols.map(col => (
            <div key={col} style={{ ...labelStyle, textAlign: "center", paddingBottom: 4 }}>{col}</div>
          ))}
        </div>

        {/* Data rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {rows.map(row => (
            <div key={row} style={{ display: "grid", gridTemplateColumns: gridCols, gap: "0 4px", alignItems: "center" }}>
              <div style={{ ...labelStyle, textAlign: "right", paddingRight: 8, lineHeight: 1.2 }}>
                {row}
              </div>
              {cols.map(col => {
                const pt = data.find(d => d.row === row && d.col === col);
                const v = pt?.value;
                const color = v != null ? heatColor(t(v)) : "#E8E2D6";
                return (
                  <div
                    key={col}
                    title={v != null ? fmt(v, unit) : "—"}
                    style={{ height: 28, background: color, borderRadius: 2 }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7D8A96", flexShrink: 0 }}>
            {scaleInvert ? "SLOW" : "LOW"}
          </span>
          <div style={{ flex: 1, height: 6, borderRadius: 1, background: "linear-gradient(to right, #E8E2D6, #D4C8B4, #B87E60, #C4603A, #8B3A20)" }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7D8A96", flexShrink: 0 }}>
            {scaleInvert ? "FAST" : "HIGH"}
          </span>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7D8A96" }}>
            {source || ""}
          </span>
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 13, color: "#C4603A", fontStyle: "italic" }}>
            Vis
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button type="button" onClick={handleExport} disabled={exporting}
          style={{ flex: 1, height: 34, background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 7, fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--muted-soft)", cursor: "pointer", transition: "color 0.15s ease" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--white)"} onMouseLeave={e => e.currentTarget.style.color = "var(--muted-soft)"}>
          {exporting ? "Exporting…" : "↓ Export Graph"}
        </button>
        {onAddToReport && (
          <button type="button" onClick={() => onAddToReport({ chartType: "heatmap", data, unit, title, subtitle, source, metricLabel, scaleInvert })}
            style={{ flex: 1, height: 34, background: "var(--accent)", border: "none", borderRadius: 7, fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
            + Add to Report
          </button>
        )}
      </div>
    </div>
  );
}
