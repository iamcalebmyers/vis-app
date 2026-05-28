import Nav from '../components/Nav'

function formatToday() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function ReportsPage({ onNavigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Nav page="reports" onNavigate={onNavigate} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '24px',
            fontWeight: 800,
            color: 'var(--text)',
            margin: 0,
          }}>Market + Property Report</h1>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: 'var(--muted)',
            marginTop: '6px',
            letterSpacing: '0.04em',
          }}>{formatToday()}</div>
        </div>

        {/* Empty state */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px',
          background: 'var(--card)',
          border: '1px dashed var(--border)',
          borderRadius: '12px',
        }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            color: 'var(--muted)',
          }}>Search an address to generate a report</span>
        </div>
      </div>
    </div>
  )
}
