import { useMemo } from 'react'
import { TICKER_ITEMS, VIS_MARKET_READ } from '../mockData'
import { useGeo } from '../context/GeoContext'

// Map ticker labels to live macro fields. Items without a live source
// stay on their mock values until later phases wire more data.
const LIVE_BY_LABEL = {
  '30YR FIXED': { field: 'rate30yr',     unit: '%', decimals: 2 },
  '15YR FIXED': { field: 'rate15yr',     unit: '%', decimals: 2 },
  'FED FUNDS':  { field: 'fedFunds',     unit: '%', decimals: 2 },
  'CPI YOY':    { field: 'cpi',          unit: '%', decimals: 1 },
}

function formatChange(delta, unit, decimals) {
  if (delta == null || Number.isNaN(delta)) return null
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta.toFixed(decimals)}${unit}`
}

function overlayLiveItems(items, macro) {
  if (!macro) return items
  return items.map(item => {
    const live = LIVE_BY_LABEL[item.label]
    if (!live) return item
    const m = macro[live.field]
    if (!m || m.value == null) return item
    return {
      ...item,
      value:   `${m.value.toFixed(live.decimals)}${live.unit}`,
      change:  formatChange(m.weekChange, live.unit, live.decimals) ?? item.change,
      up:      m.weekChange == null ? item.up : m.weekChange > 0,
      isLive:  true,
    }
  })
}

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '9px',
          color: 'var(--dim)',
          letterSpacing: '0.1em',
        }}>{item.label}</span>
        {item.isLive && (
          <span style={{
            width: '4px', height: '4px', borderRadius: '50%',
            background: 'var(--green)',
          }} title="live data" />
        )}
      </div>
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

export default function Ticker() {
  const { macro } = useGeo()

  // Rebuild the doubled-loop sequence whenever live macro values change
  const sequence = useMemo(() => {
    const live = overlayLiveItems(TICKER_ITEMS, macro)
    const base = []
    live.forEach((item, i) => {
      if (i === 7) base.push({ type: 'read' })
      base.push({ type: 'item', item })
    })
    return [...base, ...base]   // double for seamless loop
  }, [macro])

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
        {sequence.map((entry, i) =>
          entry.type === 'read'
            ? <VisReadSegment key={i} />
            : <TickerItem key={i} item={entry.item} />
        )}
      </div>
    </div>
  )
}
