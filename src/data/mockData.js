// Raw data per CLAUDE.md mockData section.
// Used by reports + utilities for unformatted numbers.

export const MOCK_PROPERTY = {
  address: "2847 Riverside Drive",
  city: "Austin",
  state: "TX",
  zip: "78741",
  beds: 4,
  baths: 3,
  sqft: 2340,
  lotSize: "0.18 acres",
  yearBuilt: 2019,
  listingStatus: "Active",
  prevSalePrice: 418000,
  prevSaleDate: "Jun 2022",
  estimatedValue: 487500,
  estimatedValueRange: { low: 465000, high: 510000 },
  pricePerSqft: 208,
  annualTax: 9840,
  hoa: 120,
  floodZone: "Zone X - Low Risk",
  walkScore: 72,
  walkScoreLabel: "Very Walkable",
  schoolRating: 8,
  schoolName: "Zavala Elementary",
  garage: "2-car attached",
};

export const MOCK_MARKET = {
  area: "Austin, TX",
  medianPrice: 487000,
  medianPriceChange: -3.2,
  avgDaysOnMarket: 42,
  avgDaysChange: 14,
  activeListings: 4218,
  activeListingsChange: 22,
  listToSaleRatio: 97.1,
  listToSaleChange: -1.8,
  priceReductions: 24.3,
  priceReductionsChange: 6.1,
  avgPricePerSqft: 210,
  currentRate30yr: 6.84,
  nextFedMeeting: "Jun 12, 2026",
  fedExpectation: "Rate hold expected",
};

export const MOCK_AGENT = {
  aiName: "Ask Sarah",
  subdomain: "sarah",
  brandColor: "#2563EB",
  logoUrl: null,
  trainingText:
    "I specialize in Austin TX residential. My clients are mostly first-time buyers aged 28-40. Always be encouraging and explain everything simply.",
};

export const MOCK_AI_RESPONSE = {
  visScore: 74,
  visScoreLabel: "Good Value",
  visScoreReason:
    "Competitively priced against recent comps in a moderating but stable market.",
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
  score: 74,
  scoreLabel: "Good Value",
  estValue: "$487K",
  appreciation: "↑ +16.6%",
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
  score: 62,
  scoreLabel: "Balanced",
  medianPrice: "$487K",
  priceChange: "▼ -3.2% YOY",
  daysOnMarket: "42d",
  activeListings: "4,218",
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
