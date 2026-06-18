export function calcMonthlyPI(principal, annualRatePct, termYears) {
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function calcInsurance(homeValue) {
  return Math.round((homeValue * 0.0075) / 12);
}

export function calcPTI(totalMonthly, annualIncome) {
  if (!annualIncome || annualIncome <= 0) return null;
  return ((totalMonthly / (annualIncome / 12)) * 100).toFixed(1);
}

export function fmtUSD(n) {
  return "$" + Math.round(n).toLocaleString();
}

export function parseDollars(str) {
  return parseFloat(String(str).replace(/[$,]/g, "")) || 0;
}

export function calcDepreciation({
  purchasePrice,
  landValuePercent = 0.20,
  taxBracket = 0.32,
  yearsHeld = 10,
} = {}) {
  const landValue = purchasePrice * landValuePercent;
  const buildingValue = purchasePrice - landValue;
  const annualDeduction = buildingValue / 27.5;
  const annualTaxSavings = annualDeduction * taxBracket;
  const cumulativeDeduction = annualDeduction * yearsHeld;
  const recaptureExposure = cumulativeDeduction * 0.25;

  return {
    purchasePrice,
    landValue,
    buildingValue,
    annualDeduction,
    annualTaxSavings,
    cumulativeDeduction,
    recaptureExposure,
    taxBracket,
    landValuePercent,
    schedule: {
      year1:  annualDeduction,
      year5:  annualDeduction * 5,
      year10: annualDeduction * 10,
      year27: buildingValue,
    },
  };
}
