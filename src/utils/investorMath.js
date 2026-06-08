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
