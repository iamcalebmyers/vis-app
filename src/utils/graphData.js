export const GRAPHABLE_FIELDS = {
  // HOME PRICE & AFFORDABILITY
  homeValue: { label: "Median Home Value", defaultChart: "line", charts: ["line", "area", "bar", "sparkline"], unit: "dollars" },
  homeValueGrowthYoY: { label: "Home Value Growth (YoY)", defaultChart: "bar", charts: ["bar", "diverging_bar", "lollipop", "line"], unit: "percent" },
  homeValueGrowthMoM: { label: "Home Value Growth (MoM)", defaultChart: "bar", charts: ["bar", "diverging_bar", "sparkline"], unit: "percent" },
  homeValueGrowth5Yr: { label: "5-Year Home Value Growth", defaultChart: "bar", charts: ["bar", "lollipop", "hero_stat"], unit: "percent" },
  homeValueForecast1Yr: { label: "1-Year Price Forecast", defaultChart: "hero_stat", charts: ["hero_stat", "bar"], unit: "percent" },
  // MARKET TRENDS
  forSaleInventory: { label: "For Sale Inventory", defaultChart: "area", charts: ["area", "line", "bar", "sparkline"], unit: "count" },
  forSaleInventoryGrowthYoY: { label: "Inventory Growth (YoY)", defaultChart: "bar", charts: ["bar", "diverging_bar", "line"], unit: "percent" },
  newListings: { label: "New Listings", defaultChart: "bar", charts: ["bar", "line", "sparkline"], unit: "count" },
  homeSalesMonthly: { label: "Monthly Home Sales", defaultChart: "bar", charts: ["bar", "line", "sparkline"], unit: "count" },
  avgDaysOnMarket: { label: "Days on Market", defaultChart: "line", charts: ["line", "bar", "area", "sparkline"], unit: "days" },
  listToSaleRatio: { label: "List / Sale Ratio", defaultChart: "line", charts: ["line", "bar", "sparkline"], unit: "percent" },
  priceReductions: { label: "Price Reductions %", defaultChart: "area", charts: ["area", "line", "bar", "diverging_bar"], unit: "percent" },
  // DEMOGRAPHICS
  population: { label: "Population", defaultChart: "bar", charts: ["bar", "line", "area"], unit: "count" },
  medianHouseholdIncome: { label: "Median Household Income", defaultChart: "bar", charts: ["bar", "line", "area"], unit: "dollars" },
  unemploymentRate: { label: "Unemployment Rate", defaultChart: "line", charts: ["line", "area", "bar", "sparkline"], unit: "percent" },
  ownerOccupiedPct: {
    label: "Owner vs. Renter Occupied", defaultChart: "donut",
    charts: ["donut", "pie", "horizontal_bar"], unit: "percent",
    companion: "renterOccupiedPct", companionLabel: "Renter Occupied", noDateRange: true,
  },
  housingUnits: { label: "Housing Units", defaultChart: "bar", charts: ["bar", "line", "area"], unit: "count" },
  populationGrowth5Yr: { label: "Population Growth (5-yr)", defaultChart: "bar", charts: ["bar", "diverging_bar", "lollipop", "hero_stat"], unit: "percent" },
  incomeGrowth5Yr: { label: "Income Growth (5-yr)", defaultChart: "bar", charts: ["bar", "diverging_bar", "lollipop"], unit: "percent" },
  housingUnitGrowthRate: { label: "Housing Unit Growth Rate", defaultChart: "bar", charts: ["bar", "diverging_bar", "lollipop"], unit: "percent" },
  buildingPermits: { label: "Building Permits", defaultChart: "bar", charts: ["bar", "line", "sparkline"], unit: "count" },
  povertyRate: { label: "Poverty Rate", defaultChart: "line", charts: ["line", "area", "bar"], unit: "percent" },
  familyHouseholdsPct: {
    label: "Household Composition", defaultChart: "donut",
    charts: ["donut", "pie", "horizontal_bar"], unit: "percent",
    companion: "singleHouseholdsPct", companionLabel: "Single Households", noDateRange: true,
  },
  mortgagedHomePct: {
    label: "Mortgaged vs. Owned Free & Clear", defaultChart: "donut",
    charts: ["donut", "pie"], unit: "percent",
    noDateRange: true, soloDonut: true,
  },
  // PROPERTY
  estimatedValue: { label: "Estimated Home Value", defaultChart: "line", charts: ["line", "area", "bar"], unit: "dollars", context: "property" },
  annualTax: { label: "Property Tax History", defaultChart: "bar", charts: ["bar", "line"], unit: "dollars", context: "property" },
  saleHistory: { label: "Sale Price History", defaultChart: "bar", charts: ["bar", "lollipop"], unit: "dollars", context: "property", useSaleHistory: true },
  // INVESTOR
  monthlyCashFlow: { label: "Monthly Cash Flow", defaultChart: "bar", charts: ["bar", "waterfall"], unit: "dollars", context: "investor" },
  grossYield: { label: "Gross Rental Yield", defaultChart: "line", charts: ["line", "bar", "sparkline"], unit: "percent", context: "investor" },
  capRate: { label: "Cap Rate", defaultChart: "line", charts: ["line", "bar", "sparkline"], unit: "percent", context: "investor" },
};

export const CHART_TYPE_LABELS = {
  line: "Line",
  area: "Area",
  bar: "Vertical Bar",
  horizontal_bar: "Horizontal Bar",
  sparkline: "Sparkline",
  donut: "Donut",
  pie: "Pie",
  scatter: "Scatter",
  heatmap: "Heat Map",
  waterfall: "Waterfall",
  lollipop: "Lollipop",
  hero_stat: "KPI Card",
  diverging_bar: "Diverging Bar",
};

export const CHART_COLORS = {
  colorful: {
    label: "Color",
    background: "#f7f6f3",
    bars: ["#C4622D", "#A07855", "#BFA882", "#7A9B87", "#D0C5B5", "#8B5E3C", "#5A8080"],
    line: "#C4622D",
    lineFill: "rgba(196,98,45,0.14)",
    grid: "#ddd8d3",
    axis: "#9b8ea0",
    text: "#6b6560",
    strong: "#2a2825",
    accentTop: "#C4622D",
    tooltip: { bg: "#ffffff", text: "#2a2825" },
  },
  black: {
    label: "Black",
    background: "#ffffff",
    bars: ["#111111", "#333333", "#555555", "#777777", "#999999", "#bbbbbb", "#dddddd"],
    line: "#111111",
    lineFill: "rgba(17,17,17,0.07)",
    grid: "#d8d8d8",
    axis: "#666666",
    text: "#444444",
    strong: "#111111",
    accentTop: "#111111",
    tooltip: { bg: "#ffffff", text: "#111111" },
  },
  grey: {
    label: "Grey",
    background: "#f8f8f8",
    bars: ["#666666", "#888888", "#aaaaaa", "#bbbbbb", "#cccccc", "#dddddd", "#eeeeee"],
    line: "#777777",
    lineFill: "rgba(100,100,100,0.09)",
    grid: "#e0e0e0",
    axis: "#aaaaaa",
    text: "#888888",
    strong: "#333333",
    accentTop: "#777777",
    tooltip: { bg: "#ffffff", text: "#333333" },
  },
};

export function isGraphable(fieldKey) {
  return fieldKey in GRAPHABLE_FIELDS;
}
