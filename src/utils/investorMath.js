import { calcMonthlyPI, calcInsurance } from "./loanMath.js";

export function calcCashOnCash(annualCashFlow, totalCashInvested) {
  if (!totalCashInvested || totalCashInvested <= 0) return null;
  return ((annualCashFlow / totalCashInvested) * 100).toFixed(1);
}

export function calcCapRate(noi, propertyValue) {
  if (!propertyValue || propertyValue <= 0) return null;
  return ((noi / propertyValue) * 100).toFixed(1);
}

export function calcGrossRentalYield(monthlyRent, purchasePrice) {
  if (!purchasePrice || purchasePrice <= 0) return null;
  return (((monthlyRent * 12) / purchasePrice) * 100).toFixed(1);
}

export function calcNetRentalYield(monthlyRent, annualExpenses, purchasePrice) {
  if (!purchasePrice || purchasePrice <= 0) return null;
  return (((monthlyRent * 12 - annualExpenses) / purchasePrice) * 100).toFixed(1);
}

export function calcMonthlyCashFlow(monthlyRent, mortgage, tax, insurance, hoa = 0, maintenance = 0) {
  return Math.round(monthlyRent - mortgage - tax - insurance - hoa - maintenance);
}

export function calcARVMaxOffer(arv, repairs) {
  return Math.round(arv * 0.7 - repairs);
}

export function dealRecommendation(purchasePrice, arv, repairs) {
  const maxOffer = arv * 0.7 - repairs;
  if (purchasePrice <= maxOffer * 0.9) return "good";
  if (purchasePrice <= maxOffer * 1.05) return "marginal";
  return "pass";
}

// Turn raw web-sourced facts for one property into the full set of derived
// investor metrics. Used by the Compare area so the API stays token-light
// (raw facts only) and all math happens on the client.
//
// raw: { address, city, state, listPrice, estimatedValue, rentEstimate,
//        annualTax, hoaMonthly, sqft, beds, baths, yearBuilt, estARV, source }
// opts: { downPct=0.20, ratePct=6.84, termYears=30, closingPct=0.03 }
export function computePropertyMetrics(raw = {}, opts = {}) {
  const { downPct = 0.20, ratePct = 6.84, termYears = 30, closingPct = 0.03 } = opts;

  const price = num(raw.listPrice) ?? num(raw.estimatedValue) ?? null;
  const rent = num(raw.rentEstimate);
  const annualTax = num(raw.annualTax);
  const hoaMonthly = num(raw.hoaMonthly) ?? 0;
  const sqft = num(raw.sqft);

  let mortgage = null, insurance = null, taxMonthly = null;
  let monthlyCashFlow = null, grossYield = null, netYield = null;
  let capRate = null, cashOnCash = null, pricePerSqft = null, maxOffer = null;

  if (price) {
    const loanAmount = price * (1 - downPct);
    mortgage = Math.round(calcMonthlyPI(loanAmount, ratePct, termYears));
    insurance = calcInsurance(price);
    pricePerSqft = sqft ? Math.round(price / sqft) : null;

    const arv = num(raw.estARV) ?? price;
    maxOffer = calcARVMaxOffer(arv, 0);

    if (annualTax != null) taxMonthly = Math.round(annualTax / 12);

    if (rent != null) {
      monthlyCashFlow = calcMonthlyCashFlow(rent, mortgage, taxMonthly ?? 0, insurance, hoaMonthly);
      grossYield = toNum(calcGrossRentalYield(rent, price));

      const annualExpenses = (annualTax ?? 0) + insurance * 12 + hoaMonthly * 12;
      netYield = toNum(calcNetRentalYield(rent, annualExpenses, price));

      const noi = rent * 12 - annualExpenses;
      capRate = toNum(calcCapRate(noi, price));

      const cashInvested = price * downPct + price * closingPct;
      cashOnCash = toNum(calcCashOnCash(monthlyCashFlow * 12, cashInvested));
    }
  }

  return {
    address: raw.address || "",
    city: raw.city || "",
    state: raw.state || "",
    source: raw.source || "",
    beds: num(raw.beds),
    baths: num(raw.baths),
    yearBuilt: num(raw.yearBuilt),
    sqft,
    price,
    pricePerSqft,
    rent,
    mortgage,
    taxMonthly,
    insurance,
    hoa: hoaMonthly,
    monthlyCashFlow,
    grossYield,
    netYield,
    capRate,
    cashOnCash,
    maxOffer,
  };
}

function num(v) {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[$,%\s]/g, ""));
  return isNaN(n) ? null : n;
}

// The calc* helpers return fixed-decimal strings (or null); normalize to number.
function toNum(v) {
  if (v == null) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}
