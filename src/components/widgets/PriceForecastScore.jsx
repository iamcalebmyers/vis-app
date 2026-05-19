import { useGeo } from '../../context/GeoContext'
import { getGeoData, geoData } from '../../data/geoData'
import { gradeFromScore, scoreColor, scoreLabel } from '../../utils/formatters'
import ArcGauge from './ArcGauge'

const FACTORS = [
  { key: 'inventory',  label: 'Inventory Trend' },
  { key: 'dom',        label: 'DOM Trend' },
  { key: 'priceCuts',  label: 'Price Cut Rate' },
  { key: 'momentum',   label: 'Price Momentum' },
  { key: 'demand',     label: 'Demand Signal' },
]

export default function PriceForecastScore() {
  const { activeGeo } = useGeo()
  const d   = getGeoData(activeGeo)
  const nat = geoData.national
  const { score, factors } = d.market_score
  const color = scoreColor(score)
  const grade = gradeFromScore(score)
  const natScore = nat.market_score.score

  return (
    <div>
      {/* Score + grade row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
        <ArcGauge value={score} color={color} size={110} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '28px', fontWeight: 900, color, lineHeight: 1 }}>
              {grade}
            </span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 700, color }}>
              {scoreLabel(score)}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              borderRadius: '20px', padding: '2px 8px', color: 'var(--muted)',
            }}>vs. National: {natScore}</span>
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--dim)', marginTop: '6px' }}>
            Based on supply/demand fundamentals. Updated monthly.
          </p>
        </div>
      </div>

      {/* Sub-factor bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {FACTORS.map(f => {
          const v = factors[f.key] ?? 50
          const c = scoreColor(v)
          return (
            <div key={f.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--muted)' }}>{f.label}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', fontWeight: 700, color: c }}>{v}</span>
              </div>
              <div style={{ height: '3px', borderRadius: '3px', background: 'var(--border)' }}>
                <div style={{ height: '100%', borderRadius: '3px', background: c, width: `${v}%`, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
