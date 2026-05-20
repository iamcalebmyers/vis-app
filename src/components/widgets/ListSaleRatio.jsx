import { useGeo } from '../../context/GeoContext'
import CompChip from './CompChip'

export default function ListSaleRatio() {
  const { data: d, national: nat } = useGeo()

  const { ratio, yearAgo } = d.list_sale
  const delta = ratio - yearAgo
  const color = ratio >= 100 ? 'var(--red)' : ratio >= 99 ? 'var(--yellow)' : 'var(--green)'
  const label = ratio >= 100 ? 'At/Above Ask' : ratio >= 98 ? 'Near Ask' : 'Below Ask'

  const barFill = Math.min((ratio / 102) * 100, 100)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '28px', fontWeight: 800, color }}>
          {ratio}%
        </span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--muted)' }}>list-to-sale</span>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', fontWeight: 700, color }}>{label}</span>
      </div>

      {/* Visual gauge */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ height: '6px', borderRadius: '4px', background: 'var(--border)', marginBottom: '6px' }}>
          <div style={{ height: '100%', borderRadius: '4px', background: color, width: `${barFill}%`, transition: 'width 0.4s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '8px', color: 'var(--green)' }}>95%</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '8px', color: 'var(--dim)' }}>100%</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '8px', color: 'var(--red)' }}>102%+</span>
        </div>
      </div>

      {[
        { label: 'Current', value: `${ratio}%`, color },
        { label: 'Year Ago', value: `${yearAgo}%`, color: 'var(--muted)' },
        { label: 'National', value: `${nat.list_sale.ratio}%`, color: 'var(--dim)' },
      ].map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--muted)' }}>{r.label}</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: r.color }}>{r.value}</span>
        </div>
      ))}

      <div style={{ marginTop: '10px', padding: '7px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--muted)' }}>
          {ratio >= 100
            ? 'Homes selling at or above asking. Strong seller conditions.'
            : ratio >= 98
            ? 'Homes selling close to ask. Balanced market dynamics.'
            : 'Homes selling below asking. Buyer negotiating power present.'}
        </span>
      </div>

      <CompChip label="vs. National" local={ratio} national={nat.list_sale.ratio} unit="%" />
    </div>
  )
}
