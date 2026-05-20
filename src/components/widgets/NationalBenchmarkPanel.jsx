import { useGeo } from '../../context/GeoContext'
import { fmt, arrow, deltaColor } from '../../utils/formatters'

const METRICS = [
  { key: 'home_price', label: 'Median Price',  localFn: d => d.home_price.median,   natFn: d => d.home_price.median,  format: v => fmt.currency(v, true), invertPositive: false },
  { key: 'dom',        label: 'Days on Market',localFn: d => d.dom.current,         natFn: d => d.dom.current,       format: v => `${v}d`,              invertPositive: true  },
  { key: 'inventory',  label: 'Inventory',     localFn: d => d.inventory.current,   natFn: d => d.inventory.current, format: v => fmt.num(v, true),     invertPositive: false },
  { key: 'price_cuts', label: 'Price Cuts',    localFn: d => d.price_cuts.pct,      natFn: d => d.price_cuts.national,format: v => `${v}%`,              invertPositive: true  },
  { key: 'affordability',label:'Afford. Index',localFn: d => d.affordability.pctIncome, natFn: d => d.affordability.pctIncome, format: v => `${v}% inc`, invertPositive: true  },
  { key: 'rent',       label: 'Median Rent',   localFn: d => d.rent.median,         natFn: d => d.rent.national,     format: v => fmt.currency(v),      invertPositive: false },
]

function Sparkline({ values, up }) {
  const w = 60, h = 24
  const min = Math.min(...values), max = Math.max(...values)
  const range = max - min || 1
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * (h - 3) - 1}`)
  const color = up ? 'var(--green)' : 'var(--red)'
  return (
    <svg width={w} height={h} style={{ flexShrink: 0 }}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function spark(base, slope, n = 12) {
  return Array.from({ length: n }, (_, i) => base * (1 + slope * i / n))
}

export default function NationalBenchmarkPanel() {
  const { data: d, national: nat } = useGeo()

  const localHotter = d.market_score.score > nat.market_score.score
  const badge = localHotter ? { label: '🔥 Hotter than National', color: 'var(--red)' }
    : d.market_score.score === nat.market_score.score ? { label: '≈ At National Average', color: 'var(--muted)' }
    : { label: '❄️ Cooler than National', color: 'var(--green)' }

  return (
    <div>
      {/* Summary badge */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${badge.color}30`,
        borderRadius: '8px',
        padding: '8px 12px',
        marginBottom: '12px',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '12px',
        fontWeight: 600,
        color: badge.color,
      }}>{badge.label}</div>

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 60px', gap: '0', marginBottom: '4px' }}>
        {['METRIC', 'LOCAL', 'NATIONAL', '12M'].map(h => (
          <span key={h} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '8px', color: 'var(--dim)', letterSpacing: '0.08em', padding: '0 4px' }}>{h}</span>
        ))}
      </div>

      {/* Rows */}
      {METRICS.map(m => {
        const local = m.localFn(d)
        const national = m.natFn(nat)
        const delta = local - national
        const color = deltaColor(delta, m.invertPositive)
        const sparkVals = spark(local, (local - national) / national * 0.1)
        const up = !m.invertPositive ? delta >= 0 : delta <= 0
        return (
          <div key={m.key} style={{
            display: 'grid', gridTemplateColumns: '1fr 100px 100px 60px',
            padding: '7px 4px',
            borderTop: '1px solid var(--border)',
            alignItems: 'center',
          }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--muted)' }}>{m.label}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', fontWeight: 700, color: 'var(--text)' }}>{m.format(local)}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: 'var(--muted)' }}>{m.format(national)}</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color }}>{arrow(delta)}</span>
            </div>
            <Sparkline values={sparkVals} up={up} />
          </div>
        )
      })}
    </div>
  )
}
