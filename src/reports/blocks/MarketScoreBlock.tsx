type Props = {
  score: number
  label: string
  description: string
  format: 'card' | 'print'
  geo?: string  // e.g. "AUSTIN TX" — shown in section label for card format
}

function scoreColor(v: number) {
  if (v >= 60) return 'var(--green)'
  if (v >= 40) return 'var(--yellow)'
  return 'var(--red)'
}

export default function MarketScoreBlock({ score, label, description, format, geo }: Props) {
  if (format === 'print') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          border: '3px solid #111',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{
            fontFamily: 'Arial, sans-serif', fontSize: '20px',
            fontWeight: 700, color: '#111',
          }}>{score}</span>
        </div>
        <div>
          <div style={{
            fontFamily: 'Georgia, serif', fontSize: '16px',
            fontWeight: 700, color: '#111', marginBottom: '3px',
          }}>{label}</div>
          <p style={{ margin: 0, fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#444', lineHeight: 1.6 }}>
            {description}
          </p>
        </div>
      </div>
    )
  }

  const color = scoreColor(score)
  const sectionLabel = geo ? `VIS MARKET SCORE · ${geo.toUpperCase()}` : 'VIS MARKET SCORE'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{
        width: '60px', height: '60px', borderRadius: '50%',
        border: `3px solid ${color}`,
        background: 'rgba(0, 201, 104, 0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: '20px',
          fontWeight: 900, color,
        }}>{score}</span>
      </div>
      <div>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px',
          color: 'var(--muted)', letterSpacing: '0.07em', textTransform: 'uppercase',
          marginBottom: '2px',
        }}>{sectionLabel}</div>
        <div style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '17px',
          fontWeight: 800, color,
        }}>{label}</div>
        <div style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '12px',
          color: 'var(--muted)', marginTop: '2px',
        }}>{description}</div>
      </div>
    </div>
  )
}
