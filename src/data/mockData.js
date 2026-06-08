// Raw data per CLAUDE.md mockData section.
// Used by reports + utilities for unformatted numbers.

export const MOCK_PROPERTY = {
  // Core identifiers
  address: "2847 Riverside Drive",
  city: "Austin",
  state: "TX",
  zip: "78741",
  photoUrl: null,

  // Public facts
  propertyType: "Single Family Residential",
  stories: 2,
  beds: 4,
  baths: 3,
  sqft: 2340,
  lotSize: "0.18 acres",
  yearBuilt: 2019,
  yearRenovated: null,
  listingStatus: "Active",
  county: "Travis County",
  apn: "0303-1102-0600",

  // Parking & garage
  garageSpaces: 2,
  garageAttached: true,
  parkingFeatures: "Garage Door Opener",
  garage: "2-car attached",

  // Interior
  halfBaths: 1,
  totalRooms: 8,
  additionalRooms: "Loft",
  laundryFeatures: "Laundry Room",
  interiorFeatures: "High Ceilings, Open Floorplan, Walk-in Closet(s), Stone Counters",
  appliances: "Dishwasher, Microwave, Refrigerator, Washer/Dryer",
  flooring: "Hardwood, Tile",

  // Exterior
  constructionMaterials: "Frame, Stucco",
  roof: "Composition Shingle",
  patioFeatures: "Covered Patio, Screened",
  exteriorFeatures: "Rain Gutters, Sidewalk",
  greenFeatures: "Energy Star Windows, LED Lighting",

  // Financial
  prevSalePrice: 418000,
  prevSaleDate: "Jun 2022",
  estimatedValue: 487500,
  estimatedValueRange: { low: 465000, high: 510000 },
  pricePerSqft: 208,
  listPrice: 495000,
  annualTax: 9840,
  taxYear: 2024,
  taxAssessedValue: 412000,
  daysOnMarket: 18,
  priceReductions: 1,
  rentEstimate: 2800,
  cddAnnual: null,

  // HOA & community
  hoa: 120,
  hoaName: "Riverside HOA",
  hoaMonthly: 120,
  hoaAnnual: 1440,
  hoaFrequency: "Monthly",
  hoaIncludes: "Trash, Exterior Maintenance",
  hoaAmenities: "Pool, Fitness Center, Dog Park",
  hoaApprovalRequired: false,
  petsAllowed: true,
  deedRestrictions: true,
  communityFeatures: "Pool, Sidewalks, Dog Park, Playground",

  // Location & scores
  walkScore: 72,
  walkScoreLabel: "Very Walkable",
  transitScore: 35,
  transitScoreLabel: "Some Transit",
  bikeScore: 48,
  bikeScoreLabel: "Bikeable",
  schoolElementary: "Zavala Elementary",
  schoolElementaryRating: 8,
  schoolMiddle: "Martin Middle School",
  schoolMiddleRating: 7,
  schoolHigh: "Travis High School",
  schoolHighRating: 6,
  schoolRating: 8,
  schoolName: "Zavala Elementary",
  zoning: "SF-3",

  // Utilities
  waterSource: "Public",
  sewer: "Public Sewer",
  utilities: "Cable, Electricity, Natural Gas, Sewer Connected",

  // Risk & climate
  floodZone: "Zone X - Low Risk",
  floodRisk: "Minimal",
  fireRisk: "Minimal",
  heatRisk: "Major",
  windRisk: "Minor",
  airQuality: "Good",
  riskDataSource: "First Street",

  // Sources actually used — AI populates this with only what it found
  dataSources: ["Public records", "MLS", "Walk Score®", "GreatSchools", "First Street"],

  // Sale history
  saleHistory: [
    { date: "Jun 2022", event: "Sold", price: 418000, pricePerSqft: 179, source: "MLS" },
    { date: "Mar 2019", event: "Sold", price: 312000, pricePerSqft: 133, source: "Public Records" },
    { date: "Jan 2015", event: "Sold", price: 241000, pricePerSqft: 103, source: "Public Records" },
  ],
};

export const MOCK_MARKET = {
  area: "Austin, TX",

  // Price & Affordability
  homeValue: 487000,                    homeValueSource: "Zillow ZHVI",
  homeValueGrowthYoY: -3.2,            homeValueGrowthYoYSource: "Zillow ZHVI",
  homeValueGrowthMoM: -0.4,            homeValueGrowthMoMSource: "Zillow ZHVI",
  homeValueGrowth5Yr: 28.4,            homeValueGrowth5YrSource: "Zillow ZHVI",
  homeValueForecast1Yr: 1.2,           homeValueForecast1YrSource: "Zillow",

  // Market Trends
  forSaleInventory: 4218,              forSaleInventorySource: "Realtor.com",
  forSaleInventoryGrowthYoY: 22,       forSaleInventoryGrowthYoYSource: "Realtor.com",
  newListings: 1840,                   newListingsSource: "Realtor.com",
  homeSalesMonthly: 892,               homeSalesMonthlySource: "Zillow",
  avgDaysOnMarket: 42,                 avgDaysOnMarketSource: "Realtor.com",
  avgDaysChange: 14,
  listToSaleRatio: 97.1,               listToSaleRatioSource: "MLS",
  listToSaleChange: -1.8,
  priceReductions: 24.3,               priceReductionsSource: "Realtor.com",
  priceReductionsChange: 6.1,
  avgPricePerSqft: 210,

  // Demographics
  population: 978908,                  populationSource: "US Census Bureau ACS",
  medianHouseholdIncome: 75000,        medianHouseholdIncomeSource: "US Census Bureau ACS",
  unemploymentRate: 3.8,               unemploymentRateSource: "US Census Bureau ACS",
  ownerOccupiedPct: 44.2,              ownerOccupiedPctSource: "US Census Bureau ACS",
  renterOccupiedPct: 55.8,             renterOccupiedPctSource: "US Census Bureau ACS",
  medianAge: 33.4,                     medianAgeSource: "US Census Bureau ACS",
  populationDensity: 3006,             populationDensitySource: "US Census Bureau ACS",
  housingUnits: 412000,                housingUnitsSource: "US Census Bureau ACS",
  populationGrowth5Yr: 15.2,           populationGrowth5YrSource: "US Census Bureau ACS",
  incomeGrowth5Yr: 8.4,               incomeGrowth5YrSource: "US Census Bureau ACS",
  housingUnitGrowthRate: 18.1,         housingUnitGrowthRateSource: "US Census Bureau ACS",
  buildingPermits: 1240,               buildingPermitsSource: "US Census Bureau",
  povertyRate: 12.1,                   povertyRateSource: "US Census Bureau ACS",
  familyHouseholdsPct: 48.3,           familyHouseholdsPctSource: "US Census Bureau ACS",
  singleHouseholdsPct: 32.1,           singleHouseholdsPctSource: "US Census Bureau ACS",
  mortgagedHomePct: 61.4,              mortgagedHomePctSource: "US Census Bureau ACS",
  avgTemperature: 68,                  avgTemperatureSource: "NCEI",
  birthDeathRatio: 1.8,                birthDeathRatioSource: "US Census Bureau",

  // Rate context (kept for RateContext block + LoanCalculator pre-fill)
  currentRate30yr: 6.84,
  currentRate15yr: 6.21,
  currentRateArm: 6.05,
  nextFedMeeting: "Jun 12, 2026",
  fedExpectation: "Rate hold expected",

  // Legacy fields — still used by MarketConditions.jsx compact grid in PropertyReport
  medianPrice: 487000,
  medianPriceChange: -3.2,
  activeListings: 4218,
  activeListingsChange: 22,
};

export const MOCK_AGENT = {
  aiName: "Ask Sarah",
  subdomain: "sarah",
  brandColor: "#2563EB",
  logoUrl: null,
  trainingText:
    "I specialize in Austin TX residential. My clients are mostly first-time buyers aged 28-40. Always be encouraging and explain everything simply.",
};

export const MOCK_MARKET_AI = {
  aiSummary:
    "Austin's housing market has shifted meaningfully from its 2022 peak. Home values are down 3.2% year-over-year and days on market have nearly doubled, giving buyers considerably more leverage than they had two years ago. Inventory is up 22% and nearly a quarter of listings have taken price reductions, signaling that sellers are adjusting to the new rate environment. The median home value of $487K remains above the national average, supported by a young, growing population with above-average income growth. The 1-year Zillow forecast projects modest appreciation of 1.2%, suggesting the market is stabilizing rather than continuing to slide. Demographics remain a long-term tailwind: Austin's median age of 33.4 and above-average income growth point to sustained housing demand. The risk is that inventory continues to rise faster than absorption, putting further pressure on prices in the near term.",
  keyStrengths: [
    "Young median age (33.4) and strong income growth support long-term demand",
    "Inventory stabilizing — absorption rate holding above 2021 lows",
    "1-year price forecast positive at +1.2% (Zillow)",
  ],
  keyRisks: [
    "Active inventory up 22% YoY — supply outpacing demand near-term",
    "24.3% of listings have taken price reductions",
    "Days on market up 14 days YoY — buyer urgency near zero",
  ],
  bestSuitedFor:
    "Buyers with a 3–5 year horizon who can take advantage of reduced competition and seller concessions.",
};

export const MOCK_AI_RESPONSE = {
  aiSummary:
    "2847 Riverside Drive presents a solid opportunity in Austin's 78741 ZIP code. The estimated value of $487,500 is supported by recent comparable sales, and at $208 per square foot it sits in line with the neighborhood average. The Austin market has moderated over the past year with days on market rising and price reductions becoming more common, giving buyers more negotiating room than in 2022. The 2019 build means modern systems without near-term renovation risk. The 8/10 school rating and Zone X flood status add durable value that holds through market cycles. At current rates a 20% down payment puts monthly principal and interest near $2,590, improving if rates fall. The main risk is broader market softening with nearly a quarter of area listings taking price cuts.",
  keyStrengths: [
    "2019 build - modern systems, no immediate renovation costs",
    "8/10 school rating at Zavala Elementary",
    "Zone X flood zone - lowest risk category",
  ],
  keyRisks: [
    "Austin market softening - days on market up 14 days year over year",
    "24% of area listings have taken price reductions",
  ],
  bestSuitedFor:
    "Families prioritizing school quality and modern construction with long-term holding plans.",
};

// Pre-formatted display values used by DataCard.jsx (Session 6).
// These are exact strings the card renders — separated from the raw
// data above so layout and formatting can stay pixel-perfect.

export const MOCK_PROPERTY_CARD = {
  estValue: "$487K",
  appreciation: "↑ +16.6%",
  pricePerSqft: "$208",
  pricePerSqftHint: "Area avg $210",
  daysOnMarket: "42d",
  beds: 4,
  baths: 3,
  sqft: "2,340",
  yearBuilt: 2019,
  schoolRating: "8/10",
};

export const MOCK_LOAN_CARD = {
  principalAndInterest: "$2,590",
  propertyTax: "$820",
  hoa: "$120",
  insurance: "$147",
  totalMonthly: "$3,677",
};

export const MOCK_MARKET_CARD = {
  medianPrice: "$487K",
  priceChange: "▼ -3.2% YOY",
  activeListings: "4,218",
  activeListingsChange: "▲ +22%",
  daysOnMarket: "42d",
  listSaleRatio: "97.1%",
  priceReductions: "24.3%",
  avgPricePerSqft: "$210",
};

export const MOCK_RATE_CARD = {
  rate30yr: "6.84%",
  rateChange: "▲ +0.03%",
  monthlyPayment: "$2,590",
  rate15yr: "6.21%",
  rateArm: "6.05%",
  nextFed: "Jun 12, 2026",
  fedExpectation: "Rate hold expected",
};

export const MOCK_INVESTOR_AI = {
  aiSummary:
    "2847 Riverside Drive presents a mixed investor picture in Austin's 78741 submarket. The estimated rent of $2,800/month reflects solid demand from the area's young professional demographic, and the 2019 build minimizes near-term capital expenditure risk. At the listed price of $487,500, gross yield comes in at 6.9% — above the Austin average but not exceptional for an investor. The deal analysis flags this as marginal against the 70% ARV rule, which is standard for fix-and-flip but less critical for a buy-and-hold strategy where appreciation and rent growth drive long-term returns. Austin's rental market has remained resilient despite home price corrections, with vacancy rates staying below 5% in this ZIP code. The primary risk is interest rate exposure — at 6.84%, cash flow is thin and any vacancy event erodes the margin. Investors should stress-test at a 7.5%+ rate environment and model one month of vacancy annually. The HOA at $120/month is modest. Property tax at $9,840/year is a meaningful drag and reflects Travis County's above-average effective tax rate. If rates fall by 100bps over the hold period, cash-on-cash improves materially. This property rewards a patient, long-term holder more than a short-term flipper.",
  keyStrengths: [
    "2019 construction — no major capex expected for 10+ years",
    "Sub-5% vacancy rate in 78741 ZIP code",
    "Rent growth potential as Austin market stabilizes",
  ],
  keyRisks: [
    "Thin cash flow margin — one vacancy month erases two months of cash flow",
    "High property tax rate (Travis County) compresses net yield",
  ],
  bestSuitedFor:
    "Buy-and-hold investors with a 5–10 year horizon who can absorb near-term rate pressure in exchange for long-term Austin appreciation.",
};

export const MOCK_RENTAL_CARD = {
  estMonthlyRent: "$2,800",
  rentRange: "$2,600 – $3,100",
  comps: [
    { address: "2901 Riverside Dr", beds: 3, baths: 2, rent: "$2,650", distance: "0.2mi" },
    { address: "4412 E Riverside Dr", beds: 4, baths: 3, rent: "$2,950", distance: "0.4mi" },
    { address: "3108 Govalle Ave", beds: 4, baths: 2, rent: "$2,750", distance: "0.6mi" },
  ],
  source: "Zillow, Apartments.com",
};

export const MOCK_DEAL_CARD = {
  purchasePrice: "$487,500",
  estARV: "$530,000",
  repairEstimate: "$25,000",
  potentialEquity: "$17,500",
  maxOffer: "$346,000",
  recommendation: "marginal",
};

export const MOCK_RETURNS_CARD = {
  grossYield: "6.9%",
  netYield: "4.8%",
  cashOnCash: "5.2%",
  capRate: "5.1%",
  monthlyCashFlow: "+$310/mo",
};
