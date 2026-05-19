// "vs. National" comparison chip used across all widgets
export default function CompChip({ label, local, national, unit = '', invertPositive = false }) {
  const delta = local - national
  const better = invertPositive ? delta < 0 : delta > 0
  const color = delta === 0 ? 'var(--muted)' : better ? 'var(--green)' : 'var(--red)'

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid var(--border)',
      borderRadius: '20px',
      padding: '2px 8px',
      marginTop: '8px',
    }}>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--muted)' }}>
        vs. National:
      </span>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', fontWeight: 700, color }}>
        {national}{unit}
      </span>
      {delta !== 0 && (
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color }}>
          {better ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}{unit}
        </span>
      )}
    </div>
  )
}
