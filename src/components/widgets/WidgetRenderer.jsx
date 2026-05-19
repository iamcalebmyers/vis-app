import PriceForecastScore   from './PriceForecastScore'
import Rate30yr             from './Rate30yr'
import SellerBuyerMeter     from './SellerBuyerMeter'
import DOMTracker           from './DOMTracker'
import ListSaleRatio        from './ListSaleRatio'
import SellerPriceCutTracker from './SellerPriceCutTracker'
import InventoryLevel       from './InventoryLevel'
import OvervaluationIndex   from './OvervaluationIndex'
import NationalBenchmarkPanel from './NationalBenchmarkPanel'
import AppreciationForecast from './AppreciationForecast'
import MarketCyclePosition  from './MarketCyclePosition'
import HistoricalPriceChart from './HistoricalPriceChart'
import RentScore            from './RentScore'
import CashFlowEstimator    from './CashFlowEstimator'
import AffordabilityIndex   from './AffordabilityIndex'
import FedRateWatch         from './FedRateWatch'
import MarketScoreWidget    from './MarketScoreWidget'
import FedCalendarWidget    from './FedCalendarWidget'

const WIDGET_MAP = {
  market_score:           MarketScoreWidget,
  fed_calendar:           FedCalendarWidget,
  price_forecast_score:   PriceForecastScore,
  rate_30yr:              Rate30yr,
  seller_buyer_meter:     SellerBuyerMeter,
  dom_tracker:            DOMTracker,
  list_sale_ratio:        ListSaleRatio,
  price_cut_tracker:      SellerPriceCutTracker,
  inventory_level:        InventoryLevel,
  overvaluation_index:    OvervaluationIndex,
  national_benchmark:     NationalBenchmarkPanel,
  appreciation_forecast:  AppreciationForecast,
  cycle_position:         MarketCyclePosition,
  historical_price_chart: HistoricalPriceChart,
  rent_score:             RentScore,
  cash_flow_estimator:    CashFlowEstimator,
  affordability_index:    AffordabilityIndex,
  fed_rate_watch:         FedRateWatch,
}

export default function WidgetRenderer({ id }) {
  const Component = WIDGET_MAP[id]
  if (!Component) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '120px', flexDirection: 'column', gap: '6px',
      }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: 'var(--dim)' }}>Coming Soon</span>
      </div>
    )
  }
  return <Component />
}
