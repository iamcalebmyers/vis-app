import GenerateReportButton from "./GenerateReportButton.jsx";
import {
  MOCK_PROPERTY_CARD,
  MOCK_LOAN_CARD,
  MOCK_MARKET_CARD,
  MOCK_RATE_CARD,
  MOCK_RENTAL_CARD,
  MOCK_DEAL_CARD,
  MOCK_RETURNS_CARD,
} from "../data/mockData.js";

const cardOuter = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  overflow: "hidden",
  marginTop: 10,
};

const cardHeader = {
  padding: "10px 14px",
  borderBottom: "1px solid var(--border)",
};

const headerLabel = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  color: "var(--muted)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const statRow = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 6,
  marginBottom: 12,
};
const statTwoRow = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 6,
  marginBottom: 12,
};
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 };

function StatBlock({ label, value, sublabel, accent }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        background: accent ? "var(--card-tint)" : "var(--border-soft)",
        borderRadius: 6,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--muted-faint)",
          letterSpacing: "0.1em",
          marginBottom: 4,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: accent ? 26 : 20,
          fontWeight: 600,
          color: accent ? "var(--accent)" : "var(--white)",
          lineHeight: 1,
          marginBottom: 3,
          letterSpacing: "-0.01em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
      {sublabel && (
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            color: accent ? "var(--accent)" : "var(--muted)",
          }}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
}

function FactPill({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "7px 10px",
        background: "var(--border-soft)",
        border: "1px solid var(--border)",
        borderRadius: 6,
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
          fontSize: 12,
          fontWeight: 600,
          color: "var(--white)",
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
        padding: "9px 0",
        borderBottom: "1px solid var(--border-soft)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          color: "var(--muted-soft)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--white)",
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
        paddingTop: 12,
        marginTop: 2,
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
          fontWeight: 600,
          color: "var(--accent)",
          letterSpacing: "-0.01em",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function PropertyCard({ data, showButton, onGenerateReport }) {
  return (
    <div style={cardOuter}>
      <div style={cardHeader}>
        <span style={headerLabel}>Property snapshot</span>
      </div>
      <div style={{ padding: "14px 14px 14px" }}>
        <div style={statRow}>
          <StatBlock
            label="Est. value"
            value={data.estValue}
            sublabel={data.appreciation}
            accent
          />
          <StatBlock
            label="Price / sqft"
            value={data.pricePerSqft}
            sublabel={data.pricePerSqftHint}
          />
          <StatBlock
            label="Days on mkt"
            value={data.daysOnMarket}
            sublabel="Area avg"
          />
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
    </div>
  );
}

function LoanCard({ data }) {
  return (
    <div style={cardOuter}>
      <div style={cardHeader}>
        <span style={headerLabel}>Monthly breakdown</span>
      </div>
      <div style={{ padding: "4px 14px 14px" }}>
        <LineItem label="Principal & interest" value={data.principalAndInterest} />
        <LineItem label="Est. property tax" value={data.propertyTax} />
        <LineItem label="HOA" value={data.hoa} />
        <LineItem label="Est. insurance" value={data.insurance} />
        <TotalRow label="Total monthly" value={data.totalMonthly} />
      </div>
    </div>
  );
}

function MarketCard({ data, showButton, onGenerateReport }) {
  return (
    <div style={cardOuter}>
      <div style={cardHeader}>
        <span style={headerLabel}>Market conditions</span>
      </div>
      <div style={{ padding: "14px 14px 14px" }}>
        <div style={statRow}>
          <StatBlock
            label="Median price"
            value={data.medianPrice}
            sublabel={data.priceChange}
            accent
          />
          <StatBlock
            label="Active listings"
            value={data.activeListings}
            sublabel={data.activeListingsChange}
          />
          <StatBlock
            label="Days on mkt"
            value={data.daysOnMarket}
            sublabel="Area avg"
          />
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
    </div>
  );
}

function RateCard({ data }) {
  return (
    <div style={cardOuter}>
      <div style={cardHeader}>
        <span style={headerLabel}>Rate snapshot</span>
      </div>
      <div style={{ padding: "14px 14px 14px" }}>
        <div style={statTwoRow}>
          <StatBlock
            label="30yr fixed"
            value={data.rate30yr}
            sublabel={data.rateChange}
          />
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
    </div>
  );
}

const REC_STYLE = {
  good:     { bg: "rgba(5,150,105,0.12)",  text: "#059669", label: "Good Deal" },
  marginal: { bg: "rgba(217,119,6,0.12)",  text: "#d97706", label: "Marginal"  },
  pass:     { bg: "rgba(220,38,38,0.12)",  text: "#dc2626", label: "Pass"      },
};

function RentalCard({ data }) {
  return (
    <div style={cardOuter}>
      <div style={cardHeader}><span style={headerLabel}>Rental Estimate</span></div>
      <div style={{ padding: "14px 14px 14px" }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted-faint)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Est. Monthly Rent</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 600, color: "var(--accent)", letterSpacing: "-0.01em", lineHeight: 1 }}>{data.estMonthlyRent}</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Range: {data.rentRange}</div>
        </div>
        {data.comps?.length > 0 && (
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted-faint)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Nearby Rentals</div>
            {data.comps.map((c, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < data.comps.length - 1 ? "1px solid var(--border-soft)" : "none" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text)" }}>{c.address}</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)" }}>{c.beds}bd · {c.baths}ba · {c.distance}</div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--white)" }}>{c.rent}</div>
              </div>
            ))}
          </div>
        )}
        {data.source && (
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: "var(--muted-faint)", marginTop: 10 }}>Source: {data.source}</div>
        )}
      </div>
    </div>
  );
}

function DealCard({ data, showButton, onGenerateReport }) {
  const rec = REC_STYLE[data.recommendation] || REC_STYLE.marginal;
  return (
    <div style={cardOuter}>
      <div style={{ ...cardHeader, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={headerLabel}>Deal Analysis</span>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, color: rec.text, background: rec.bg, padding: "2px 8px", borderRadius: 20 }}>{rec.label}</span>
      </div>
      <div style={{ padding: "14px 14px 14px" }}>
        <div style={statRow}>
          <StatBlock label="Purchase Price" value={data.purchasePrice} />
          <StatBlock label="Est. ARV" value={data.estARV} />
          <StatBlock label="Repair Est." value={data.repairEstimate} />
        </div>
        <div style={grid2}>
          <FactPill label="Potential Equity" value={data.potentialEquity} />
          <FactPill label="Max Offer (70%)" value={data.maxOffer} />
        </div>
        {showButton && (
          <GenerateReportButton onClick={() => onGenerateReport && onGenerateReport("deal", data)} />
        )}
      </div>
    </div>
  );
}

function ReturnsCard({ data }) {
  return (
    <div style={cardOuter}>
      <div style={cardHeader}><span style={headerLabel}>Returns Snapshot</span></div>
      <div style={{ padding: "14px 14px 14px" }}>
        <div style={grid2}>
          <StatBlock label="Gross Yield" value={data.grossYield} />
          <StatBlock label="Net Yield" value={data.netYield} />
          <StatBlock label="Cash-on-Cash" value={data.cashOnCash} />
          <StatBlock label="Cap Rate" value={data.capRate} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "2px solid var(--white)", marginTop: 12 }}>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, color: "var(--white)" }}>Monthly Cash Flow</span>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 24, color: "var(--accent)", letterSpacing: "-0.01em" }}>{data.monthlyCashFlow}</span>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_DATA = {
  property: MOCK_PROPERTY_CARD,
  loan: MOCK_LOAN_CARD,
  market: MOCK_MARKET_CARD,
  rate: MOCK_RATE_CARD,
  rental: MOCK_RENTAL_CARD,
  deal: MOCK_DEAL_CARD,
  returns: MOCK_RETURNS_CARD,
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
    case "rental":
      return <RentalCard data={finalData} />;
    case "deal":
      return (
        <DealCard
          data={finalData}
          showButton={showButton}
          onGenerateReport={onGenerateReport}
        />
      );
    case "returns":
      return <ReturnsCard data={finalData} />;
    default:
      return null;
  }
}

export default DataCard;
