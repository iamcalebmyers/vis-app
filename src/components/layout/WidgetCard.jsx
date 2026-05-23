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

// Per-widget data provenance. Returns { color, text } for the footer dot+label.
// `source` comes from widgetConfig.js; the rest is the global GeoContext state.
function attribution(source, sources, asOf, macro) {
  const housingLive = sources?.housing === 'live'
  const macroLive   = sources?.macro   === 'live'
  const housingDate = fmtMonth(asOf)
  const macroDate   = fmtMonth(macro?.rate30yr?.asOf)

  switch (source) {
    case 'fred':
      return macroLive
        ? { color: 'var(--green)', text: `FRED · ${macroDate}` }
        : { color: 'var(--dim)',   text: 'FRED · offline' }

    case 'zillow':
      return housingLive
        ? { color: 'var(--green)',  text: `Zillow · ${housingDate}` }
        : { color: 'var(--yellow)', text: 'Sample — no Zillow data for this geo' }

    case 'derived':
      return housingLive
        ? { color: 'var(--green)',  text: `Derived from Zillow · ${housingDate}` }
        : { color: 'var(--yellow)', text: 'Sample — no Zillow data for this geo' }

    case 'both':
      if (housingLive && macroLive)
        return { color: 'var(--green)',  text: `FRED + Zillow · ${housingDate}` }
      if (macroLive)
        return { color: 'var(--yellow)', text: `FRED live · Zillow sample · ${macroDate}` }
      return { color: 'var(--dim)', text: 'Sample data' }

    case 'mock':
    default:
      return { color: 'var(--dim)', text: 'Sample data — not yet wired' }
  }
}

export default function WidgetCard({ widget, dragListeners, dragAttributes, children, isDragging }) {
  const { geoLabel, asOf, sources, macro } = useGeo()
  const attr = widget.built ? attribution(widget.source, sources, asOf, macro) : null

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

      {/* Card Footer — per-widget data attribution */}
      {attr && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '4px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          flexShrink: 0,
        }}>
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: attr.color, flexShrink: 0 }} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '8px', color: 'var(--dim)', letterSpacing: '0.04em' }}>
            {attr.text}
          </span>
        </div>
      )}
    </div>
  )
}
