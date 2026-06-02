// Session 8: display-only fact grid. Session 9 adds inline editing
// (user can correct or annotate any field) per CLAUDE.md spec.

const DASH = "—";

function fmtCurrency(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return DASH;
  return "$" + n.toLocaleString();
}

function FactRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        padding: "12px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          color: "var(--muted)",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          fontWeight: 700,
          color: "var(--text)",
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value || DASH}
      </span>
    </div>
  );
}

function PropertyFacts({ property }) {
  if (!property) return null;

  const left = [
    {
      label: "Estimated value",
      value: fmtCurrency(property.estimatedValue),
    },
    {
      label: "Previous sale",
      value:
        property.prevSalePrice
          ? `${fmtCurrency(property.prevSalePrice)} (${property.prevSaleDate || DASH})`
          : DASH,
    },
    {
      label: "Price per sq ft",
      value: property.pricePerSqft ? `$${property.pricePerSqft}` : DASH,
    },
    {
      label: "Annual tax",
      value: fmtCurrency(property.annualTax),
    },
    {
      label: "HOA",
      value: property.hoa ? `$${property.hoa}/mo` : DASH,
    },
  ];

  const right = [
    {
      label: "Flood zone",
      value: property.floodZone,
    },
    {
      label: "Walk score",
      value:
        property.walkScore
          ? `${property.walkScore} (${property.walkScoreLabel || DASH})`
          : DASH,
    },
    {
      label: "School rating",
      value:
        property.schoolRating
          ? `${property.schoolRating}/10 · ${property.schoolName || DASH}`
          : DASH,
    },
    {
      label: "Lot size",
      value: property.lotSize,
    },
    {
      label: "Garage",
      value: property.garage,
    },
  ];

  return (
    <section
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--muted)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        Property facts
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: 24,
        }}
      >
        <div>
          {left.map((f) => (
            <FactRow key={f.label} label={f.label} value={f.value} />
          ))}
        </div>
        <div>
          {right.map((f) => (
            <FactRow key={f.label} label={f.label} value={f.value} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PropertyFacts;
