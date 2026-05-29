type Props = {
  rate: number
  rateDelta: number
  medianPrice: number
  medianPriceDelta: number
  daysOnMarket: number
  domDelta: number
  format: 'card' | 'print'
}

function fmtRate(v: number) {
  return `${v.toFixed(2)}%`
}

function fmtPrice(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  return `$${Math.round(v / 1000)}K`
}

function fmtDOM(v: number) {
  return `${v}d`
}

// For all three metrics: positive delta = bad for buyers (red), negative = good (green)
function deltaColor(delta: number) {
  return delta > 0 ? '#dc2626' : '#059669'
}

function deltaArrow(delta: number) {
  return delta > 0 ? '▲' : '▼'
}

function rateDeltaLabel(delta: number) {
  const sign = delta > 0 ? '+' : ''
  return `${deltaArrow(delta)} ${sign}${delta.toFixed(2)}%`
}

function priceDeltaLabel(delta: number) {
  const sign = delta > 0 ? '+' : ''
  return `${deltaArrow(delta)} ${sign}${delta.toFixed(1)}% YOY`
}

function domDeltaLabel(delta: number) {
  const sign = delta > 0 ? '+' : ''
  return `${deltaArrow(delta)} ${sign}${delta}d YOY`
}

const metrics = (props: Props) => [
  {
    label: '30YR RATE',
    printLabel: '30yr rate',
    value: fmtRate(props.rate),
    delta: props.rateDelta,
    deltaLabel: rateDeltaLabel(props.rateDelta),
  },
  {
    label: 'MED PRICE',
    printLabel: 'Median price',
    value: fmtPrice(props.medianPrice),
    delta: props.medianPriceDelta,
    deltaLabel: priceDeltaLabel(props.medianPriceDelta),
  },
  {
    label: 'DAYS ON MKT',
    printLabel: 'Days on market',
    value: fmtDOM(props.daysOnMarket),
    delta: props.domDelta,
    deltaLabel: domDeltaLabel(props.domDelta),
  },
]

export default function MarketConditionsBlock(props: Props) {
  const { format } = props
  const items = metrics(props)

  if (format === 'print') {
    return (
      <div>
        <h2 style={{
          fontFamily: 'Arial, sans-serif', fontSize: '12px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444',
          margin: '0 0 10px', paddingBottom: '4px', borderBottom: '2px solid #111',
        }}>Market conditions</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '6px' }}>
          {items.map(item => (
            <div key={item.label} style={{ textAlign: 'center', marginRight: '24px', marginBottom: '8px' }}>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '20px', fontWeight: 700, color: '#111' }}>
                {item.value}
              </div>
              <div style={{
                fontFamily: 'Arial, sans-serif', fontSize: '9px', color: '#888',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>{item.printLabel}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px',
        letterSpacing: '0.07em', textTransform: 'uppercase',
        color: 'var(--muted)', marginBottom: '8px',
      }}>Market conditions</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
        {items.map(item => (
          <div key={item.label} style={{
            background: 'var(--bg)', borderRadius: '8px', padding: '10px',
          }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px',
              color: 'var(--muted)', marginBottom: '3px',
            }}>{item.label}</div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: '20px', fontWeight: 800,
              color: 'var(--text)',
            }}>{item.value}</div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px',
              color: deltaColor(item.delta),
            }}>{item.deltaLabel}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
