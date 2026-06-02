// Session 8: display-only monthly breakdown using mock values.
// Session 12 adds editable inputs (price, down payment, term, rate,
// taxes/insurance toggle, optional income).

import { MOCK_LOAN_CARD } from "../data/mockData.js";

function InputRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 12,
        background: "var(--bg)",
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
          fontSize: 15,
          fontWeight: 700,
          color: "var(--text)",
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
        padding: "10px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          color: "var(--muted)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 15,
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
        paddingTop: 14,
        borderTop: "1px solid var(--border)",
        marginTop: 4,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 15,
          fontWeight: 700,
          color: "var(--white)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 28,
          fontWeight: 900,
          color: "var(--accent)",
          letterSpacing: "-0.01em",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function LoanCalculator({ inputs, breakdown = MOCK_LOAN_CARD }) {
  const inputDisplay = inputs || {
    price: "$487,500",
    downPayment: "20% · $97,500",
    term: "30 yr",
    rate: "6.84%",
  };

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
          marginBottom: 16,
        }}
      >
        Loan calculator
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          marginBottom: 20,
        }}
      >
        <InputRow label="Price" value={inputDisplay.price} />
        <InputRow label="Down payment" value={inputDisplay.downPayment} />
        <InputRow label="Term" value={inputDisplay.term} />
        <InputRow label="Rate" value={inputDisplay.rate} />
      </div>

      <LineItem label="Principal & interest" value={breakdown.principalAndInterest} />
      <LineItem label="Estimated property tax" value={breakdown.propertyTax} />
      <LineItem label="HOA" value={breakdown.hoa} />
      <LineItem label="Estimated insurance" value={breakdown.insurance} />
      <TotalRow label="Total monthly" value={breakdown.totalMonthly} />

      <p
        style={{
          marginTop: 14,
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          color: "var(--muted)",
          lineHeight: 1.5,
        }}
      >
        Estimates only. Insurance assumed at 0.75%/yr of value. Inputs
        become editable in Session 12.
      </p>
    </section>
  );
}

export default LoanCalculator;
