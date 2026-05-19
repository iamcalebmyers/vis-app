import { MARKET_SCORE } from '../../mockData'

const COLOR_MAP = {
  green:  'var(--green)',
  red:    'var(--red)',
  yellow: 'var(--yellow)',
}

export default function MarketScoreWidget() {
  const { score, label, sub, indicators } = MARKET_SCORE

  return (
    <div>
      {/* Score + label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          border: '3px solid var(--green)',
          background: 'rgba(0, 232, 122, 0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '22px',
            fontWeight: 900,
            color: 'var(--green)',
          }}>{score}</span>
        </div>

        <div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--green)',
          }}>{label}</div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '11px',
            color: 'var(--muted)',
            marginTop: '2px',
          }}>{sub}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {indicators.map((ind) => {
          const color = COLOR_MAP[ind.color]
          return (
            <div key={ind.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--muted)' }}>{ind.label}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', fontWeight: 700, color }}>{ind.value}</span>
              </div>
              <div style={{ height: '3px', borderRadius: '3px', background: 'var(--border)' }}>
                <div style={{
                  height: '100%',
                  borderRadius: '3px',
                  background: color,
                  width: `${ind.value}%`,
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
