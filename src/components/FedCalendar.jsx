import { FOMC_DATES } from '../mockData'

function MeetingRow({ item, last }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '9px 0',
      borderBottom: !last ? '1px solid var(--border)' : 'none',
    }}>
      <div style={{
        background: item.isNext ? 'rgba(0, 232, 122, 0.13)' : 'var(--border)',
        borderRadius: '8px',
        padding: '5px 8px',
        minWidth: '82px',
        textAlign: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '10px',
          fontWeight: 700,
          color: item.isNext ? 'var(--green)' : 'var(--muted)',
          whiteSpace: 'nowrap',
        }}>{item.date}</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
          FOMC Meeting
        </div>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '10px',
          color: item.isNext ? 'var(--yellow)' : 'var(--dim)',
          marginTop: '1px',
        }}>{item.note}</div>
      </div>

      {item.isNext && (
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

export default function FedCalendar() {
  const next      = FOMC_DATES.filter(d => d.isNext)
  const projected = FOMC_DATES.filter(d => !d.isNext)

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '18px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
    }}>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '10px',
        color: 'var(--muted)',
        letterSpacing: '0.08em',
        marginBottom: '4px',
        flexShrink: 0,
      }}>FED CALENDAR</div>

      {/* Next meeting — pinned */}
      {next.map(item => (
        <MeetingRow key={item.date} item={item} last={false} />
      ))}

      {/* Projected meetings — scrollable */}
      <div style={{
        overflowY: 'auto',
        flex: 1,
        minHeight: 0,
      }}>
        {projected.map((item, i) => (
          <MeetingRow key={item.date} item={item} last={i === projected.length - 1} />
        ))}
      </div>
    </div>
  )
}
