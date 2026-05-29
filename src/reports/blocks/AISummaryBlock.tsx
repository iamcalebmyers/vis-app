type Props = {
  summary: string
  format: 'card' | 'print'
}

function VLogo() {
  return (
    <div style={{
      width: '18px', height: '18px', borderRadius: '4px',
      background: 'var(--green)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace", fontWeight: 900,
        fontSize: '9px', color: '#000', lineHeight: 1,
      }}>V</span>
    </div>
  )
}

export default function AISummaryBlock({ summary, format }: Props) {
  if (format === 'print') {
    return (
      <div>
        <h2 style={{
          fontFamily: 'Arial, sans-serif', fontSize: '12px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444',
          margin: '0 0 10px', paddingBottom: '4px', borderBottom: '2px solid #111',
        }}>Vis analysis</h2>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '12px', lineHeight: 1.7, color: '#333', margin: 0 }}>
          {summary}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
        <VLogo />
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px',
          color: 'var(--muted)', letterSpacing: '0.07em',
        }}>VIS AI SUMMARY</span>
      </div>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
        lineHeight: 1.7, margin: 0, color: 'var(--text)',
      }}>{summary}</p>
    </div>
  )
}
