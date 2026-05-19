import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useGeo } from '../../context/GeoContext'
import { getGeoData, geoData } from '../../data/geoData'
import CompChip from './CompChip'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.[0]) return null
  const v = payload[0].value
  return (
    <div style={{ background: 'var(--nav)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px' }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: 'var(--dim)' }}>{label}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', fontWeight: 700, color: v >= 0 ? 'var(--green)' : 'var(--red)' }}>
        {v >= 0 ? '+' : ''}{v}%
      </div>
    </div>
  )
}

export default function AppreciationForecast() {
  const { activeGeo } = useGeo()
  const d   = getGeoData(activeGeo)
  const nat = geoData.national

  const yr1 = d.appreciation.yr1
  const yr3 = d.appreciation.yr3
  const yr5 = d.appreciation.yr5
  const outlook = yr1 > 4 ? 'Strong' : yr1 > 1 ? 'Moderate' : yr1 >= 0 ? 'Flat' : 'Declining'
  const color = yr1 >= 0 ? 'var(--green)' : 'var(--red)'
  const outlookColor = yr1 > 4 ? 'var(--green)' : yr1 > 1 ? 'var(--yellow)' : yr1 >= 0 ? 'var(--muted)' : 'var(--red)'

  const data = [
    { label: 'Now', pct: 0 },
    { label: '1Y',  pct: yr1 },
    { label: '3Y',  pct: yr3 },
    { label: '5Y',  pct: yr5 },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '28px', fontWeight: 800, color }}>
          {yr1 >= 0 ? '+' : ''}{yr1}%
        </span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--muted)' }}>1-year forecast</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: outlookColor, marginLeft: 'auto' }}>
          {outlook}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={100}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="apprGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fill: 'var(--dim)' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fill: 'var(--dim)' }} tickLine={false} axisLine={false} width={28} tickFormatter={v => `${v}%`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="pct" stroke={color} strokeWidth={2} fill="url(#apprGrad)" dot={{ r: 3, fill: color }} />
        </AreaChart>
      </ResponsiveContainer>

      {[
        { label: '1-Year Forecast', value: yr1,  nat: nat.appreciation.yr1  },
        { label: '3-Year Forecast', value: yr3,  nat: nat.appreciation.yr3  },
        { label: '5-Year Forecast', value: yr5,  nat: nat.appreciation.yr5  },
      ].map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--muted)' }}>{r.label}</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: r.value >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {r.value >= 0 ? '+' : ''}{r.value}%
            </span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: 'var(--dim)' }}>
              nat: {r.nat >= 0 ? '+' : ''}{r.nat}%
            </span>
          </div>
        </div>
      ))}

      <CompChip label="vs. National" local={yr1} national={nat.appreciation.yr1} unit="%" />
    </div>
  )
}
