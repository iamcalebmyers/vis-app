import { useGeo } from '../../context/GeoContext'
import { getGeoData, geoData } from '../../data/geoData'
import CompChip from './CompChip'

export default function SellerBuyerMeter() {
  const { activeGeo } = useGeo()
  const d   = getGeoData(activeGeo)
  const nat = geoData.national
  const { score, label, inventoryScore, domScore, cutsScore } = d.seller_buyer

  // score: 0 = strong buyer, 100 = strong seller
  const pct = score
  const needleX = `${pct}%`

  function barColor(v) {
    if (v >= 65) return 'var(--red)'
    if (v >= 50) return 'var(--yellow)'
    return 'var(--green)'
  }

  return (
    <div>
      {/* Label */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px', fontWeight: 800, color: barColor(score) }}>
          {label}
        </span>
      </div>

      {/* Gradient track */}
      <div style={{ position: 'relative', margin: '0 8px 16px' }}>
        <div style={{
          height: '8px',
          borderRadius: '4px',
          background: 'linear-gradient(to right, var(--green), var(--yellow), var(--red))',
        }} />
        {/* Needle */}
        <div style={{
          position: 'absolute',
          top: '-4px',
          left: needleX,
          transform: 'translateX(-50%)',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: 'var(--nav)',
          border: `2px solid ${barColor(score)}`,
          transition: 'left 0.4s ease',
        }} />
        {/* Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'var(--green)' }}>Strong Buyer</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'var(--red)' }}>Strong Seller</span>
        </div>
      </div>

      {/* Sub-factors */}
      {[
        { label: 'Inventory', value: inventoryScore },
        { label: 'Days on Market', value: domScore },
        { label: 'Price Cuts', value: 100 - cutsScore },
      ].map(f => (
        <div key={f.label} style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--muted)' }}>{f.label}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: barColor(f.value) }}>{f.value}</span>
          </div>
          <div style={{ height: '3px', borderRadius: '3px', background: 'var(--border)' }}>
            <div style={{ height: '100%', borderRadius: '3px', background: barColor(f.value), width: `${f.value}%`, transition: 'width 0.4s' }} />
          </div>
        </div>
      ))}

      <CompChip label="vs. National" local={score} national={nat.seller_buyer.score} unit="" />
    </div>
  )
}
