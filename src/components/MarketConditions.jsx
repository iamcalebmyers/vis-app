// Session 8: market metric grid using MOCK_MARKET. Session 10 may
// extend with sparklines / additional context.

function fmtChange(value, suffix = "%") {
  if (typeof value !== "number") return null;
  const arrow = value > 0 ? "▲" : value < 0 ? "▼" : "·";
  const abs = Math.abs(value);
  const formatted = Number.isInteger(abs) ? abs : abs.toFixed(1);
  return { arrow, text: `${formatted}${suffix}`, positive: value > 0, negative: value < 0 };
}

function Metric({ label, value, change }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 16,
        background: "var(--border-soft)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 22,
          fontWeight: 800,
          color: "var(--white)",
          letterSpacing: "-0.01em",
          lineHeight: 1.1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
      {change && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--muted)",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span aria-hidden="true">{change.arrow}</span>
          {change.text}
        </span>
      )}
    </div>
  );
}

function fmtPrice(n) {
  if (typeof n !== "number") return "—";
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

function MarketConditions({ market }) {
  if (!market) return null;

  const metrics = [
    {
      label: "Median price",
      value: fmtPrice(market.medianPrice),
      change: fmtChange(market.medianPriceChange, "% YoY"),
    },
    {
      label: "Days on market",
      value: `${market.avgDaysOnMarket}d`,
      change: fmtChange(market.avgDaysChange, "d"),
    },
    {
      label: "Active listings",
      value: market.activeListings?.toLocaleString() || "—",
      change: fmtChange(market.activeListingsChange, "%"),
    },
    {
      label: "List / Sale ratio",
      value: `${market.listToSaleRatio}%`,
      change: fmtChange(market.listToSaleChange, " pts"),
    },
    {
      label: "Price reductions",
      value: `${market.priceReductions}%`,
      change: fmtChange(market.priceReductionsChange, " pts"),
    },
    {
      label: "Avg price / sqft",
      value: `$${market.avgPricePerSqft}`,
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
          marginBottom: 4,
        }}
      >
        Area market conditions
      </div>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          color: "var(--muted)",
          marginBottom: 16,
        }}
      >
        {market.area}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        {metrics.map((m) => (
          <Metric key={m.label} {...m} />
        ))}
      </div>
    </section>
  );
}

export default MarketConditions;
