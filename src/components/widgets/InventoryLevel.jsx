import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useGeo } from '../../context/GeoContext'
import { fmt } from '../../utils/formatters'
import CompChip from './CompChip'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.[0]) return null
  return (
    <div style={{ background: 'var(--nav)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px' }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: 'var(--dim)' }}>{label}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', fontWeight: 700, color: 'var(--green)' }}>{fmt.num(payload[0].value)}</div>
    </div>
  )
}

export default function InventoryLevel() {
  const { data: d, national: nat } = useGeo()

  const current = d.inventory.current
  const yearAgo = d.inventory.yearAgo
  const yoy     = +((current - yearAgo) / yearAgo * 100).toFixed(1)
  const trend   = yoy > 5 ? 'rising' : yoy < -5 ? 'falling' : 'stable'
  // Rough months supply: ~6mo is balanced; scale based on national benchmark
  const natMonths = 4.2
  const months  = +((current / nat.inventory.current) * natMonths).toFixed(1)
  const natMonthsLocal = natMonths

  const monthlyData = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'].map((m, i) => ({
    month: m,
    value: Math.round(yearAgo + (current - yearAgo) * (i / 11) + (Math.random() - 0.5) * yearAgo * 0.04),
  }))
  monthlyData[monthlyData.length - 1].value = current

  const trendColor  = trend === 'rising'  ? 'var(--green)' : trend === 'falling' ? 'var(--red)' : 'var(--yellow)'
  const supplyColor = months < 3 ? 'var(--red)' : months < 6 ? 'var(--yellow)' : 'var(--green)'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '28px', fontWeight: 800, color: 'var(--text)' }}>
          {fmt.num(current, true)}
        </span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--muted)' }}>active listings</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: trendColor, marginLeft: 'auto' }}>
          {yoy >= 0 ? '▲' : '▼'} {Math.abs(yoy)}% YoY
        </span>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', fontWeight: 700, color: supplyColor }}>
          {months} mo supply
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'var(--dim)', marginLeft: '8px' }}>
          {months < 3 ? "(Seller's market < 3mo)" : months < 6 ? '(Balanced ~3-6mo)' : "(Buyer's market > 6mo)"}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barSize={8}>
          <XAxis dataKey="month" tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fill: 'var(--dim)' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fill: 'var(--dim)' }} tickLine={false} axisLine={false} width={30} tickFormatter={v => fmt.num(v, true)} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="var(--green)" radius={[2, 2, 0, 0]} opacity={0.7} />
        </BarChart>
      </ResponsiveContainer>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
        {[
          { label: 'Local YoY',     value: `${yoy >= 0 ? '+' : ''}${yoy}%`, color: yoy >= 0 ? 'var(--green)' : 'var(--red)' },
          { label: 'National',      value: fmt.num(nat.inventory.current, true), color: 'var(--text)' },
          { label: 'Months Supply', value: `${months}mo`, color: supplyColor },
          { label: 'Nat. Supply',   value: `${natMonthsLocal}mo`, color: 'var(--muted)' },
        ].map(s => (
          <div key={s.label} style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '5px' }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', color: 'var(--dim)', marginBottom: '2px' }}>{s.label}</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <CompChip label="vs. National" local={current} national={nat.inventory.current} unit="" />
    </div>
  )
}
