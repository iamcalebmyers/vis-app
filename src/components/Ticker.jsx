import { TICKER_ITEMS, VIS_MARKET_READ } from '../mockData'

function TickerItem({ item }) {
  const changeColor = item.up === null ? 'var(--muted)' : item.up ? 'var(--green)' : 'var(--red)'
  const arrow = item.up === null ? '' : item.up ? '▲' : '▼'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '0 20px',
      borderRight: '1px solid var(--border)',
      whiteSpace: 'nowrap',
      gap: '2px',
    }}>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '9px',
        color: 'var(--dim)',
        letterSpacing: '0.1em',
      }}>{item.label}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--text)',
        }}>{item.value}</span>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '10px',
          color: changeColor,
        }}>{arrow}{item.change}</span>
      </div>
    </div>
  )
}

function VisReadSegment() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '0 20px',
      borderRight: '1px solid var(--border)',
      background: 'rgba(0, 232, 122, 0.09)',
      whiteSpace: 'nowrap',
      gap: '2px',
    }}>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '9px',
        fontWeight: 800,
        color: 'var(--green)',
        letterSpacing: '0.12em',
      }}>VIS READ</span>
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--green)',
      }}>{VIS_MARKET_READ}</span>
    </div>
  )
}

// Build the base sequence: items 0-6, then VIS READ, then items 7-9
function buildSequence() {
  const seq = []
  TICKER_ITEMS.forEach((item, i) => {
    if (i === 7) seq.push({ type: 'read' })
    seq.push({ type: 'item', item })
  })
  return seq
}

const BASE_SEQUENCE = buildSequence()
// Double for seamless loop
const DOUBLED = [...BASE_SEQUENCE, ...BASE_SEQUENCE]

export default function Ticker() {
  return (
    <div style={{
      background: 'var(--nav)',
      borderBottom: '1px solid var(--border)',
      padding: '7px 0',
      overflow: 'hidden',
      width: '100%',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        width: 'max-content',
        animation: 'tickerScroll 55s linear infinite',
      }}>
        {DOUBLED.map((entry, i) =>
          entry.type === 'read'
            ? <VisReadSegment key={i} />
            : <TickerItem key={i} item={entry.item} />
        )}
      </div>
    </div>
  )
}
