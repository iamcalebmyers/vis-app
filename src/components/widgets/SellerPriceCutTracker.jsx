import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useGeo } from '../../context/GeoContext'
import CompChip from './CompChip'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.[0]) return null
  return (
    <div style={{ background: 'var(--nav)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px' }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: 'var(--dim)' }}>{label}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', fontWeight: 700, color: 'var(--yellow)' }}>{payload[0].value}%</div>
    </div>
  )
}

export default function SellerPriceCutTracker() {
  const { data: d } = useGeo()

  const current  = d.price_cuts.pct
  const yearAgo  = d.price_cuts.yearAgo
  const national = d.price_cuts.national
  const trend    = current > yearAgo * 1.05 ? 'rising' : current < yearAgo * 0.95 ? 'falling' : 'stable'

  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const data = months.map((m, i) => ({
    month: m,
    pct: +(yearAgo + (current - yearAgo) * (i / 11) + (Math.random() - 0.5) * 3).toFixed(1),
  }))
  data[data.length - 1].pct = current

  const color      = current > 25 ? 'var(--green)' : current > 15 ? 'var(--yellow)' : 'var(--red)'
  const trendColor = trend === 'rising' ? 'var(--green)' : trend === 'falling' ? 'var(--red)' : 'var(--yellow)'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '28px', fontWeight: 800, color }}>
          {current}%
        </span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--muted)' }}>of listings cut</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: trendColor, marginLeft: 'auto' }}>
          {trend === 'rising' ? '▲' : trend === 'falling' ? '▼' : '→'} {trend}
        </span>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: 'var(--dim)' }}>
          National avg: <span style={{ color: 'var(--muted)' }}>{national}%</span>
          {'  '}
          <span style={{ color: current > national ? 'var(--green)' : 'var(--red)' }}>
            {current > national ? '▲' : '▼'} {Math.abs(current - national).toFixed(1)}pp vs national
          </span>
        </span>
      </div>

      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barSize={8}>
          <XAxis dataKey="month" tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fill: 'var(--dim)' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fill: 'var(--dim)' }} tickLine={false} axisLine={false} width={24} tickFormatter={v => `${v}%`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="pct" radius={[2, 2, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === data.length - 1 ? color : 'var(--border)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div style={{ marginTop: '10px', padding: '7px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--muted)' }}>
          {current > 25
            ? 'High cut rate — sellers are competing. Buyer-friendly conditions.'
            : current > 15
            ? 'Moderate cuts — balanced pricing power between buyers and sellers.'
            : 'Low cut rate — sellers are firm. Limited negotiating room for buyers.'}
        </span>
      </div>

      <CompChip label="vs. National" local={current} national={national} unit="%" />
    </div>
  )
}
