import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useGeo } from '../../context/GeoContext'
import CompChip from './CompChip'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.[0]) return null
  return (
    <div style={{ background: 'var(--nav)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px' }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: 'var(--dim)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', fontWeight: 700, color: 'var(--yellow)' }}>
        {payload[0].value}d
      </div>
    </div>
  )
}

export default function DOMTracker() {
  const { data: d, national: nat } = useGeo()

  const current = d.dom.current
  const yearAgo = d.dom.yearAgo
  const pctChange = ((current - yearAgo) / yearAgo * 100).toFixed(1)
  const trend = current > yearAgo * 1.05 ? 'rising' : current < yearAgo * 0.95 ? 'falling' : 'stable'

  const data = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'][i],
    dom: Math.round(yearAgo + (current - yearAgo) * (i / 11) + (Math.random() - 0.5) * 4),
  }))
  data[data.length - 1].dom = current

  const trendColor = trend === 'falling' ? 'var(--green)' : trend === 'rising' ? 'var(--red)' : 'var(--yellow)'
  const trendArrow = trend === 'falling' ? '▼' : trend === 'rising' ? '▲' : '→'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '28px', fontWeight: 800, color: 'var(--text)' }}>
          {current}
        </span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--muted)' }}>days on market</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', color: trendColor, marginLeft: 'auto' }}>
          {trendArrow} {trend}
        </span>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: 'var(--dim)' }}>
          Year ago: <span style={{ color: 'var(--muted)' }}>{yearAgo}d</span>
          {'  '}
          <span style={{ color: trendColor }}>{pctChange >= 0 ? '+' : ''}{pctChange}% YoY</span>
        </span>
      </div>

      <ResponsiveContainer width="100%" height={110}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="domGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--yellow)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--yellow)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fill: 'var(--dim)' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fill: 'var(--dim)' }} tickLine={false} axisLine={false} width={24} tickFormatter={v => `${v}d`} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={yearAgo} stroke="var(--dim)" strokeDasharray="3 3" />
          <Area type="monotone" dataKey="dom" stroke="var(--yellow)" strokeWidth={2} fill="url(#domGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>

      <CompChip label="vs. National" local={current} national={nat.dom.current} unit="d" invertPositive />
    </div>
  )
}
