export const TICKER_ITEMS = [
  { label: '30YR FIXED', value: '6.84%', change: '+0.03%', up: true  },
  { label: '15YR FIXED', value: '6.21%', change: '-0.01%', up: false },
  { label: '5/1 ARM',    value: '6.05%', change: '+0.07%', up: true  },
  { label: 'FED FUNDS',  value: '5.25%', change: '0.00%',  up: null  },
  { label: 'CPI YOY',    value: '3.2%',  change: '-0.1%',  up: false },
  { label: 'MBA INDEX',  value: '214.3', change: '+4.2',   up: true  },
  { label: 'MED PRICE',  value: '$436K', change: '+1.2%',  up: true  },
  { label: 'INVENTORY',  value: '1.93M', change: '+0.9%',  up: true  },
  { label: 'DOM AVG',    value: '55d',   change: '+7d',    up: false },
  { label: 'LIST/SALE',  value: '98.7%', change: '-0.2%',  up: false },
]

export const VIS_MARKET_READ = "Seller's market — rates elevated, supply tightening"

export const WEEKS = [
  'Mar 1', 'Mar 8', 'Mar 15', 'Mar 22', 'Mar 29',
  'Apr 5', 'Apr 12', 'Apr 19', 'Apr 26',
  'May 3', 'May 10', 'May 17',
]

export const CHART_DATA = {
  '30yr Rate':       [7.2, 7.1, 7.0, 6.95, 6.9, 6.88, 6.85, 6.84, 6.83, 6.85, 6.84, 6.82],
  'Median Price':    [410, 418, 422, 428, 430, 433, 435, 436, 437, 436, 436, 437],
  'Inventory':       [1.7, 1.75, 1.8, 1.84, 1.87, 1.9, 1.92, 1.93, 1.94, 1.93, 1.93, 1.94],
  'Days on Market':  [42, 44, 46, 48, 50, 52, 54, 55, 55, 56, 55, 55],
  'List/Sale Ratio': [99.4, 99.2, 99.1, 98.9, 98.9, 98.8, 98.8, 98.7, 98.6, 98.7, 98.7, 98.6],
  'Price Cuts':      [14, 14.5, 15, 15.5, 16, 16.5, 17, 17.6, 17.8, 17.7, 17.6, 17.8],
}

export const SNAPSHOT_CARDS = [
  { label: '30yr Rate',       value: '6.84%', change: '+0.03%', up: true,  spark: [7.2, 7.1, 7.0, 6.95, 6.9, 6.88, 6.85, 6.84] },
  { label: 'Median Price',    value: '$436K', change: '+1.2%',  up: true,  spark: [410, 418, 422, 428, 430, 433, 435, 436] },
  { label: 'Inventory',       value: '1.93M', change: '+0.9%',  up: true,  spark: [1.7, 1.75, 1.8, 1.84, 1.87, 1.9, 1.92, 1.93] },
  { label: 'Days on Market',  value: '55d',   change: '+7d',    up: false, spark: [42, 44, 46, 48, 50, 52, 54, 55] },
  { label: 'List/Sale Ratio', value: '98.7%', change: '-0.2%',  up: false, spark: [99.4, 99.2, 99.1, 98.9, 98.9, 98.8, 98.8, 98.7] },
  { label: 'Price Cuts',      value: '17.6%', change: '+1.6%',  up: false, spark: [14, 14.5, 15, 15.5, 16, 16.5, 17, 17.6] },
]

export const GEO_OPTIONS = [
  'National', 'Northeast', 'Southeast', 'Midwest', 'West',
  'Austin TX', 'Miami FL', 'Denver CO',
]

export const FOMC_DATES = [
  { date: 'Jun 12, 2026', note: 'Rate hold expected · 26 days', isNext: true  },
  { date: 'Jul 31, 2026', note: 'Projected',                    isNext: false },
  { date: 'Sep 18, 2026', note: 'Projected',                    isNext: false },
  { date: 'Nov  6, 2026', note: 'Projected',                    isNext: false },
]
