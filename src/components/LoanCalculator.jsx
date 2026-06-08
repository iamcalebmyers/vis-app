import { useState } from "react";
import { calcMonthlyPI, calcInsurance, calcPTI, fmtUSD, parseDollars } from "../utils/loanMath.js";

const TD_L = { fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text)", padding: "9px 0", borderBottom: "1px solid var(--border)" };
const TD_V = { fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--text)", textAlign: "right", padding: "9px 0", borderBottom: "1px solid var(--border)" };
const LABEL = { fontFamily: "Arial, sans-serif", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted)", marginBottom: 5 };

function NumInput({ value, onChange, prefix }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", background: "var(--border-soft)", border: `1px solid ${focused ? "var(--accent)" : "var(--border)"}`, borderRadius: 6, padding: "5px 8px", transition: "border-color 0.15s ease" }}>
      {prefix && <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--muted)", marginRight: 2 }}>{prefix}</span>}
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--white)", background: "transparent", border: "none", outline: "none", width: "100%", minWidth: 0 }}
      />
    </div>
  );
}

function TermToggle({ value, onChange, rates }) {
  const opts = [{ key: "30", label: "30yr" }, { key: "15", label: "15yr" }, { key: "arm", label: "ARM" }];
  return (
    <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
      {opts.map(({ key, label }, i) => (
        <button key={key} type="button" onClick={() => onChange(key)}
          style={{ flex: 1, padding: "6px 0", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, background: value === key ? "var(--accent)" : "var(--border-soft)", color: value === key ? "#fff" : "var(--muted)", border: "none", borderLeft: i > 0 ? "1px solid var(--border)" : "none", cursor: "pointer", transition: "background 0.15s ease, color 0.15s ease" }}>
          {label}
        </button>
      ))}
    </div>
  );
}

function LoanCalculator({ property, market }) {
  const initPrice = property?.listPrice || property?.estimatedValue || 487500;
  const rateMap = {
    "30": market?.currentRate30yr ?? 6.84,
    "15": market?.currentRate15yr ?? 6.21,
    arm: market?.currentRateArm ?? 6.05,
  };

  const [price, setPrice] = useState(initPrice);
  const [downPct, setDownPct] = useState(20);
  const [downMode, setDownMode] = useState("pct");
  const [term, setTerm] = useState("30");
  const [rateStr, setRateStr] = useState(String(rateMap["30"]));
  const [income, setIncome] = useState("");

  const downDollar = Math.round(price * downPct / 100);
  const principal = Math.max(0, price - downDollar);
  const rateNum = parseFloat(rateStr) || 0;
  const termYears = term === "15" ? 15 : 30;
  const pi = Math.round(calcMonthlyPI(principal, rateNum, termYears));
  const tax = Math.round((property?.annualTax || 0) / 12);
  const hoa = property?.hoaMonthly || 0;
  const insurance = calcInsurance(price);
  const total = pi + tax + hoa + insurance;
  const incomeNum = parseDollars(income);
  const pti = incomeNum > 0 ? calcPTI(total, incomeNum) : null;

  function handleTerm(key) {
    setTerm(key);
    setRateStr(String(rateMap[key]));
  }

  function handleDown(val) {
    const n = parseFloat(val) || 0;
    if (downMode === "pct") setDownPct(Math.min(100, n));
    else setDownPct(price > 0 ? Math.min(100, (n / price) * 100) : 0);
  }

  return (
    <div>
      {/* Inputs */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr", gap: 12, marginBottom: 20 }}>
        <div>
          <div style={LABEL}>Purchase price</div>
          <NumInput value={price} onChange={v => setPrice(parseFloat(v) || 0)} prefix="$" />
        </div>
        <div>
          <div style={{ ...LABEL, display: "flex", justifyContent: "space-between" }}>
            <span>Down payment</span>
            <button type="button" onClick={() => setDownMode(m => m === "pct" ? "dollar" : "pct")}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)", padding: 0, letterSpacing: "0.05em" }}>
              {downMode === "pct" ? "$ ↔" : "% ↔"}
            </button>
          </div>
          <NumInput
            value={downMode === "pct" ? downPct : downDollar}
            onChange={handleDown}
            prefix={downMode === "dollar" ? "$" : undefined}
          />
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: "var(--muted)", marginTop: 3 }}>
            {downMode === "pct" ? fmtUSD(downDollar) : `${downPct.toFixed(1)}%`}
          </div>
        </div>
        <div>
          <div style={LABEL}>Term</div>
          <TermToggle value={term} onChange={handleTerm} />
        </div>
        <div>
          <div style={LABEL}>Rate</div>
          <NumInput value={rateStr} onChange={setRateStr} />
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: "var(--muted)", marginTop: 3 }}>% / yr</div>
        </div>
      </div>

      {/* Breakdown */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr><td style={TD_L}>Principal & interest</td><td style={TD_V}>{fmtUSD(pi)}</td></tr>
          {tax > 0 && <tr><td style={TD_L}>Estimated property tax</td><td style={TD_V}>{fmtUSD(tax)}</td></tr>}
          {hoa > 0 && <tr><td style={TD_L}>HOA</td><td style={TD_V}>{fmtUSD(hoa)}</td></tr>}
          <tr><td style={TD_L}>Estimated insurance</td><td style={TD_V}>{fmtUSD(insurance)}</td></tr>
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "2px solid var(--white)", marginTop: 2 }}>
        <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, color: "var(--white)" }}>Total monthly</span>
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 26, color: "var(--accent)", letterSpacing: "-0.01em" }}>{fmtUSD(total)}</span>
      </div>

      {/* Optional income */}
      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ ...LABEL, marginBottom: 0, whiteSpace: "nowrap" }}>Annual income (optional)</div>
        <div style={{ width: 160 }}>
          <NumInput value={income} onChange={setIncome} prefix="$" />
        </div>
        {pti && (
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted-soft)" }}>
            This home represents <strong style={{ color: "var(--text)" }}>{pti}%</strong> of gross monthly income.
          </span>
        )}
      </div>

      <div style={{ marginTop: 10, fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)" }}>
        Estimates only. Insurance at 0.75%/yr of purchase price. Taxes and HOA from property data.
      </div>
    </div>
  );
}

export default LoanCalculator;
