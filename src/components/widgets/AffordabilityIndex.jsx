import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import { useGeo } from '../../context/GeoContext'
import { getGeoData, geoData } from '../../data/geoData'
import { fmt } from '../../utils/formatters'
import CompChip from './CompChip'

export default function AffordabilityIndex() {
  const { activeGeo } = useGeo()
  const d   = getGeoData(activeGeo)
  const nat = geoData.national

  const { pctIncome, monthlyPayment, medianIncome } = d.affordability
  const color = pctIncome > 40 ? 'var(--red)' : pctIncome > 30 ? 'var(--yellow)' : 'var(--green)'
  const label = pctIncome > 40 ? 'Severely Unaffordable' : pctIncome > 30 ? 'Stretched' : pctIncome > 20 ? 'Moderate' : 'Affordable'

  const chartData = [{ name: 'Housing', value: Math.min(pctIncome, 100), fill: color }]

  return (
    <div>
      {/* Donut + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" startAngle={90} endAngle={-270} data={chartData} barSize={8}>
              <RadialBar background={{ fill: 'var(--border)' }} dataKey="value" cornerRadius={4} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '16px', fontWeight: 800, color }}>{pctIncome}%</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '8px', color: 'var(--dim)' }}>of income</span>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 700, color, marginBottom: '6px' }}>{label}</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: 'var(--muted)', marginBottom: '3px' }}>
            Housing cost &gt; 28% = stretched
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: 'var(--dim)' }}>
            Updated monthly
          </div>
        </div>
      </div>

      {/* Stats */}
      {[
        { label: 'Monthly Payment (est.)', value: fmt.currency(monthlyPayment) },
        { label: 'Median Household Income', value: fmt.currency(medianIncome, true) },
        { label: 'Median Home Price', value: fmt.currency(d.home_price.median, true) },
        { label: 'National Avg % of Income', value: `${nat.affordability.pctIncome}%` },
      ].map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--muted)' }}>{r.label}</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: 'var(--text)' }}>{r.value}</span>
        </div>
      ))}

      <CompChip label="vs. National" local={pctIncome} national={nat.affordability.pctIncome} unit="%" invertPositive />
    </div>
  )
}
