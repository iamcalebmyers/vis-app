import { useGeo } from '../../context/GeoContext'

const TYPE_LABEL = { state: 'State', metro: 'Metro', county: 'County', zip: 'ZIP', national: 'US' }
const TYPE_COLOR = {
  state:    'var(--green)',
  metro:    'var(--yellow)',
  county:   'var(--muted)',
  zip:      'var(--text)',
  national: 'var(--green)',
}

// Breadcrumb chip — shows the active geo and its parent chain (state → metro
// → county → ZIP, depending on the geo). Click any parent to jump up.
// The search input itself lives in the top Nav (components/navigation/GeoSearch.jsx).
export default function GeoSelector() {
  const { activeGeo, geoLabel, parents, setActiveGeo, sources, isLoading } = useGeo()

  // Build the chain: active geo first, then parents
  const activeType =
    activeGeo === 'national' ? 'national' :
    activeGeo.split(':')[0]
  const chain = [{ id: activeGeo, label: geoLabel, type: activeType, active: true }]
  for (const p of parents || []) chain.push({ ...p, active: false })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {chain.map((g, i) => {
        const color = TYPE_COLOR[g.type] || 'var(--muted)'
        return (
          <span key={g.id + ':' + i} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => !g.active && setActiveGeo(g.id, g.label)}
              disabled={g.active}
              style={{
                background: g.active ? 'rgba(0,232,122,0.10)' : 'transparent',
                border:     `1px solid ${g.active ? 'rgba(0,232,122,0.4)' : 'var(--border)'}`,
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: g.active ? 'default' : 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => !g.active && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
              onMouseLeave={e => !g.active && (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '8px', fontWeight: 700, letterSpacing: '0.08em',
                color, opacity: g.active ? 1 : 0.7,
              }}>
                {TYPE_LABEL[g.type] || g.type}
              </span>
              <span style={{
                fontFamily: g.active ? "'IBM Plex Mono', monospace" : "'DM Sans', sans-serif",
                fontSize: '11px',
                fontWeight: g.active ? 700 : 500,
                color: g.active ? 'var(--text)' : 'var(--muted)',
              }}>
                {g.label}
              </span>
            </button>
            {i < chain.length - 1 && (
              <span style={{ color: 'var(--dim)', fontSize: '11px' }}>›</span>
            )}
          </span>
        )
      })}

      {sources?.kind === 'mock-fallback' && !isLoading && (
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '9px',
          color: 'var(--yellow)',
          background: 'rgba(245,200,66,0.08)',
          border: '1px solid rgba(245,200,66,0.3)',
          borderRadius: '4px',
          padding: '2px 7px',
          marginLeft: '4px',
        }}>
          mock data — real data lands in Phase 4
        </span>
      )}
    </div>
  )
}
