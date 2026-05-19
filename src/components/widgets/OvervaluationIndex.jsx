import { useGeo } from '../../context/GeoContext'
import { getGeoData, geoData } from '../../data/geoData'
import { fmt } from '../../utils/formatters'
import CompChip from './CompChip'

export default function OvervaluationIndex() {
  const { activeGeo } = useGeo()
  const d   = getGeoData(activeGeo)
  const nat = geoData.national

  const { pct, fairValue } = d.overvaluation
  const medianIncome = d.affordability.medianIncome
  const color = pct > 20 ? 'var(--red)' : pct > 5 ? 'var(--yellow)' : pct <= 0 ? 'var(--green)' : 'var(--muted)'
  const label = pct > 20 ? 'Overvalued' : pct > 5 ? 'Slightly Elevated' : pct <= 0 ? 'Undervalued' : 'Fair Value'

  const barWidth = Math.min(Math.abs(pct), 60)
  const isOver   = pct > 0

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '28px', fontWeight: 800, color }}>
          {pct > 0 ? '+' : ''}{pct}%
        </span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color }}>{label}</span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ position: 'relative', height: '6px', background: 'var(--border)', borderRadius: '4px', marginBottom: '6px' }}>
          <div style={{ position: 'absolute', left: '50%', top: '-2px', width: '2px', height: '10px', background: 'var(--dim)' }} />
          <div style={{
            position: 'absolute',
            top: 0,
            height: '100%',
            borderRadius: '4px',
            background: color,
            width: `${barWidth}%`,
            left: isOver ? '50%' : `${50 - barWidth}%`,
            transition: 'width 0.4s',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '8px', color: 'var(--green)' }}>Undervalued</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '8px', color: 'var(--red)' }}>Overvalued</span>
        </div>
      </div>

      {[
        { label: 'Current Price',   value: fmt.currency(d.home_price.median, true) },
        { label: 'Fair Value Est.', value: fmt.currency(fairValue, true) },
        { label: 'Median Income',   value: fmt.currency(medianIncome, true) },
        { label: 'Nat. Overvaluation', value: `+${nat.overvaluation.pct}%` },
      ].map(row => (
        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--muted)' }}>{row.label}</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: 'var(--text)' }}>{row.value}</span>
        </div>
      ))}

      <CompChip label="vs. National" local={pct} national={nat.overvaluation.pct} unit="%" invertPositive />
    </div>
  )
}
