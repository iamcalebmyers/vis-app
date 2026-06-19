import { useState } from "react";
import { fetchGraphData } from "../utils/claudeApi.js";
import { GRAPHABLE_FIELDS, CHART_TYPE_LABELS, CHART_COLORS } from "../utils/graphData.js";
import GraphCard from "./GraphCard.jsx";

const yr = new Date().getFullYear();

export default function GraphModal({ metricKey, location, onClose, onAddToReport }) {
  const field = GRAPHABLE_FIELDS[metricKey];
  const [loc, setLoc] = useState(location || "");
  const [chartType, setChartType] = useState(field?.defaultChart || "line");
  const [colorScheme, setColorScheme] = useState("colorful");
  const [startDate, setStartDate] = useState(`${yr - 4}-01`);
  const [endDate, setEndDate] = useState(`${yr}-01`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  if (!field) return null;
  const needsDateRange = !field.noDateRange && chartType !== "hero_stat" && chartType !== "donut" && chartType !== "pie";

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchGraphData({
        metric: metricKey,
        metricLabel: field.label,
        location: loc,
        dateRange: needsDateRange ? { start: startDate, end: endDate } : null,
        chartType,
        unit: field.unit,
        companion: field.companion,
        companionLabel: field.companionLabel,
      });
      setResult(res);
    } catch (err) {
      setError(err.message || "Failed to generate graph. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputSt = { width: "100%", height: 36, padding: "0 10px", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 7, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--white)", outline: "none", boxSizing: "border-box", colorScheme: "dark" };
  const labelSt = { fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6 };
  const chipSt = (active) => ({ height: 30, padding: "0 12px", borderRadius: 6, fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, cursor: "pointer", border: active ? "1px solid var(--accent)" : "1px solid var(--border)", background: active ? "var(--accent-soft)" : "var(--border-soft)", color: active ? "var(--accent)" : "var(--muted-soft)", transition: "all 0.15s ease" });

  return (
    <div className="glass-scrim"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-overlay" style={{ width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Generate Graph</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 700, color: "var(--white)" }}>{field.label}</div>
          </div>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--muted)", lineHeight: 1, marginTop: 2 }}>×</button>
        </div>

        {result ? (
          <>
            <GraphCard
              metricLabel={field.label}
              chartType={chartType}
              colorScheme={colorScheme}
              data={result.points}
              unit={field.unit}
              title={result.title}
              subtitle={result.subtitle}
              source={result.source}
              onAddToReport={onAddToReport ? (d) => { onAddToReport(d); onClose(); } : null}
            />
            <button type="button" onClick={() => setResult(null)} style={{ marginTop: 12, width: "100%", height: 34, background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 7, fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--muted-soft)", cursor: "pointer" }}>
              ← Change settings
            </button>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelSt}>Location</label>
              <input value={loc} onChange={e => setLoc(e.target.value)} placeholder="City, State or address" style={inputSt} />
            </div>

            {needsDateRange && (
              <div>
                <label style={labelSt}>Date range</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="month" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ ...inputSt, flex: 1 }} />
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", flexShrink: 0 }}>to</span>
                  <input type="month" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ ...inputSt, flex: 1 }} />
                </div>
              </div>
            )}

            <div>
              <label style={labelSt}>Chart type</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {field.charts.map(ct => (
                  <button key={ct} type="button" onClick={() => setChartType(ct)} style={chipSt(chartType === ct)}>
                    {CHART_TYPE_LABELS[ct] || ct}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelSt}>Style</label>
              <div style={{ display: "flex", gap: 6 }}>
                {Object.entries(CHART_COLORS).map(([key, sc]) => (
                  <button key={key} type="button" onClick={() => setColorScheme(key)} style={chipSt(colorScheme === key)}>
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#dc2626", background: "rgba(220,38,38,0.08)", borderRadius: 6, padding: "8px 12px" }}>{error}</div>}

            <button type="button" onClick={handleGenerate} disabled={loading || !loc}
              style={{ height: 42, background: "var(--accent)", border: "none", borderRadius: 8, fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "#fff", cursor: loading || !loc ? "not-allowed" : "pointer", opacity: !loc ? 0.5 : 1 }}>
              {loading ? "Generating…" : "Generate Graph"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
