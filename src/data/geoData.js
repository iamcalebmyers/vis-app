// ── Historical price generator ───────────────────────────────────────────────
function genPrices(base, multiplier, startYear = 2000) {
  const rates = {
    2000:  0.07, 2001:  0.07, 2002:  0.08, 2003:  0.09, 2004:  0.11,
    2005:  0.13, 2006:  0.06, 2007: -0.03, 2008: -0.10, 2009: -0.12,
    2010: -0.03, 2011: -0.02, 2012:  0.03, 2013:  0.10, 2014:  0.07,
    2015:  0.06, 2016:  0.06, 2017:  0.07, 2018:  0.05, 2019:  0.04,
    2020:  0.08, 2021:  0.19, 2022:  0.05, 2023:  0.02, 2024:  0.03,
    2025:  0.04,
  }
  const months = []
  let price = base * multiplier
  for (let y = startYear; y <= 2025; y++) {
    for (let m = 0; m < 12; m++) {
      if (y === 2025 && m > 4) break
      const monthly = (rates[y] ?? 0.04) / 12
      const season  = 1 + 0.008 * Math.sin((m - 2) * Math.PI / 6)
      price *= (1 + monthly) * season
      months.push({ date: `${y}-${String(m + 1).padStart(2, '0')}`, price: Math.round(price) })
    }
  }
  return months
}

// ── Geographic mock data ─────────────────────────────────────────────────────
export const geoData = {
  national: {
    price_forecast_score: { score: 61, grade: 'B', trend: 'stable' },
    dom:        { current: 60, yearAgo: 53, peak2021: 37 },
    inventory:  { current: 1_090_000, yearAgo: 900_000, low2021: 534_649 },
    home_price: { median: 420_800, yoy: 2.1, peak2021pct: -4.3 },
    overvaluation: { pct: 14, status: 'overvalued', fairValue: 368_000 },
    price_cuts:    { pct: 23, yearAgo: 18, national: 23 },
    rate_30yr:     { rate: 6.82, weekChange: -0.05, rate15: 6.18, arm51: 6.04 },
    rent:          { median: 2_473, yoyGrowth: 3.1, national: 2_473 },
    affordability: { pctIncome: 34, status: 'stretched', medianIncome: 78_000 },
    list_sale:     { ratio: 98.7, yearAgo: 99.1 },
    appreciation:  { yr1: 2.1, yr3: 5.4, yr5: 3.8 },
    population:    { growth: 0.4, trend: 'stable' },
    seller_buyer:  { score: 62, label: "Seller's Market", inventoryScore: 55, domScore: 60, cutsScore: 45 },
    cycle:         { phase: 'expansion', monthsIn: 18 },
    market_score:  { score: 61, factors: { inventory: 55, dom: 60, priceCuts: 45, momentum: 62, demand: 65 } },
    rent_score:    { score: 58, yield: 5.2, vacancyRisk: 40, rentGrowth: 3.1, rentToIncome: 28 },
    job_market:    { strength: 65, unemployment: 4.1 },
    walk_score:    { walk: 52, bike: 47, transit: 41 },
    school_score:  { score: 68 },
    crime_index:   { score: 42, label: 'Moderate' },
  },

  state_tx: {
    price_forecast_score: { score: 68, grade: 'B+', trend: 'rising' },
    dom:        { current: 52, yearAgo: 45, peak2021: 29 },
    inventory:  { current: 118_000, yearAgo: 88_000, low2021: 42_000 },
    home_price: { median: 315_000, yoy: 3.2, peak2021pct: -6.1 },
    overvaluation: { pct: 9, status: 'slightly overvalued', fairValue: 289_000 },
    price_cuts:    { pct: 19, yearAgo: 14, national: 23 },
    rate_30yr:     { rate: 6.82, weekChange: -0.05, rate15: 6.18, arm51: 6.04 },
    rent:          { median: 1_680, yoyGrowth: 4.8, national: 2_473 },
    affordability: { pctIncome: 29, status: 'moderate', medianIncome: 67_000 },
    list_sale:     { ratio: 99.2, yearAgo: 99.5 },
    appreciation:  { yr1: 3.2, yr3: 7.1, yr5: 6.2 },
    population:    { growth: 1.9, trend: 'growing' },
    seller_buyer:  { score: 71, label: "Seller's Market", inventoryScore: 68, domScore: 72, cutsScore: 54 },
    cycle:         { phase: 'expansion', monthsIn: 22 },
    market_score:  { score: 68, factors: { inventory: 68, dom: 72, priceCuts: 54, momentum: 70, demand: 78 } },
    rent_score:    { score: 72, yield: 6.4, vacancyRisk: 28, rentGrowth: 4.8, rentToIncome: 24 },
    job_market:    { strength: 82, unemployment: 3.8 },
    walk_score:    { walk: 38, bike: 32, transit: 25 },
    school_score:  { score: 71 },
    crime_index:   { score: 38, label: 'Below Average' },
  },

  metro_austin: {
    price_forecast_score: { score: 54, grade: 'C+', trend: 'cooling' },
    dom:        { current: 48, yearAgo: 38, peak2021: 22 },
    inventory:  { current: 9_800, yearAgo: 6_200, low2021: 1_800 },
    home_price: { median: 528_000, yoy: -1.8, peak2021pct: -18.4 },
    overvaluation: { pct: 22, status: 'overvalued', fairValue: 433_000 },
    price_cuts:    { pct: 31, yearAgo: 22, national: 23 },
    rate_30yr:     { rate: 6.82, weekChange: -0.05, rate15: 6.18, arm51: 6.04 },
    rent:          { median: 1_890, yoyGrowth: -2.1, national: 2_473 },
    affordability: { pctIncome: 41, status: 'unaffordable', medianIncome: 89_000 },
    list_sale:     { ratio: 97.9, yearAgo: 98.8 },
    appreciation:  { yr1: -1.8, yr3: 4.2, yr5: 8.1 },
    population:    { growth: 2.8, trend: 'growing' },
    seller_buyer:  { score: 44, label: "Balanced / Cooling", inventoryScore: 38, domScore: 48, cutsScore: 32 },
    cycle:         { phase: 'hyper_supply', monthsIn: 14 },
    market_score:  { score: 54, factors: { inventory: 38, dom: 48, priceCuts: 32, momentum: 44, demand: 62 } },
    rent_score:    { score: 51, yield: 4.3, vacancyRisk: 58, rentGrowth: -2.1, rentToIncome: 32 },
    job_market:    { strength: 88, unemployment: 3.2 },
    walk_score:    { walk: 44, bike: 55, transit: 31 },
    school_score:  { score: 78 },
    crime_index:   { score: 45, label: 'Moderate' },
  },

  county_travis: {
    price_forecast_score: { score: 57, grade: 'B-', trend: 'cooling' },
    dom:        { current: 45, yearAgo: 36, peak2021: 20 },
    inventory:  { current: 4_200, yearAgo: 2_800, low2021: 820 },
    home_price: { median: 595_000, yoy: -2.4, peak2021pct: -16.2 },
    overvaluation: { pct: 26, status: 'overvalued', fairValue: 472_000 },
    price_cuts:    { pct: 28, yearAgo: 19, national: 23 },
    rate_30yr:     { rate: 6.82, weekChange: -0.05, rate15: 6.18, arm51: 6.04 },
    rent:          { median: 2_050, yoyGrowth: -1.4, national: 2_473 },
    affordability: { pctIncome: 44, status: 'unaffordable', medianIncome: 91_000 },
    list_sale:     { ratio: 97.4, yearAgo: 98.2 },
    appreciation:  { yr1: -2.4, yr3: 3.8, yr5: 9.2 },
    population:    { growth: 3.1, trend: 'growing' },
    seller_buyer:  { score: 48, label: "Balanced", inventoryScore: 42, domScore: 52, cutsScore: 38 },
    cycle:         { phase: 'hyper_supply', monthsIn: 12 },
    market_score:  { score: 57, factors: { inventory: 42, dom: 52, priceCuts: 38, momentum: 47, demand: 68 } },
    rent_score:    { score: 54, yield: 4.1, vacancyRisk: 52, rentGrowth: -1.4, rentToIncome: 34 },
    job_market:    { strength: 91, unemployment: 2.9 },
    walk_score:    { walk: 51, bike: 62, transit: 35 },
    school_score:  { score: 82 },
    crime_index:   { score: 38, label: 'Below Average' },
  },

  zip_78701: {
    price_forecast_score: { score: 63, grade: 'B', trend: 'stabilizing' },
    dom:        { current: 38, yearAgo: 32, peak2021: 14 },
    inventory:  { current: 142, yearAgo: 78, low2021: 18 },
    home_price: { median: 672_000, yoy: 0.8, peak2021pct: -14.1 },
    overvaluation: { pct: 31, status: 'overvalued', fairValue: 513_000 },
    price_cuts:    { pct: 22, yearAgo: 16, national: 23 },
    rate_30yr:     { rate: 6.82, weekChange: -0.05, rate15: 6.18, arm51: 6.04 },
    rent:          { median: 2_480, yoyGrowth: 1.2, national: 2_473 },
    affordability: { pctIncome: 49, status: 'unaffordable', medianIncome: 108_000 },
    list_sale:     { ratio: 98.1, yearAgo: 98.6 },
    appreciation:  { yr1: 0.8, yr3: 2.9, yr5: 10.4 },
    population:    { growth: 4.2, trend: 'growing' },
    seller_buyer:  { score: 61, label: "Slight Seller Advantage", inventoryScore: 58, domScore: 64, cutsScore: 52 },
    cycle:         { phase: 'expansion', monthsIn: 4 },
    market_score:  { score: 63, factors: { inventory: 58, dom: 64, priceCuts: 52, momentum: 63, demand: 74 } },
    rent_score:    { score: 67, yield: 4.4, vacancyRisk: 35, rentGrowth: 1.2, rentToIncome: 27 },
    job_market:    { strength: 94, unemployment: 2.6 },
    walk_score:    { walk: 88, bike: 76, transit: 62 },
    school_score:  { score: 86 },
    crime_index:   { score: 32, label: 'Low' },
  },
}

// ── Historical price data ────────────────────────────────────────────────────
export const historicalPrices = {
  national:      genPrices(148_000, 1.00),
  state_tx:      genPrices(148_000, 0.76),
  metro_austin:  genPrices(148_000, 1.12),
  county_travis: genPrices(148_000, 1.26),
  zip_78701:     genPrices(148_000, 1.44),
}

// 12-month rental trend per geo
export function rentSparkline(geo) {
  const base = geoData[geo]?.rent?.median ?? geoData.national.rent.median
  const g    = geoData[geo]?.rent?.yoyGrowth ?? 3.1
  return Array.from({ length: 12 }, (_, i) => ({
    month: i,
    rent: Math.round(base * (1 + (g / 100) * (i / 11))),
  }))
}

// Labels for each geo key
export const GEO_LABELS = {
  national:      '🇺🇸 National',
  state_tx:      'Texas',
  metro_austin:  'Austin Metro',
  county_travis: 'Travis Co., TX',
  zip_78701:     '78701',
}

export const GEO_HIERARCHY = [
  { key: 'national',      label: '🇺🇸 National',     level: 0 },
  { key: 'state_tx',      label: 'Texas',            level: 1 },
  { key: 'metro_austin',  label: 'Austin Metro',     level: 2 },
  { key: 'county_travis', label: 'Travis Co., TX',   level: 3 },
  { key: 'zip_78701',     label: '78701',             level: 4 },
]

export function getGeoData(geoKey, fallback = 'national') {
  return geoData[geoKey] ?? geoData[fallback]
}
