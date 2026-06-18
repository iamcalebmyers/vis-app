import { useState } from "react";
import { fetchGraphData } from "../utils/claudeApi.js";
import { GRAPHABLE_FIELDS, CHART_TYPE_LABELS, CHART_COLORS } from "../utils/graphData.js";
import GraphCard from "./GraphCard.jsx";

const yr = new Date().getFullYear();

export default function GraphRequestCard({ data, onAddToReport }) {
  const metricKey = data?.metric;
  const field = GRAPHABLE_FIELDS[metricKey];

  const [loc, setLoc] = useState(data?.location || "");
  const [chartType, setChartType] = useState(data?.chartType || field?.defaultChart || "line");
  const [colorScheme, setColorScheme] = useState("colorful");
  const [startDate, setStartDate] = useState(data?.dateRange?.start || `${yr - 4}-01`);
  const [endDate, setEndDate] = useState(data?.dateRange?.end || `${yr}-01`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(
    data?.points?.length
      ? { points: data.points, title: data.title || field?.label, subtitle: data.subtitle || loc, source: data.source || "" }
      : null
  );

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
      setError(err.message || "Failed to generate graph.");
    } finally {
      setLoading(false);
    }
  }

  const outer = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginTop: 10 };
  const hdr = { padding: "10px 14px", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" };
  const inputSt = { height: 34, padding: "0 10px", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 6, fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--white)", outline: "none", colorScheme: "dark" };
  const labelSt = { fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 5 };
  const chipSt = (active) => ({ height: 28, padding: "0 10px", borderRadius: 5, fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, cursor: "pointer", border: active ? "1px solid var(--accent)" : "1px solid var(--border)", background: active ? "var(--accent-soft)" : "var(--border-soft)", color: active ? "var(--accent)" : "var(--muted-soft)" });

  if (result) {
    return (
      <div style={outer}>
        <div style={hdr}>{field.label}</div>
        <div style={{ padding: 14 }}>
          <GraphCard
            metricLabel={field.label}
            chartType={chartType}
            colorScheme={colorScheme}
            data={result.points}
            unit={field.unit}
            title={result.title}
            subtitle={result.subtitle}
            source={result.source}
            onAddToReport={onAddToReport}
            compact
          />
          <button type="button" onClick={() => setResult(null)} style={{ marginTop: 8, width: "100%", height: 30, background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 6, fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, color: "var(--muted-soft)", cursor: "pointer" }}>
            ← Change settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={outer}>
      <div style={hdr}>Graph · {field.label}</div>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={labelSt}>Location</label>
          <input value={loc} onChange={e => setLoc(e.target.value)} placeholder="City, State or address" style={{ ...inputSt, width: "100%", boxSizing: "border-box" }} />
        </div>

        {needsDateRange && (
          <div>
            <label style={labelSt}>Date range</label>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="month" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ ...inputSt, flex: 1 }} />
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>to</span>
              <input type="month" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ ...inputSt, flex: 1 }} />
            </div>
          </div>
        )}

        <div>
          <label style={labelSt}>Chart type</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {field.charts.map(ct => (
              <button key={ct} type="button" onClick={() => setChartType(ct)} style={chipSt(chartType === ct)}>
                {CHART_TYPE_LABELS[ct] || ct}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 5 }}>
          {Object.entries(CHART_COLORS).map(([key, sc]) => (
            <button key={key} type="button" onClick={() => setColorScheme(key)} style={chipSt(colorScheme === key)}>{sc.label}</button>
          ))}
        </div>

        {error && <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#dc2626" }}>{error}</div>}

        <button type="button" onClick={handleGenerate} disabled={loading || !loc}
          style={{ height: 36, background: "var(--accent)", border: "none", borderRadius: 7, fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "#fff", cursor: loading || !loc ? "not-allowed" : "pointer", opacity: !loc ? 0.5 : 1 }}>
          {loading ? "Generating…" : "Generate Graph"}
        </button>
      </div>
    </div>
  );
}
