// `source` declares where a widget's live data comes from.
//   'fred'    — FRED macro series only (rates, CPI, fed funds)
//   'zillow'  — raw Zillow housing data (price, inventory, DOM, rent)
//   'derived' — Zillow data run through heuristics in api/_lib/algorithms.js
//   'both'    — uses both FRED and Zillow
//   'mock'    — not yet wired to a live source (placeholder values)
// Unbuilt widgets (built: false) have no source — they render "Coming Soon".
export const ALL_WIDGETS = [
  // Market Signals
  { id: 'market_score',          title: 'Vis Market Score',           category: 'forecast',     size: 'medium', built: true,  source: 'derived' },
  { id: 'fed_calendar',          title: 'Fed Calendar',               category: 'agent',        size: 'medium', built: true,  source: 'mock'    },
  { id: 'price_forecast_score',  title: 'Price Forecast Score',       category: 'forecast',     size: 'medium', built: true,  source: 'both'    },
  { id: 'rate_30yr',             title: '30-Year Mortgage Rate',      category: 'market',       size: 'small',  built: true,  source: 'fred'    },
  { id: 'seller_buyer_meter',    title: 'Seller vs. Buyer Meter',     category: 'market',       size: 'medium', built: true,  source: 'derived' },
  { id: 'dom_tracker',           title: 'Days on Market Tracker',     category: 'market',       size: 'medium', built: true,  source: 'zillow'  },
  { id: 'list_sale_ratio',       title: 'List-to-Sale Ratio',         category: 'market',       size: 'small',  built: true,  source: 'mock'    },
  { id: 'price_cut_tracker',     title: 'Seller Price Cut Rate',      category: 'market',       size: 'medium', built: true,  source: 'mock'    },
  { id: 'inventory_level',       title: 'Active Inventory Level',     category: 'market',       size: 'small',  built: true,  source: 'zillow'  },
  { id: 'overvaluation_index',   title: 'Overvaluation Risk Index',   category: 'market',       size: 'medium', built: true,  source: 'both'    },
  { id: 'national_benchmark',    title: 'National Benchmarking',      category: 'market',       size: 'large',  built: true,  source: 'both'    },
  { id: 'listing_velocity',      title: 'New Listing Velocity',       category: 'market',       size: 'small',  built: false },
  // Forecasting
  { id: 'appreciation_forecast', title: 'Appreciation Forecast',      category: 'forecast',     size: 'medium', built: true,  source: 'derived' },
  { id: 'best_time_to_buy',      title: 'Best Month to Buy / Sell',   category: 'forecast',     size: 'medium', built: false },
  { id: 'cycle_position',        title: 'Market Cycle Position',      category: 'forecast',     size: 'medium', built: true,  source: 'derived' },
  { id: 'price_momentum',        title: 'Price Momentum Score',       category: 'forecast',     size: 'small',  built: false },
  // Historical
  { id: 'historical_price_chart',title: '25-Year Home Price History', category: 'data_explorer',size: 'large',  built: true,  source: 'zillow'  },
  { id: 'historical_dom_chart',  title: 'Historical DOM (25yr)',      category: 'data_explorer',size: 'large',  built: false },
  { id: 'market_comparison',     title: 'Market Comparison Tool',     category: 'data_explorer',size: 'large',  built: false },
  // Investment & Rental
  { id: 'rent_score',            title: 'Rent Score',                 category: 'investment',   size: 'medium', built: true,  source: 'derived' },
  { id: 'gross_yield',           title: 'Gross Rental Yield',         category: 'investment',   size: 'small',  built: false },
  { id: 'cap_rate',              title: 'Cap Rate Estimate',          category: 'investment',   size: 'small',  built: false },
  { id: 'cash_flow_estimator',   title: 'Cash Flow Estimator',        category: 'investment',   size: 'large',  built: true,  source: 'both'    },
  { id: 'brrrr_calculator',      title: 'BRRRR Calculator',           category: 'investment',   size: 'large',  built: false },
  { id: 'flip_estimator',        title: 'Fix & Flip Estimator',       category: 'investment',   size: 'large',  built: false },
  { id: 'breakeven_horizon',     title: 'Break-Even Horizon',         category: 'investment',   size: 'medium', built: false },
  // Agent Tools
  { id: 'affordability_index',   title: 'Affordability Index',        category: 'agent',        size: 'medium', built: true,  source: 'both'    },
  { id: 'mortgage_calculator',   title: 'Mortgage Calculator',        category: 'agent',        size: 'large',  built: false },
  { id: 'fed_rate_watch',        title: 'Fed Rate Watch',             category: 'agent',        size: 'small',  built: true,  source: 'fred'    },
  { id: 'inflation_overlay',     title: 'Inflation vs. Home Price',   category: 'agent',        size: 'large',  built: false },
  { id: 'seller_motivation',     title: 'Seller Motivation Tracker',  category: 'agent',        size: 'medium', built: false },
  // Neighborhood
  { id: 'school_score',          title: 'School Rating Score',        category: 'neighborhood', size: 'small',  built: false },
  { id: 'crime_index',           title: 'Crime Index',                category: 'neighborhood', size: 'small',  built: false },
  { id: 'walk_score',            title: 'Walk / Bike / Transit',      category: 'neighborhood', size: 'small',  built: false },
  { id: 'job_market',            title: 'Job Market Strength',        category: 'neighborhood', size: 'small',  built: false },
  { id: 'population_trend',      title: 'Population Growth Trend',    category: 'neighborhood', size: 'small',  built: false },
]

export const CATEGORY_LABELS = {
  forecast:     '🔮 Forecasting',
  market:       '📊 Market Signals',
  data_explorer:'📅 Data Explorer',
  investment:   '💰 Investment & Rental',
  agent:        '🏠 Agent Tools',
  neighborhood: '🏘️ Neighborhood',
}

export const SIZE_COLS = {
  small: 'col-span-1',
  medium: 'col-span-1',
  large: 'col-span-2',
}
