export function monthlyPayment(principal, annualRate, termYears = 30) {
  const r = annualRate / 100 / 12
  const n = termYears * 12
  if (r === 0) return principal / n
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

export function cashFlow({ homePrice, downPctg, rate, rent, taxMo, insuranceMo, hoaMo, maintPctg }) {
  const loan       = homePrice * (1 - downPctg / 100)
  const mortgage   = monthlyPayment(loan, rate)
  const maint      = homePrice * (maintPctg / 100) / 12
  const expenses   = mortgage + taxMo + insuranceMo + hoaMo + maint
  const monthly    = rent - expenses
  const annual     = monthly * 12
  const downAmount = homePrice * (downPctg / 100)
  const coc        = annual / downAmount * 100
  const capRate    = (annual + mortgage * 12) / homePrice * 100  // NOI / price
  return { monthly, annual, coc, capRate, mortgage, expenses }
}

export function brrrr({ purchase, rehab, arv, newLoan, rent, rate = 6.82 }) {
  const totalIn  = purchase + rehab
  const equity   = arv - newLoan
  const cashLeft = totalIn - newLoan
  const mortgage = monthlyPayment(newLoan, rate)
  const monthly  = rent - mortgage
  const roi      = cashLeft > 0 ? (monthly * 12) / cashLeft * 100 : Infinity
  return { equity, cashLeft, monthly, roi }
}

export function flip({ purchase, rehab, arv, holdingMonths, sellCostPct = 8 }) {
  const sellCosts  = arv * (sellCostPct / 100)
  const totalIn    = purchase + rehab
  const gross      = arv - totalIn - sellCosts
  const roi        = (gross / totalIn) * 100
  const annualRoi  = roi / (holdingMonths / 12)
  return { gross, roi, annualRoi }
}

export function overvaluationPct(price, medianIncome, historicalMultiple = 5.5) {
  const fairValue = medianIncome * historicalMultiple
  return ((price - fairValue) / fairValue) * 100
}
