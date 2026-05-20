import { useGeo } from '../../context/GeoContext'

const PHASES = ['Recovery', 'Expansion', 'Peak', 'Contraction']
const PHASE_NORM = { recovery: 'Recovery', expansion: 'Expansion', peak: 'Peak', contraction: 'Contraction', hyper_supply: 'Contraction' }

const PHASE_COLORS = {
  Recovery:    'var(--green)',
  Expansion:   'var(--yellow)',
  Peak:        'var(--red)',
  Contraction: '#5b9cf6',
}
const PHASE_DESC = {
  Recovery:    'Buyer window: prices stabilizing, inventory building.',
  Expansion:   'Rising prices, strong demand, competitive conditions.',
  Peak:        'Max pricing, affordability stress, reversal risk.',
  Contraction: 'Prices softening, inventory building, demand fading.',
}

const CX = 55, CY = 55, R = 38, TOTAL = 220, START = 160

function polar(deg, r) {
  const rad = (deg * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

function trackPath(r) {
  const s = polar(START, r)
  const e = polar(START + TOTAL, r)
  return `M ${s.x} ${s.y} A ${r} ${r} 0 1 1 ${e.x} ${e.y}`
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)) }

export default function MarketCyclePosition() {
  const { data: d } = useGeo()

  const rawPhase   = d.cycle.phase
  const monthsIn   = d.cycle.monthsIn
  const phase      = PHASE_NORM[rawPhase] ?? 'Expansion'
  const phaseIdx   = PHASES.indexOf(phase)
  const posInPhase = clamp(Math.round((monthsIn / 24) * 100), 0, 99)
  const globalPos  = Math.round((phaseIdx / 4) * 100 + posInPhase / 4)

  const color     = PHASE_COLORS[phase]
  const needleDeg = START + (globalPos / 100) * TOTAL
  const tip       = polar(needleDeg, R)

  // Cycle signals
  const priceYoy  = d.home_price.yoy
  const invChange = Math.round(((d.inventory.current / d.inventory.yearAgo) - 1) * 100)
  const domChange = Math.round(((d.dom.current / d.dom.yearAgo) - 1) * 100)

  const pricePct = clamp(((priceYoy + 10) / 30) * 100, 0, 100)
  const invPct   = clamp(((invChange + 40) / 120) * 100, 0, 100)
  const domPct   = clamp(((domChange + 30) / 90) * 100, 0, 100)

  const signals = [
    {
      label: 'Price Momentum',
      value: `${priceYoy > 0 ? '+' : ''}${priceYoy}% YoY`,
      pct: pricePct,
      color: priceYoy >= 0 ? 'var(--green)' : 'var(--red)',
    },
    {
      label: 'Inventory Change',
      value: `${invChange > 0 ? '+' : ''}${invChange}% YoY`,
      pct: invPct,
      color: invChange >= 0 ? '#5b9cf6' : 'var(--red)',
    },
    {
      label: 'DOM Trend',
      value: `${domChange > 0 ? '+' : ''}${domChange}% YoY`,
      pct: domPct,
      color: domChange >= 0 ? '#5b9cf6' : 'var(--yellow)',
    },
  ]

  return (
    <div>

      {/* Top row: compact gauge + phase info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <svg width="110" height="73" viewBox="0 0 110 73" style={{ flexShrink: 0, overflow: 'visible' }}>
          <path d={trackPath(R)} fill="none" stroke="var(--border)" strokeWidth="7" strokeLinecap="round" />
          {PHASES.map((p, i) => {
            const s = polar(START + (i / 4) * TOTAL, R)
            const e = polar(START + ((i + 1) / 4) * TOTAL, R)
            return (
              <path key={p}
                d={`M ${s.x} ${s.y} A ${R} ${R} 0 0 1 ${e.x} ${e.y}`}
                fill="none" stroke={PHASE_COLORS[p]} strokeWidth="7" strokeLinecap="butt"
                opacity={phase === p ? 1 : 0.15}
              />
            )
          })}
          <line x1={CX} y1={CY} x2={tip.x} y2={tip.y}
            stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <circle cx={tip.x} cy={tip.y} r="5.5" fill={color} />
          <circle cx={tip.x} cy={tip.y} r="2.5" fill="var(--card)" />
          <circle cx={CX} cy={CY} r="3.5" fill={color} />
        </svg>

        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '18px', fontWeight: 800, color, lineHeight: 1 }}>
            {phase}
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--dim)', marginTop: '5px' }}>
            Phase {phaseIdx + 1} of 4
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
            {monthsIn} months in cycle
          </div>
        </div>
      </div>

      {/* Phase progress */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--muted)' }}>Phase Progress</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color }}>
            ~{Math.max(0, 24 - monthsIn)} mo remaining
          </span>
        </div>
        <div style={{ height: '4px', borderRadius: '4px', background: 'var(--border)' }}>
          <div style={{ height: '100%', borderRadius: '4px', background: color, width: `${posInPhase}%`, transition: 'width 0.4s' }} />
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', color: 'var(--dim)', marginTop: '4px' }}>
          {PHASE_DESC[phase]}
        </div>
      </div>

      {/* Signal bars */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.08em', marginBottom: '8px' }}>
          CYCLE SIGNALS
        </div>
        {signals.map(s => (
          <div key={s.label} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--muted)' }}>{s.label}</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: s.color }}>{s.value}</span>
            </div>
            <div style={{ height: '3px', borderRadius: '3px', background: 'var(--border)' }}>
              <div style={{ height: '100%', borderRadius: '3px', background: s.color, width: `${s.pct}%`, transition: 'width 0.4s' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Phase timeline */}
      <div style={{ display: 'flex', borderTop: '1px solid var(--border)', paddingTop: '10px', gap: '0' }}>
        {PHASES.map((p, i) => {
          const active = phase === p
          return (
            <div key={p} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: active ? 10 : 7,
                height: active ? 10 : 7,
                borderRadius: '50%',
                background: PHASE_COLORS[p],
                opacity: active ? 1 : 0.3,
                transition: 'all 0.3s',
              }} />
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '7.5px',
                fontWeight: active ? 700 : 400,
                color: active ? PHASE_COLORS[p] : 'var(--dim)',
                textAlign: 'center',
                lineHeight: 1.2,
              }}>
                {p}
              </span>
            </div>
          )
        })}
      </div>

    </div>
  )
}
