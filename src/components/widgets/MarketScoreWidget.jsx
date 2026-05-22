import { useGeo } from '../../context/GeoContext'

// Sub-scores all follow the same convention: higher = stronger seller's market.
function scoreColor(v) {
  if (v >= 60) return 'var(--green)'
  if (v >= 40) return 'var(--yellow)'
  return 'var(--red)'
}

// Vis Market Score labels (per CLAUDE.md spec)
function marketLabel(score) {
  if (score >= 80) return 'Hot Market'
  if (score >= 60) return "Seller's Market"
  if (score >= 45) return 'Balanced'
  if (score >= 30) return 'Cooling'
  return "Buyer's Market"
}

function marketSub(score) {
  if (score >= 80) return 'Strong conditions favor sellers'
  if (score >= 60) return 'Conditions favor sellers'
  if (score >= 45) return 'Balanced between buyers and sellers'
  if (score >= 30) return 'Conditions cooling toward buyers'
  return 'Conditions favor buyers'
}

export default function MarketScoreWidget() {
  const { data: d } = useGeo()
  const ms = d.market_score
  const score = Math.round(ms.score)
  const f = ms.factors

  // Three bars mapped to the formula's real sub-scores. Rate Environment is
  // intentionally omitted — the formula has no rate input yet.
  const bars = [
    { label: 'Inventory Pressure', value: Math.round(f.inventory) },
    { label: 'Price Momentum',     value: Math.round(f.momentum) },
    { label: 'Demand Strength',    value: Math.round(f.dom) },
  ]

  const mainColor = scoreColor(score)

  return (
    <div>
      {/* Score + label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          border: `3px solid ${mainColor}`,
          background: 'rgba(255, 255, 255, 0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '22px',
            fontWeight: 900,
            color: mainColor,
          }}>{score}</span>
        </div>

        <div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '18px',
            fontWeight: 800,
            color: mainColor,
          }}>{marketLabel(score)}</div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '11px',
            color: 'var(--muted)',
            marginTop: '2px',
          }}>{marketSub(score)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {bars.map((bar) => {
          const color = scoreColor(bar.value)
          return (
            <div key={bar.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--muted)' }}>{bar.label}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', fontWeight: 700, color }}>{bar.value}</span>
              </div>
              <div style={{ height: '3px', borderRadius: '3px', background: 'var(--border)' }}>
                <div style={{
                  height: '100%',
                  borderRadius: '3px',
                  background: color,
                  width: `${bar.value}%`,
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
