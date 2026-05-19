import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useGeo } from '../../context/GeoContext'
import { getGeoData } from '../../data/geoData'

const FED_FUND_HISTORY = [
  { month: 'Jan', fed: 5.33 }, { month: 'Feb', fed: 5.33 }, { month: 'Mar', fed: 5.33 },
  { month: 'Apr', fed: 5.33 }, { month: 'May', fed: 5.33 }, { month: 'Jun', fed: 5.25 },
  { month: 'Jul', fed: 5.00 }, { month: 'Aug', fed: 4.75 }, { month: 'Sep', fed: 4.50 },
  { month: 'Oct', fed: 4.50 }, { month: 'Nov', fed: 4.50 }, { month: 'Dec', fed: 4.25 },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.[0]) return null
  return (
    <div style={{ background: 'var(--nav)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px' }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: 'var(--dim)', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', fontWeight: 700, color: 'var(--yellow)' }}>Fed: {payload[0]?.value}%</div>
      {payload[1] && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', fontWeight: 700, color: 'var(--green)' }}>30yr: {payload[1].value}%</div>}
    </div>
  )
}

export default function FedRateWatch() {
  const { activeGeo } = useGeo()
  const d = getGeoData(activeGeo)

  const rate30yr  = d.rate_30yr.current
  const spread    = (rate30yr - FED_FUND_HISTORY[FED_FUND_HISTORY.length - 1].fed).toFixed(2)

  const data = FED_FUND_HISTORY.map(r => ({
    ...r,
    rate30: +(r.fed + parseFloat(spread) * (0.9 + Math.random() * 0.2)).toFixed(2),
  }))
  data[data.length - 1].rate30 = rate30yr

  const nextMeeting = 'Jun 11, 2025'
  const probCut = 62

  return (
    <div>
      {/* Rates row */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
        <div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', color: 'var(--dim)', marginBottom: '2px' }}>FED FUNDS</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '20px', fontWeight: 800, color: 'var(--yellow)' }}>
            {FED_FUND_HISTORY[FED_FUND_HISTORY.length - 1].fed}%
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', color: 'var(--dim)', marginBottom: '2px' }}>30YR FIXED</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '20px', fontWeight: 800, color: 'var(--green)' }}>
            {rate30yr}%
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', color: 'var(--dim)', marginBottom: '2px' }}>SPREAD</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>
            +{spread}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={110}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <XAxis dataKey="month" tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fill: 'var(--dim)' }} tickLine={false} axisLine={false} />
          <YAxis domain={['auto', 'auto']} tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fill: 'var(--dim)' }} tickLine={false} axisLine={false} width={28} tickFormatter={v => `${v}%`} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="fed"    stroke="var(--yellow)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="rate30" stroke="var(--green)"  strokeWidth={2} dot={false} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>

      {/* Next meeting */}
      <div style={{ marginTop: '10px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', color: 'var(--dim)', marginBottom: '2px' }}>NEXT FOMC</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: 'var(--text)' }}>{nextMeeting}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', color: 'var(--dim)', marginBottom: '2px' }}>CUT PROBABILITY</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: probCut > 50 ? 'var(--green)' : 'var(--red)' }}>{probCut}%</div>
        </div>
      </div>
    </div>
  )
}
