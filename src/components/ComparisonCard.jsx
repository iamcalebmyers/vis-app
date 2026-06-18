import { useState } from "react";
import { fmtUSD } from "../utils/loanMath.js";
import { TipBubble } from "./ReportTooltip.jsx";

// Row definitions. `better` decides which column gets highlighted:
//   "high" → largest value wins, "low" → smallest wins, null → no highlight.
// `tip` is the plain-language explanation shown on hover over the label.
const SECTIONS = [
  {
    title: "Property",
    rows: [
      { key: "price", label: "Price", fmt: usd, better: "low", tip: "The price you'd pay — current list price, or estimated value if it isn't actively listed." },
      { key: "pricePerSqft", label: "Price / sqft", fmt: usd, better: "low", tip: "Price divided by living area. A quick way to compare relative value across homes of different sizes." },
      { key: "beds", label: "Beds", fmt: plain, better: null, tip: "Number of bedrooms." },
      { key: "baths", label: "Baths", fmt: plain, better: null, tip: "Number of bathrooms." },
      { key: "sqft", label: "Sq ft", fmt: int, better: "high", tip: "Total finished living area in square feet." },
      { key: "yearBuilt", label: "Year built", fmt: plain, better: "high", tip: "The year the home was built. Newer construction usually means lower near-term maintenance." },
    ],
  },
  {
    title: "Monthly",
    rows: [
      { key: "rent", label: "Est. rent", fmt: usd, better: "high", tip: "Estimated monthly market rent based on comparable rentals." },
      { key: "mortgage", label: "Mortgage (P&I)", fmt: usd, better: "low", tip: "Monthly principal & interest, assuming 20% down on a 30-year loan at 6.84%." },
      { key: "taxMonthly", label: "Property tax", fmt: usd, better: null, tip: "Annual property tax divided by 12." },
      { key: "insurance", label: "Insurance", fmt: usd, better: null, tip: "Estimated monthly homeowner's insurance (about 0.75% of value per year)." },
      { key: "hoa", label: "HOA", fmt: usd, better: null, tip: "Monthly homeowners association dues, if any." },
      { key: "monthlyCashFlow", label: "Net cash flow", fmt: signedUsd, better: "high", strong: true, tip: "Rent minus mortgage, tax, insurance, and HOA. Positive means the property covers its own monthly costs." },
    ],
  },
  {
    title: "Returns",
    rows: [
      { key: "grossYield", label: "Gross yield", fmt: pct, better: "high", tip: "Annual rent ÷ price × 100. A quick income comparison before expenses." },
      { key: "netYield", label: "Net yield", fmt: pct, better: "high", tip: "Annual rent minus operating expenses, divided by price. More realistic than gross yield." },
      { key: "capRate", label: "Cap rate", fmt: pct, better: "high", tip: "Net operating income ÷ price, independent of financing. Used to value rentals like a business." },
      { key: "cashOnCash", label: "Cash-on-cash", fmt: pct, better: "high", tip: "Annual cash flow ÷ cash invested (down payment + closing costs). The return on your out-of-pocket money." },
    ],
  },
];

function plain(v) { return v == null ? "—" : String(v); }
function int(v) { return v == null ? "—" : Number(v).toLocaleString(); }
function usd(v) { return v == null ? "—" : fmtUSD(v); }
function signedUsd(v) { return v == null ? "—" : (v >= 0 ? "+" : "−") + fmtUSD(Math.abs(v)); }
function pct(v) { return v == null ? "—" : `${Number(v).toFixed(1)}%`; }

// Index of the winning column(s) for a row, or empty set when not comparable.
function winners(props, row) {
  if (!row.better || props.length < 2) return new Set();
  const vals = props.map((p) => p[row.key]);
  const nums = vals.filter((v) => v != null);
  if (nums.length < 2) return new Set();
  const best = row.better === "high" ? Math.max(...nums) : Math.min(...nums);
  const set = new Set();
  vals.forEach((v, i) => { if (v != null && v === best) set.add(i); });
  // If every column ties, highlight nothing.
  return set.size === props.length ? new Set() : set;
}

function LabelCell({ label, tip }) {
  const [show, setShow] = useState(false);
  return (
    <div
      onMouseEnter={() => tip && setShow(true)}
      onMouseLeave={() => setShow(false)}
      style={{
        position: "relative",
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        color: "var(--muted)",
        padding: "9px 12px",
        display: "flex",
        alignItems: "center",
        gap: 5,
        cursor: "default",
      }}
    >
      <span style={tip ? { borderBottom: "1px dotted var(--border)" } : undefined}>{label}</span>
      {tip && show && <TipBubble text={tip} />}
    </div>
  );
}

export default function ComparisonCard({ properties = [], onRemove }) {
  if (properties.length === 0) return null;
  const cols = `minmax(120px, 1.1fr) ${properties.map(() => "minmax(96px, 1fr)").join(" ")}`;

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
      {/* Header row: property addresses */}
      <div style={{ display: "grid", gridTemplateColumns: cols, borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-faint)", padding: "9px 12px", display: "flex", alignItems: "center" }}>
          Compare
        </div>
        {properties.map((p, i) => (
          <div key={i} style={{ padding: "10px 12px", borderLeft: "1px solid var(--border)", minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "var(--white)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.address || `Property ${i + 1}`}
                </div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {[p.city, p.state].filter(Boolean).join(", ")}
                </div>
              </div>
              {onRemove && (
                <button type="button" onClick={() => onRemove(i)} title="Remove" className="vis-no-export"
                  style={{ background: "none", border: "none", color: "var(--muted-faint)", cursor: "pointer", fontSize: 15, lineHeight: 1, padding: 0, flexShrink: 0 }}>
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title}>
          <div style={{ padding: "8px 12px 5px", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-faint)", background: "var(--border-soft)" }}>
            {section.title}
          </div>
          {section.rows.map((row) => {
            const win = winners(properties, row);
            return (
              <div key={row.key} style={{ display: "grid", gridTemplateColumns: cols, borderTop: "1px solid var(--border-soft)" }}>
                <LabelCell label={row.label} tip={row.tip} />
                {properties.map((p, i) => {
                  const isWin = win.has(i);
                  return (
                    <div key={i} style={{
                      padding: "9px 12px",
                      borderLeft: "1px solid var(--border-soft)",
                      fontFamily: "var(--font-mono)",
                      fontSize: row.strong ? 14 : 13,
                      fontWeight: row.strong || isWin ? 700 : 500,
                      color: isWin ? "var(--accent)" : "var(--white)",
                      background: isWin ? "var(--accent-soft)" : "transparent",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {row.fmt(p[row.key])}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}

      {properties.some((p) => p.source) && (
        <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)", fontFamily: "var(--font-sans)", fontSize: 10, color: "var(--muted-faint)" }}>
          Returns assume 20% down · 30-yr · 6.84%. Sources: {[...new Set(properties.map((p) => p.source).filter(Boolean))].join("; ")}
        </div>
      )}
    </div>
  );
}
