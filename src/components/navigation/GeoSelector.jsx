import { GEO_HIERARCHY } from '../../data/geoData'
import { useGeo } from '../../context/GeoContext'

export default function GeoSelector() {
  const { activeGeo, setActiveGeo } = useGeo()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {GEO_HIERARCHY.map((geo, i) => {
        const active = activeGeo === geo.key
        const isAccessible = true // all levels always available in mock

        return (
          <button
            key={geo.key}
            onClick={() => setActiveGeo(geo.key)}
            style={{
              background: active ? 'rgba(0,232,122,0.15)' : 'transparent',
              border: `1px solid ${active ? 'rgba(0,232,122,0.5)' : 'transparent'}`,
              borderRadius: '6px',
              color: active ? 'var(--green)' : 'var(--muted)',
              fontFamily: active ? "'IBM Plex Mono', monospace" : "'DM Sans', sans-serif",
              fontSize: '11px',
              fontWeight: active ? 700 : 400,
              padding: '4px 10px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => !active && (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => !active && (e.currentTarget.style.color = 'var(--muted)')}
          >
            {geo.label}
          </button>
        )
      })}
    </div>
  )
}
