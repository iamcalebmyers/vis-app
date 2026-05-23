import { useGeo } from '../../context/GeoContext'

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// '2026-06-17' → 'Jun 17, 2026'
function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(n => parseInt(n, 10))
  return `${MONTHS_SHORT[m - 1]} ${d}, ${y}`
}

// Days until ISO date from now (UTC, day-resolution)
function daysUntil(iso) {
  const now = new Date()
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const [y, m, d] = iso.split('-').map(n => parseInt(n, 10))
  const target = Date.UTC(y, m - 1, d)
  return Math.round((target - today) / 86_400_000)
}

function MeetingRow({ item, isNext, last }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '9px 0',
      borderBottom: !last ? '1px solid var(--border)' : 'none',
    }}>
      <div style={{
        background: isNext ? 'rgba(0, 232, 122, 0.13)' : 'var(--border)',
        borderRadius: '8px',
        padding: '5px 8px',
        minWidth: '92px',
        textAlign: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '10px',
          fontWeight: 700,
          color: isNext ? 'var(--green)' : 'var(--muted)',
          whiteSpace: 'nowrap',
        }}>{item.label}</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
          FOMC Meeting
        </div>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '10px',
          color: isNext ? 'var(--yellow)' : 'var(--dim)',
          marginTop: '1px',
        }}>{item.note}</div>
      </div>

      {isNext && (
        <div style={{
          background: 'rgba(0, 232, 122, 0.15)',
          color: 'var(--green)',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '10px',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '20px',
          letterSpacing: '0.04em',
          flexShrink: 0,
        }}>NEXT</div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '120px',
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: '10px',
      color: 'var(--dim)',
    }}>FOMC schedule unavailable</div>
  )
}

export default function FedCalendarWidget() {
  const { macro } = useGeo()
  const meetings = macro?.fomc?.upcoming ?? []

  if (meetings.length === 0) return <EmptyState />

  // First upcoming meeting is "next"; rest are projected
  const rows = meetings.map((m, i) => {
    const days = daysUntil(m.date)
    return {
      key:   m.date,
      label: formatDate(m.date),
      note:  i === 0
        ? `Rate decision · ${days} day${days === 1 ? '' : 's'}`
        : 'Projected',
      isNext: i === 0,
    }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, maxHeight: '320px' }}>
      <MeetingRow item={rows[0]} isNext={true} last={false} />

      <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
        {rows.slice(1).map((r, i) => (
          <MeetingRow key={r.key} item={r} isNext={false} last={i === rows.length - 2} />
        ))}
      </div>
    </div>
  )
}
