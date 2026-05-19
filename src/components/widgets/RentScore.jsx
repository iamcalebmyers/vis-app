import { useGeo } from '../../context/GeoContext'
import { getGeoData, geoData } from '../../data/geoData'
import { fmt, scoreColor } from '../../utils/formatters'
import ArcGauge from './ArcGauge'
import CompChip from './CompChip'

export default function RentScore() {
  const { activeGeo } = useGeo()
  const d   = getGeoData(activeGeo)
  const nat = geoData.national

  const rs = d.rent_score
  const color = scoreColor(rs.score)

  // Derive factor scores from rent_score sub-fields
  const factors = [
    { label: 'Rent Appreciation', value: Math.min(100, Math.max(0, Math.round(50 + rs.rentGrowth * 8))) },
    { label: 'Low Vacancy',       value: Math.min(100, Math.max(0, 100 - rs.vacancyRisk)) },
    { label: 'Rental Yield',      value: Math.min(100, Math.max(0, Math.round(rs.yield * 10))) },
    { label: 'Rent-to-Income',    value: Math.min(100, Math.max(0, Math.round((35 - rs.rentToIncome) * 3 + 50))) },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
        <ArcGauge value={rs.score} color={color} size={100} label="Rent" />
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>
            {fmt.currency(d.rent.median)}
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 400 }}>/mo</span>
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: 'var(--muted)', marginBottom: '2px' }}>
            National: {fmt.currency(nat.rent.median)}/mo
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color }}>
            Score {rs.score}/100
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: 'var(--dim)' }}>
            Yield {rs.yield}%
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {factors.map(f => {
          const c = scoreColor(f.value)
          return (
            <div key={f.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--muted)' }}>{f.label}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', fontWeight: 700, color: c }}>{f.value}</span>
              </div>
              <div style={{ height: '3px', borderRadius: '3px', background: 'var(--border)' }}>
                <div style={{ height: '100%', borderRadius: '3px', background: c, width: `${f.value}%`, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          )
        })}
      </div>

      <CompChip label="vs. National" local={rs.score} national={nat.rent_score.score} unit="" />
    </div>
  )
}
