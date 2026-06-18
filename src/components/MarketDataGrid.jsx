import { useState } from "react";
import { TipBubble } from "./ReportTooltip.jsx";
import { MARKET_GRID_TIPS } from "../utils/tooltips.js";
import { isGraphable } from "../utils/graphData.js";

const SEC = { fontFamily: "Arial, sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", borderBottom: "2px solid var(--white)", paddingBottom: 6, marginBottom: 14 };
const TD_L = { fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text)", padding: "10px 0", borderBottom: "1px solid var(--border)", verticalAlign: "top" };
const TD_V = { fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--text)", textAlign: "right", padding: "10px 16px 10px 16px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" };
const TD_T = { padding: "10px 0 10px 8px", borderBottom: "1px solid var(--border)", textAlign: "right", verticalAlign: "middle", width: 28 };
const TD_G = { padding: "10px 4px 10px 0", borderBottom: "1px solid var(--border)", textAlign: "right", verticalAlign: "middle", width: 22 };

function BarChartIcon({ color = "currentColor" }) {
  return (
    <svg width={13} height={13} viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <rect x="0.5" y="7" width="3" height="5.5" rx="0.5" fill={color} />
      <rect x="5" y="4" width="3" height="8.5" rx="0.5" fill={color} />
      <rect x="9.5" y="1" width="3" height="11.5" rx="0.5" fill={color} />
    </svg>
  );
}

function fmtDollars(n) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}
function fmtNum(n) { return n.toLocaleString(); }
function fmtPct(n) { return `${n > 0 ? "+" : ""}${n.toFixed(1)}%`; }
function fmtChange(n) {
  const arrow = n > 0 ? "▲" : "▼";
  const color = n > 0 ? "#059669" : "#dc2626";
  return { label: `${arrow} ${Math.abs(n).toFixed(1)}%`, color };
}

const SECTIONS = [
  {
    title: "Home Price & Affordability",
    fields: [
      { key: "homeValue", label: "Home Value", fmt: fmtDollars },
      { key: "homeValueGrowthYoY", label: "Home Value Growth (YoY)", fmt: fmtPct, change: true },
      { key: "homeValueGrowthMoM", label: "Home Value Growth (MoM)", fmt: fmtPct, change: true },
      { key: "homeValueGrowth5Yr", label: "Home Value Growth (5-Year)", fmt: fmtPct, change: true },
      { key: "homeValueForecast1Yr", label: "1-Year Price Forecast", fmt: fmtPct, change: true },
    ],
  },
  {
    title: "Market Trends",
    fields: [
      { key: "forSaleInventory", label: "For Sale Inventory", fmt: fmtNum },
      { key: "forSaleInventoryGrowthYoY", label: "Inventory Growth (YoY)", fmt: fmtPct, change: true },
      { key: "newListings", label: "New Listings", fmt: fmtNum },
      { key: "homeSalesMonthly", label: "Home Sales (monthly)", fmt: fmtNum },
      { key: "avgDaysOnMarket", label: "Days on Market", fmt: (v) => `${v}d` },
      { key: "listToSaleRatio", label: "List / Sale Ratio", fmt: (v) => `${v}%` },
      { key: "priceReductions", label: "Price Reductions", fmt: (v) => `${v}%` },
    ],
  },
  {
    title: "Demographics",
    fields: [
      { key: "population", label: "Population", fmt: fmtNum },
      { key: "medianHouseholdIncome", label: "Median Household Income", fmt: fmtDollars },
      { key: "unemploymentRate", label: "Unemployment Rate", fmt: (v) => `${v}%` },
      { key: "ownerOccupiedPct", label: "Owner-Occupied %", fmt: (v) => `${v}%` },
      { key: "renterOccupiedPct", label: "Renter-Occupied %", fmt: (v) => `${v}%` },
      { key: "medianAge", label: "Median Age", fmt: (v) => `${v} yrs` },
      { key: "populationDensity", label: "Population Density", fmt: (v) => `${v.toLocaleString()}/sq mi` },
      { key: "housingUnits", label: "Housing Units", fmt: fmtNum },
      { key: "populationGrowth5Yr", label: "Population Growth (5-yr)", fmt: fmtPct, change: true },
      { key: "incomeGrowth5Yr", label: "Income Growth (5-yr)", fmt: fmtPct, change: true },
      { key: "housingUnitGrowthRate", label: "Housing Unit Growth Rate", fmt: fmtPct, change: true },
      { key: "buildingPermits", label: "Building Permits (12-mo)", fmt: fmtNum },
      { key: "povertyRate", label: "Poverty Rate", fmt: (v) => `${v}%` },
      { key: "familyHouseholdsPct", label: "Family Households %", fmt: (v) => `${v}%` },
      { key: "singleHouseholdsPct", label: "Single Households %", fmt: (v) => `${v}%` },
      { key: "mortgagedHomePct", label: "Mortgaged Home %", fmt: (v) => `${v}%` },
      { key: "avgTemperature", label: "Avg Temperature", fmt: (v) => `${v}°F` },
      { key: "birthDeathRatio", label: "Birth / Death Ratio", fmt: (v) => `${v}x` },
    ],
  },
];

function FieldRow({ label, source, tip, enabled, onToggle, fieldKey, onGraph, children }) {
  const [show, setShow] = useState(false);
  const [hoverGraph, setHoverGraph] = useState(false);
  const graphable = fieldKey && isGraphable(fieldKey);
  return (
    <tr style={{ opacity: enabled ? 1 : 0.3, transition: "opacity 0.15s ease" }}
      onMouseEnter={() => tip && setShow(true)}
      onMouseLeave={() => { setShow(false); }}
    >
      <td style={{ ...TD_L, position: "relative" }}>
        <div>{label}</div>
        {source && <div style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: "var(--muted)", marginTop: 1 }}>{source}</div>}
        {tip && show && <TipBubble text={tip} />}
      </td>
      <td style={TD_V}>{children}</td>
      {graphable ? (
        <td style={TD_G}>
          <button type="button" onClick={() => onGraph?.(fieldKey)} title={`Graph ${label}`}
            onMouseEnter={() => setHoverGraph(true)} onMouseLeave={() => setHoverGraph(false)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: hoverGraph ? "var(--accent)" : "var(--muted-faint)", transition: "color 0.15s ease", display: "flex", alignItems: "center" }}>
            <BarChartIcon color={hoverGraph ? "var(--accent)" : "var(--muted-faint)"} />
          </button>
        </td>
      ) : <td style={TD_G} />}
      <td style={TD_T}><ToggleBtn enabled={enabled} onToggle={onToggle} /></td>
    </tr>
  );
}

function ToggleBtn({ enabled, onToggle }) {
  return (
    <button type="button" onClick={onToggle} aria-label={enabled ? "Hide field" : "Show field"}
      style={{ width: 28, height: 16, borderRadius: 8, background: enabled ? "var(--accent)" : "var(--border)", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s ease", padding: 0 }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: enabled ? 15 : 3, transition: "left 0.2s ease", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

function DataSection({ section, market, toggles, onToggle, onGraph }) {
  const present = section.fields.filter(f => market[f.key] != null);
  if (!present.length) return null;

  return (
    <div style={{ marginTop: 28 }}>
      <div style={SEC}>{section.title}</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {present.map(f => {
            const val = market[f.key];
            const enabled = toggles[f.key] !== false;
            const change = f.change ? fmtChange(val) : null;
            const source = market[`${f.key}Source`];
            const tip = MARKET_GRID_TIPS[f.key];
            return (
              <FieldRow
                key={f.key}
                label={f.label}
                source={source}
                tip={tip}
                enabled={enabled}
                onToggle={() => onToggle(f.key)}
                fieldKey={f.key}
                onGraph={onGraph}
              >
                {change
                  ? <span style={{ color: change.color }}>{change.label}</span>
                  : f.fmt(val)}
              </FieldRow>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function buildInitialToggles(market) {
  const t = {};
  SECTIONS.forEach(s => s.fields.forEach(f => { if (market[f.key] != null) t[f.key] = true; }));
  return t;
}

function MarketDataGrid({ market, onGraph }) {
  const [toggles, setToggles] = useState(() => buildInitialToggles(market));
  function handleToggle(key) { setToggles(prev => ({ ...prev, [key]: !prev[key] })); }
  return (
    <>
      {SECTIONS.map(s => (
        <DataSection key={s.title} section={s} market={market} toggles={toggles} onToggle={handleToggle} onGraph={onGraph} />
      ))}
    </>
  );
}

export default MarketDataGrid;
