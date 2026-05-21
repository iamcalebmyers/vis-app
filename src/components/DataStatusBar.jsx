import { useGeo } from '../context/GeoContext'
import { fmtMonth } from '../utils/formatters'

export default function DataStatusBar() {
  const { sources, asOf, macro, parents, isLoading, error } = useGeo()

  if (isLoading) return null

  if (error) {
    return (
      <div style={{
        padding: '4px 24px',
        borderBottom: '1px solid rgba(240,69,90,0.25)',
        background: 'rgba(240,69,90,0.06)',
      }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'var(--red)' }}>
          ⚠ Data fetch failed — showing cached values
        </span>
      </div>
    )
  }

  const housingLive = sources?.housing === 'live'
  const macroLive   = sources?.macro   === 'live'
  const cascaded    = sources?.housingGeo  // non-null when we served a parent geo's data

  // Find the label for the cascade source geo (it's in the parents array)
  const cascadeLabel = cascaded
    ? (parents?.find(p => p.id === cascaded)?.label ?? cascaded)
    : null

  const housingDate = fmtMonth(asOf)
  const macroDate   = fmtMonth(macro?.rate30yr?.asOf)

  // Nothing live at all — stay quiet (shouldn't happen in prod but keeps dev clean)
  if (!housingLive && !macroLive) return null

  const dotColor = housingLive ? 'var(--green)' : 'var(--yellow)'
  const labelColor = housingLive ? 'var(--green)' : 'var(--yellow)'
  const liveText = housingLive ? 'LIVE' : 'PARTIAL'

  return (
    <div style={{
      padding: '5px 24px',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      flexWrap: 'wrap',
    }}>
      {/* Status dot + label */}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
        <span style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: dotColor,
        }} />
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '9px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: labelColor,
        }}>{liveText}</span>
      </span>

      {/* Housing source */}
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'var(--dim)' }}>
        {cascaded && cascadeLabel
          ? `Showing ${cascadeLabel} — no Zillow data for this ZIP`
          : housingLive && housingDate
          ? `Housing ${housingDate} · Zillow`
          : 'Housing · sample data'
        }
      </span>

      {/* Macro source */}
      {macroLive && macroDate && (
        <>
          <span style={{ color: 'var(--border)', fontSize: '10px', userSelect: 'none' }}>·</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'var(--dim)' }}>
            Rates {macroDate} · FRED
          </span>
        </>
      )}
    </div>
  )
}
