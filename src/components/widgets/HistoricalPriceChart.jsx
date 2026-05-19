import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts'
import { useGeo } from '../../context/GeoContext'
import { historicalPrices } from '../../data/geoData'
import { fmt } from '../../utils/formatters'

const RANGES = ['1Y', '3Y', '5Y', '10Y', '25Y']
const EVENTS = [
  { date: '2006-12', label: 'Peak' },
  { date: '2008-09', label: '2008\nCrisis' },
  { date: '2012-01', label: 'Bottom' },
  { date: '2020-03', label: 'COVID' },
  { date: '2022-06', label: '2022\nPeak' },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.[0]) return null
  return (
    <div style={{ background: 'var(--nav)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px' }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: 'var(--dim)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', fontWeight: 700, color: 'var(--green)' }}>
        {fmt.currency(payload[0].value)}
      </div>
    </div>
  )
}

export default function HistoricalPriceChart() {
  const { activeGeo } = useGeo()
  const [range, setRange]           = useState('10Y')
  const [showNational, setNational] = useState(false)

  const allData    = historicalPrices[activeGeo] ?? historicalPrices.national
  const natData    = historicalPrices.national
  const monthsBack = { '1Y': 12, '3Y': 36, '5Y': 60, '10Y': 120, '25Y': Infinity }[range]

  const chartData = useMemo(() => {
    const sliced = allData.slice(-Math.min(monthsBack, allData.length))
    return sliced.map(d => {
      const nat = natData.find(n => n.date === d.date)
      return { ...d, national: nat?.price ?? null }
    })
  }, [allData, natData, monthsBack])

  const current = allData[allData.length - 1]?.price ?? 0
  const first   = chartData[0]?.price ?? 1
  const yoyStart = chartData[chartData.length - 13]?.price ?? first
  const yoy = ((current - yoyStart) / yoyStart * 100).toFixed(1)

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 800, color: 'var(--text)' }}>
          {fmt.currency(current, true)}
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', color: yoy >= 0 ? 'var(--green)' : 'var(--red)' }}>
          {yoy >= 0 ? '▲' : '▼'} {Math.abs(yoy)}% YoY
        </span>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--muted)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showNational} onChange={e => setNational(e.target.checked)} />
          National avg
        </label>

        <div style={{ display: 'flex', background: 'var(--nav)', border: '1px solid var(--border)', borderRadius: '8px', padding: '3px', gap: '2px' }}>
          {RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              background: range === r ? 'var(--green)' : 'transparent',
              border: 'none', borderRadius: '5px',
              color: range === r ? 'var(--nav)' : 'var(--muted)',
              fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', fontWeight: 700,
              padding: '3px 8px', cursor: 'pointer',
            }}>{r}</button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--green)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fill: 'var(--dim)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fill: 'var(--dim)' }} tickLine={false} axisLine={false} tickFormatter={v => `$${Math.round(v/1000)}K`} width={42} />
          <Tooltip content={<CustomTooltip />} />
          {EVENTS.map(e => (
            range === '25Y' && chartData.some(d => d.date.startsWith(e.date.slice(0,4))) && (
              <ReferenceLine key={e.date} x={e.date} stroke="var(--dim)" strokeDasharray="3 3"
                label={{ value: e.label, position: 'top', fill: 'var(--dim)', fontSize: 8, fontFamily: "'IBM Plex Mono', monospace" }}
              />
            )
          ))}
          <Area type="monotone" dataKey="price" stroke="var(--green)" strokeWidth={2} fill="url(#priceGrad)" dot={false} />
          {showNational && <Area type="monotone" dataKey="national" stroke="var(--yellow)" strokeWidth={1.5} strokeDasharray="4 2" fill="none" dot={false} />}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
