import { useState } from "react";

const LABEL = { fontFamily: "Arial, sans-serif", fontSize: 12, color: "var(--muted-soft)", padding: "6px 10px", borderBottom: "0.5px solid var(--border)", width: "25%" };
const VALUE = { fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--text)", padding: "6px 10px", borderBottom: "0.5px solid var(--border)", width: "25%" };

function GraphBtn({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button type="button" onClick={onClick} title="Graph this metric"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: "none", border: "none", cursor: "pointer", padding: "0 4px", marginLeft: 4, color: hover ? "var(--accent)" : "var(--muted-faint)", transition: "color 0.15s ease", verticalAlign: "middle", display: "inline-flex", alignItems: "center" }}>
      <svg width={11} height={11} viewBox="0 0 13 13" fill="none"><rect x="0.5" y="7" width="3" height="5.5" rx="0.5" fill="currentColor" /><rect x="5" y="4" width="3" height="8.5" rx="0.5" fill="currentColor" /><rect x="9.5" y="1" width="3" height="11.5" rx="0.5" fill="currentColor" /></svg>
    </button>
  );
}
const TH = { background: "var(--white)", color: "var(--card)", padding: "6px 10px", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left", fontFamily: "Arial, sans-serif" };

function SectionHeader({ title, attribution }) {
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", borderBottom: "2px solid var(--white)", paddingBottom: 6 }}>{title}</div>
      {attribution && <div style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: "var(--muted-faint)", marginTop: 3 }}>{attribution}</div>}
    </div>
  );
}

function EditablePair({ label, value, overrides, onOverride, graphHints, onGraph }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [hover, setHover] = useState(false);
  const override = overrides?.[label];
  const displayed = override !== undefined ? override : value;
  const isEdited = override !== undefined;

  function startEdit() { setDraft(displayed); setEditing(true); }
  function save() {
    const t = draft.trim();
    onOverride?.(label, !t || t === value ? undefined : t);
    setEditing(false);
  }

  return (
    <>
      <td style={LABEL} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {label}
          {isEdited && <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--accent)", background: "var(--accent-soft)", borderRadius: 3, padding: "1px 4px" }}>edited</span>}
        </span>
      </td>
      <td style={VALUE} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        {editing ? (
          <input autoFocus value={draft} onChange={e => setDraft(e.target.value)} onBlur={save}
            onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
            style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--white)", background: "var(--border-soft)", border: "1px solid var(--accent)", borderRadius: 4, padding: "2px 6px", width: "100%", outline: "none" }}
          />
        ) : (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
            <span style={{ color: isEdited ? "var(--white)" : "var(--text)" }}>{displayed}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {graphHints?.[label] && onGraph && <GraphBtn onClick={() => onGraph(graphHints[label])} />}
              {hover && onOverride && <button type="button" onClick={startEdit} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 11, padding: 0, lineHeight: 1, flexShrink: 0 }}>✎</button>}
            </span>
          </span>
        )}
      </td>
    </>
  );
}

function FactSection({ title, pairs, attribution, overrides, onOverride, graphHints, onGraph }) {
  const valid = pairs.filter(([, v]) => v != null && v !== "");
  if (!valid.length) return null;
  const rows = [];
  for (let i = 0; i < valid.length; i += 2) rows.push([valid[i], valid[i + 1] || null]);
  const shared = { overrides, onOverride, graphHints, onGraph };
  return (
    <>
      <SectionHeader title={title} attribution={attribution} />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {rows.map(([a, b], i) => (
            <tr key={i}>
              <EditablePair label={a[0]} value={a[1]} {...shared} />
              {b
                ? <EditablePair label={b[0]} value={b[1]} {...shared} />
                : <><td style={{ ...LABEL, borderBottom: "0.5px solid var(--border)" }} /><td style={{ ...VALUE, borderBottom: "0.5px solid var(--border)" }} /></>}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function SaleHistorySection({ history, onGraph }) {
  if (!history?.length) return null;
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24, borderBottom: "2px solid var(--white)", paddingBottom: 6 }}>
        <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", flex: 1 }}>Sale History</div>
        {onGraph && <GraphBtn onClick={() => onGraph({ metricKey: "saleHistory", unit: "dollars" })} />}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{["Date", "Event", "Price", "$/sq ft", "Source"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
        <tbody>
          {history.map((row, i) => (
            <tr key={i}>
              <td style={{ ...LABEL, fontFamily: "var(--font-mono)", fontWeight: 600, width: "auto" }}>{row.date}</td>
              <td style={{ ...LABEL, width: "auto" }}>{row.event}</td>
              <td style={{ ...VALUE, color: "var(--white)", width: "auto" }}>${row.price?.toLocaleString()}</td>
              <td style={{ ...VALUE, width: "auto" }}>${row.pricePerSqft}</td>
              <td style={{ ...LABEL, fontSize: 11, width: "auto" }}>{row.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

const FINANCIAL_GRAPH_HINTS = {
  "Est. value": { metricKey: "estimatedValue", unit: "dollars" },
  "Annual tax": { metricKey: "annualTax", unit: "dollars" },
};

function PropertyFacts({ property, overrides = {}, onOverride, onGraph }) {
  if (!property) return null;
  const $ = (n) => typeof n === "number" ? "$" + n.toLocaleString() : null;
  const score = (n, lbl) => n != null ? `${n} — ${lbl}` : null;
  const school = (name, rating) => name ? `${name}${rating != null ? ` · ${rating}/10` : ""}` : null;
  const bool = (v) => v === true ? "Yes" : v === false ? "No" : null;
  const shared = { overrides, onOverride };

  return (
    <div>
      <FactSection title="Public Facts" {...shared} pairs={[
        ["Type", property.propertyType], ["Stories", property.stories?.toString()],
        ["Sq ft", property.sqft?.toLocaleString()], ["Lot size", property.lotSize],
        ["Year built", property.yearBuilt?.toString()], ["Year renovated", property.yearRenovated?.toString()],
        ["County", property.county], ["APN", property.apn],
      ]} />
      <SaleHistorySection history={property.saleHistory} onGraph={onGraph} />
      <FactSection title="Parking & Garage" {...shared} pairs={[
        ["Garage spaces", property.garageSpaces > 0 ? property.garageSpaces.toString() : null],
        ["Attached", bool(property.garageAttached)],
        ["Parking features", property.parkingFeatures], ["Basement", property.basement],
      ]} />
      <FactSection title="Interior" {...shared} pairs={[
        ["Bedrooms", property.beds?.toString()], ["Full baths", property.baths?.toString()],
        ["Half baths", property.halfBaths > 0 ? property.halfBaths.toString() : null], ["Total rooms", property.totalRooms?.toString()],
        ["Additional rooms", property.additionalRooms], ["Laundry", property.laundryFeatures],
        ["Interior features", property.interiorFeatures], ["Appliances", property.appliances],
        ["Flooring", property.flooring],
      ]} />
      <FactSection title="Exterior" {...shared} pairs={[
        ["Construction", property.constructionMaterials], ["Roof", property.roof],
        ["Patio / porch", property.patioFeatures], ["Exterior features", property.exteriorFeatures],
        ["Green features", property.greenFeatures],
      ]} />
      <FactSection title="Financial" {...shared} graphHints={FINANCIAL_GRAPH_HINTS} onGraph={onGraph} pairs={[
        ["Est. value", $(property.estimatedValue)], ["List price", $(property.listPrice)],
        ["Price / sq ft", property.pricePerSqft ? `$${property.pricePerSqft}` : null],
        ["Previous sale", property.prevSalePrice ? `${$(property.prevSalePrice)} · ${property.prevSaleDate}` : null],
        ["Annual tax", property.annualTax ? `${$(property.annualTax)}${property.taxYear ? ` (${property.taxYear})` : ""}` : null],
        ["Tax assessed value", $(property.taxAssessedValue)],
        ["Days on market", property.daysOnMarket?.toString()], ["Price reductions", property.priceReductions?.toString()],
        ["Rent estimate", property.rentEstimate ? `~${$(property.rentEstimate)}/mo` : null],
        ["CDD (annual)", property.cddAnnual ? $(property.cddAnnual) : null],
      ]} />
      <FactSection title="HOA & Community" {...shared} pairs={[
        ["HOA", property.hoaName], ["Monthly dues", property.hoaMonthly ? `${$(property.hoaMonthly)}/mo` : null],
        ["Annual fee", $(property.hoaAnnual)], ["Frequency", property.hoaFrequency],
        ["HOA includes", property.hoaIncludes], ["Amenities", property.hoaAmenities],
        ["Approval required", bool(property.hoaApprovalRequired)], ["Pets allowed", bool(property.petsAllowed)],
        ["Deed restrictions", bool(property.deedRestrictions)], ["Community features", property.communityFeatures],
      ]} />
      <FactSection title="Location & Scores" {...shared} pairs={[
        ["Walk score", score(property.walkScore, property.walkScoreLabel)],
        ["Transit score", score(property.transitScore, property.transitScoreLabel)],
        ["Bike score", score(property.bikeScore, property.bikeScoreLabel)],
        ["Elementary school", school(property.schoolElementary, property.schoolElementaryRating)],
        ["Middle school", school(property.schoolMiddle, property.schoolMiddleRating)],
        ["High school", school(property.schoolHigh, property.schoolHighRating)],
        ["Zoning", property.zoning], ["Water source", property.waterSource],
        ["Sewer", property.sewer], ["Utilities", property.utilities],
      ]} />
      <FactSection title="Risk & Climate" attribution={property.riskDataSource ? `Climate risk data provided by ${property.riskDataSource}` : null} {...shared} pairs={[
        ["Flood risk", property.floodRisk || property.floodZone], ["Fire risk", property.fireRisk],
        ["Heat risk", property.heatRisk], ["Wind risk", property.windRisk],
        ["Air quality", property.airQuality],
      ]} />
    </div>
  );
}

export default PropertyFacts;
