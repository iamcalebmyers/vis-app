// Plain-language field explanations shown on hover in reports.
// Keyed by field key (MarketDataGrid) or exported by section.

export const MARKET_GRID_TIPS = {
  // Home Price & Affordability
  homeValue:             "Estimated median home value based on recent sales and automated valuation models.",
  homeValueGrowthYoY:    "How much median home values have changed compared to 12 months ago.",
  homeValueGrowthMoM:    "Month-over-month value change — useful for spotting short-term momentum shifts.",
  homeValueGrowth5Yr:    "Total home value appreciation over the past five years — reflects long-term market health.",
  homeValueForecast1Yr:  "Model-based estimate of where home values may be in 12 months. Not a guarantee.",

  // Market Trends
  forSaleInventory:          "Total homes actively listed for sale. More inventory = more buyer options and negotiating power.",
  forSaleInventoryGrowthYoY: "How inventory has changed vs. a year ago. Rising inventory generally shifts toward a buyer's market.",
  newListings:               "New homes added to the market in the past month — tracks whether sellers are entering or exiting.",
  homeSalesMonthly:          "Homes that closed in the past month. High volume signals strong demand.",
  avgDaysOnMarket:           "Average days from listing to accepted offer. Lower = stronger seller's market; higher = more negotiating room.",
  listToSaleRatio:           "What homes actually sold for vs. asking price. Above 100% = bidding wars; below 97% = negotiating room.",
  priceReductions:           "Share of active listings that cut their price at least once. Higher = more motivated sellers.",

  // Demographics
  population:           "Total population based on the latest census estimates.",
  medianHouseholdIncome:"The midpoint household income — half earn more, half earn less. Higher incomes support stronger home prices.",
  unemploymentRate:     "Percentage of the labor force actively looking for work. Lower rates support housing demand.",
  ownerOccupiedPct:     "Share of units occupied by their owners. Higher owner-occupancy signals neighborhood stability.",
  renterOccupiedPct:    "Share of units occupied by renters. Useful for investors evaluating rental demand.",
  medianAge:            "The midpoint age of residents. Younger populations often drive higher rental demand.",
  populationDensity:    "Residents per square mile. Higher-density markets tend to see stronger appreciation and rental demand.",
  housingUnits:         "Total housing units (occupied and vacant) — context for understanding inventory relative to demand.",
  populationGrowth5Yr:  "Population change over five years. Growing populations drive housing demand and can support appreciation.",
  incomeGrowth5Yr:      "How household incomes have changed over five years — an indicator of economic health and affordability trends.",
  housingUnitGrowthRate:"Rate at which new units are being added. High growth relieves price pressure; low growth supports appreciation.",
  buildingPermits:      "New construction permits issued in the past 12 months — a leading indicator of future housing supply.",
  povertyRate:          "Percentage of residents living below the federal poverty line.",
  familyHouseholdsPct:  "Share of households that are families — correlates with demand for larger homes in good school districts.",
  singleHouseholdsPct:  "Share of one-person households. Higher in urban areas — indicator of studio and 1BR rental demand.",
  mortgagedHomePct:     "Percentage of owner-occupied homes with a mortgage. Very low can indicate long-tenure owners or an older population.",
  avgTemperature:       "Annual average temperature for this area.",
  birthDeathRatio:      "Ratio of births to deaths. Above 1x means the population is growing naturally, independent of migration.",
};

export const PROPERTY_MARKET_TIPS = {
  "Median price":      "The midpoint of all home sale prices in this area — half sold above, half below.",
  "Days on market":    "Average days from listing to accepted offer. Lower = stronger seller's market.",
  "Active listings":   "Total homes currently for sale. More listings = more buyer options and negotiating power.",
  "List / Sale ratio": "What homes actually sold for vs. asking price. Above 100% = bidding wars; below 97% = negotiating room.",
  "Price reductions":  "Share of active listings that cut their price at least once. Higher = more motivated sellers.",
};

export const DEAL_TIPS = {
  "Purchase Price":        "The price you're paying for the property.",
  "Estimated ARV":         "After Repair Value — estimated market value after all renovations, based on comparable sales.",
  "Repair Estimate":       "Your projected cost to bring the property to market-ready or rent-ready condition.",
  "Max Offer (70% Rule)":  "Classic fix-and-flip guideline: ARV × 0.70 − repairs. Buying at or below this protects your profit margin.",
  "Potential Equity":      "The gap between ARV and your all-in cost. Your built-in cushion against market fluctuations.",
};

export const RETURNS_TIPS = {
  "Gross Rental Yield":   "Annual rent ÷ purchase price × 100. A quick comparison of income potential before expenses.",
  "Net Rental Yield":     "Annual rent minus operating expenses, divided by purchase price. More realistic than gross — accounts for what you actually keep.",
  "Cash-on-Cash Return":  "Annual cash flow ÷ cash invested (down payment + closing costs). The true return on your out-of-pocket money.",
  "Cap Rate":             "Net operating income ÷ property value, independent of financing. Used to compare properties and value them like a business.",
};

export const PROJECTION_TIPS = {
  "Gross Rent":           "Total rent received before any expenses — your revenue starting point.",
  "Est. Expenses (mortgage, tax, insurance, HOA)": "All monthly costs: mortgage P&I, property tax, insurance, and HOA. Does not include vacancy, capex, or management fees.",
};
