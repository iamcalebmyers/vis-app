// Reusable 240-degree arc gauge
export default function ArcGauge({ value, max = 100, size = 130, strokeWidth = 9, color = 'var(--green)', showValue = true, label }) {
  const r   = (size - strokeWidth) / 2
  const cx  = size / 2
  const cy  = size / 2
  const startDeg  = 150
  const totalDeg  = 240
  const valueDeg  = Math.min((value / max) * totalDeg, totalDeg)

  function pt(deg) {
    const rad = (deg - 90) * (Math.PI / 180)
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  function arc(start, end) {
    const s = pt(start), e = pt(end)
    const large = end - start > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
  }

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        <path d={arc(startDeg, startDeg + totalDeg)} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} strokeLinecap="round" />
        {valueDeg > 1 && (
          <path d={arc(startDeg, startDeg + valueDeg)} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        )}
      </svg>
      {showValue && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: size > 110 ? '24px' : '18px', fontWeight: 900, color, lineHeight: 1 }}>
            {Math.round(value)}
          </span>
          {label && (
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--muted)', marginTop: '2px', textAlign: 'center' }}>
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
