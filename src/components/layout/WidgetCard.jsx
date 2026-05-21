import { GripVertical } from 'lucide-react'
import { useGeo } from '../../context/GeoContext'
import { fmtMonth } from '../../utils/formatters'

function ComingSoon({ title }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '120px', gap: '8px' }}>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: 'var(--dim)', letterSpacing: '0.08em' }}>COMING SOON</span>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--muted)' }}>{title}</span>
    </div>
  )
}

export default function WidgetCard({ widget, dragListeners, dragAttributes, children, isDragging }) {
  const { geoLabel, asOf, sources } = useGeo()

  const dotColor = sources?.housing === 'live'
    ? 'var(--green)'
    : sources?.macro === 'live'
    ? 'var(--yellow)'
    : 'var(--dim)'

  const sourceLabel = sources?.housing === 'live'
    ? 'Zillow'
    : sources?.macro === 'live'
    ? 'FRED'
    : 'Sample'

  return (
    <div style={{
      background: 'var(--card)',
      border: `1px solid ${isDragging ? 'rgba(0,232,122,0.4)' : 'var(--border)'}`,
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'border-color 0.15s, box-shadow 0.15s',
      boxShadow: isDragging ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
      height: '100%',
    }}
    onMouseEnter={e => !isDragging && (e.currentTarget.style.borderColor = 'var(--dim)')}
    onMouseLeave={e => !isDragging && (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      {/* Card Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px 8px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '9px',
          color: 'var(--muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>{widget.title}</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '9px',
            color: 'var(--green)',
            background: 'rgba(0,232,122,0.1)',
            padding: '2px 7px',
            borderRadius: '20px',
            letterSpacing: '0.06em',
          }}>📍 {geoLabel}</span>

          <div
            {...dragListeners}
            {...dragAttributes}
            style={{ cursor: 'grab', color: 'var(--dim)', display: 'flex', alignItems: 'center', touchAction: 'none' }}
          >
            <GripVertical size={13} />
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ flex: 1, padding: '14px', minHeight: 0 }}>
        {widget.built ? children : <ComingSoon title={widget.title} />}
      </div>

      {/* Card Footer — data provenance */}
      {asOf && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '4px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          flexShrink: 0,
        }}>
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '8px', color: 'var(--dim)', letterSpacing: '0.04em' }}>
            {sourceLabel} · Updated {fmtMonth(asOf)}
          </span>
        </div>
      )}
    </div>
  )
}
