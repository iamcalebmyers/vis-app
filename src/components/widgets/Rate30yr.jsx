import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useGeo } from '../../context/GeoContext'
import { getGeoData } from '../../data/geoData'
import { fmt } from '../../utils/formatters'

const RATE_HISTORY = [
  { week: 'Jan 2', rate: 6.62 }, { week: 'Jan 9', rate: 6.58 }, { week: 'Jan 16', rate: 6.78 },
  { week: 'Jan 23', rate: 6.95 }, { week: 'Jan 30', rate: 6.89 }, { week: 'Feb 6', rate: 6.85 },
  { week: 'Feb 13', rate: 6.87 }, { week: 'Feb 20', rate: 6.76 }, { week: 'Feb 27', rate: 6.84 },
  { week: 'Mar 6', rate: 6.63 }, { week: 'Mar 13', rate: 6.65 }, { week: 'Mar 20', rate: 6.67 },
  { week: 'Mar 27', rate: 6.70 }, { week: 'Apr 3', rate: 6.72 }, { week: 'Apr 10', rate: 6.62 },
  { week: 'Apr 17', rate: 6.83 }, { week: 'Apr 24', rate: 6.91 }, { week: 'May 1', rate: 6.76 },
  { week: 'May 8', rate: 6.81 }, { week: 'May 15', rate: 6.86 },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.[0]) return null
  return (
    <div style={{ background: 'var(--nav)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px' }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: 'var(--dim)', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '14px', fontWeight: 700, color: 'var(--green)' }}>{payload[0].value}%</div>
    </div>
  )
}

export default function Rate30yr() {
  const { activeGeo } = useGeo()
  const d = getGeoData(activeGeo)

  const current   = d.rate_30yr.rate
  const wkChange  = d.rate_30yr.weekChange
  const changeColor = wkChange <= 0 ? 'var(--green)' : 'var(--red)'

  const data = [...RATE_HISTORY.slice(-16), { week: 'Live', rate: current }]
  const high52 = Math.max(...RATE_HISTORY.map(r => r.rate))
  const low52  = Math.min(...RATE_HISTORY.map(r => r.rate))

  const loan = d.home_price.median * 0.8

  function payment(r, n) {
    const mo = r / 100 / 12
    return Math.round(loan * mo * Math.pow(1 + mo, n) / (Math.pow(1 + mo, n) - 1))
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '28px', fontWeight: 800, color: 'var(--text)' }}>
          {current}%
        </span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--muted)' }}>30yr fixed</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', color: changeColor, marginLeft: 'auto' }}>
          {wkChange <= 0 ? '▼' : '▲'} {Math.abs(wkChange).toFixed(2)}% wk
        </span>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: 'var(--dim)' }}>
          52W: <span style={{ color: 'var(--green)' }}>{low52}%</span> — <span style={{ color: 'var(--red)' }}>{high52}%</span>
        </span>
      </div>

      <ResponsiveContainer width="100%" height={110}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <XAxis dataKey="week" tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, fill: 'var(--dim)' }} tickLine={false} axisLine={false} interval={3} />
          <YAxis domain={['auto', 'auto']} tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fill: 'var(--dim)' }} tickLine={false} axisLine={false} width={30} tickFormatter={v => `${v}%`} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="rate" stroke="var(--green)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: 'var(--green)' }} />
        </LineChart>
      </ResponsiveContainer>

      <div style={{ marginTop: '12px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', color: 'var(--dim)', marginBottom: '4px' }}>
          PAYMENT ESTIMATE (local median, 20% down)
        </div>
        {[
          { label: `30yr Fixed @ ${current}%`,         r: current,          n: 360 },
          { label: `15yr Fixed @ ${d.rate_30yr.rate15}%`, r: d.rate_30yr.rate15, n: 180 },
        ].map(({ label, r, n }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--muted)' }}>{label}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: 'var(--text)' }}>{fmt.currency(payment(r, n))}/mo</span>
          </div>
        ))}
      </div>
    </div>
  )
}
