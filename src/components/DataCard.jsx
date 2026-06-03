import GenerateReportButton from "./GenerateReportButton.jsx";
import {
  MOCK_PROPERTY_CARD,
  MOCK_LOAN_CARD,
  MOCK_MARKET_CARD,
  MOCK_RATE_CARD,
} from "../data/mockData.js";

const container = {
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: 14,
  marginTop: 10,
  width: "100%",
};

const headerLabel = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  color: "var(--muted)",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  marginBottom: 12,
};

const statRow = { display: "flex", gap: 12, marginBottom: 12 };
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 };

function StatBlock({ label, value, sublabel, accent, sublabelAccent }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flex: 1,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--muted)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 26,
          fontWeight: 800,
          color: accent ? "var(--accent)" : "var(--white)",
          lineHeight: 1.05,
          letterSpacing: "-0.01em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
      {sublabel && (
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            color: sublabelAccent || accent ? "var(--accent)" : "var(--muted)",
          }}
        >
          {sublabel}
        </span>
      )}
    </div>
  );
}

function FactPill({ label, value }) {
  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 8,
        padding: "8px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          color: "var(--muted)",
          whiteSpace: "nowrap",
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
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function LineItem({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          color: "var(--muted)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 14,
          fontWeight: 700,
          color: "var(--text)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function TotalRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 10,
        borderTop: "1px solid var(--border)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          fontWeight: 700,
          color: "var(--white)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 22,
          fontWeight: 900,
          color: "var(--accent)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function PropertyCard({ data, showButton, onGenerateReport }) {
  return (
    <div style={container}>
      <div style={headerLabel}>Property snapshot</div>
      <div style={statRow}>
        <StatBlock label="Est. value" value={data.estValue} sublabel={data.appreciation} accent />
        <StatBlock label="Price / sqft" value={data.pricePerSqft} sublabel={data.pricePerSqftHint} />
        <StatBlock label="Days on mkt" value={data.daysOnMarket} sublabel="Area avg" />
      </div>
      <div style={grid2}>
        <FactPill label="Beds / Baths" value={`${data.beds} / ${data.baths}`} />
        <FactPill label="Sq ft" value={data.sqft} />
        <FactPill label="Year built" value={data.yearBuilt} />
        <FactPill label="School rating" value={data.schoolRating} />
      </div>
      {showButton && (
        <GenerateReportButton
          onClick={() =>
            onGenerateReport && onGenerateReport("property", data)
          }
        />
      )}
    </div>
  );
}

function LoanCard({ data }) {
  return (
    <div style={container}>
      <div style={headerLabel}>Monthly breakdown</div>
      <LineItem label="Principal & interest" value={data.principalAndInterest} />
      <LineItem label="Est. property tax" value={data.propertyTax} />
      <LineItem label="HOA" value={data.hoa} />
      <LineItem label="Est. insurance" value={data.insurance} />
      <TotalRow label="Total monthly" value={data.totalMonthly} />
    </div>
  );
}

function MarketCard({ data, showButton, onGenerateReport }) {
  return (
    <div style={container}>
      <div style={headerLabel}>Market conditions</div>
      <div style={statRow}>
        <StatBlock label="Median price" value={data.medianPrice} sublabel={data.priceChange} accent />
        <StatBlock label="Active listings" value={data.activeListings} sublabel={data.activeListingsChange} />
        <StatBlock label="Days on mkt" value={data.daysOnMarket} sublabel="Area average" />
      </div>
      <div style={grid2}>
        <FactPill label="Active listings" value={data.activeListings} />
        <FactPill label="List/Sale ratio" value={data.listSaleRatio} />
        <FactPill label="Price reductions" value={data.priceReductions} />
        <FactPill label="Avg price/sqft" value={data.avgPricePerSqft} />
      </div>
      {showButton && (
        <GenerateReportButton
          onClick={() =>
            onGenerateReport && onGenerateReport("market", data)
          }
        />
      )}
    </div>
  );
}

function RateCard({ data }) {
  return (
    <div style={container}>
      <div style={headerLabel}>Rate snapshot</div>
      <div style={statRow}>
        <StatBlock label="30yr fixed" value={data.rate30yr} sublabel={data.rateChange} />
        <StatBlock
          label="Monthly payment"
          value={data.monthlyPayment}
          sublabel="at 20% down on $487K"
          accent
        />
      </div>
      <div style={grid2}>
        <FactPill label="15yr Fixed" value={data.rate15yr} />
        <FactPill label="5/1 ARM" value={data.rateArm} />
        <FactPill label="Next Fed Meeting" value={data.nextFed} />
        <FactPill label="Fed Expectation" value={data.fedExpectation} />
      </div>
    </div>
  );
}

const DEFAULT_DATA = {
  property: MOCK_PROPERTY_CARD,
  loan: MOCK_LOAN_CARD,
  market: MOCK_MARKET_CARD,
  rate: MOCK_RATE_CARD,
};

function DataCard({ type, data, showButton = false, onGenerateReport }) {
  const finalData = data || DEFAULT_DATA[type];
  if (!finalData) return null;

  switch (type) {
    case "property":
      return (
        <PropertyCard
          data={finalData}
          showButton={showButton}
          onGenerateReport={onGenerateReport}
        />
      );
    case "loan":
      return <LoanCard data={finalData} />;
    case "market":
      return (
        <MarketCard
          data={finalData}
          showButton={showButton}
          onGenerateReport={onGenerateReport}
        />
      );
    case "rate":
      return <RateCard data={finalData} />;
    default:
      return null;
  }
}

export default DataCard;
