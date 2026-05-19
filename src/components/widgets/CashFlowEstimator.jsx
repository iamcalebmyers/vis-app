import { useState } from 'react'
import { useGeo } from '../../context/GeoContext'
import { getGeoData } from '../../data/geoData'
import { cashFlow as calcCashFlow } from '../../utils/calculations'
import { fmt } from '../../utils/formatters'

function NumInput({ label, value, onChange, prefix = '', suffix = '', step = 1000, min = 0 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderTop: '1px solid var(--border)' }}>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--muted)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button onClick={() => onChange(Math.max(min, value - step))} style={{ background: 'var(--border)', border: 'none', borderRadius: '3px', color: 'var(--text)', width: '16px', height: '16px', cursor: 'pointer', lineHeight: 1 }}>−</button>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: 'var(--text)', minWidth: '62px', textAlign: 'center' }}>
          {prefix}{step < 1 ? value.toFixed(2) : value.toLocaleString()}{suffix}
        </span>
        <button onClick={() => onChange(value + step)} style={{ background: 'var(--border)', border: 'none', borderRadius: '3px', color: 'var(--text)', width: '16px', height: '16px', cursor: 'pointer', lineHeight: 1 }}>+</button>
      </div>
    </div>
  )
}

export default function CashFlowEstimator() {
  const { activeGeo } = useGeo()
  const d = getGeoData(activeGeo)

  const defaultPrice = d.home_price.median
  const defaultRent  = d.rent.median
  const defaultRate  = d.rate_30yr.rate

  const [price,    setPrice]    = useState(defaultPrice)
  const [downPctg, setDownPctg] = useState(20)
  const [rate,     setRate]     = useState(defaultRate)
  const [rent,     setRent]     = useState(defaultRent)
  const [taxMo,    setTaxMo]    = useState(Math.round(defaultPrice * 0.012 / 12))
  const [hoaMo,    setHoaMo]    = useState(0)

  const insuranceMo = Math.round(price * 0.005 / 12)
  const result = calcCashFlow({ homePrice: price, downPctg, rate, rent, taxMo, insuranceMo, hoaMo, maintPctg: 1 })
  const cf = result.monthly
  const cfColor = cf >= 0 ? 'var(--green)' : 'var(--red)'

  return (
    <div>
      <div style={{
        background: `${cfColor === 'var(--green)' ? '#00e87a' : '#f0455a'}15`,
        border: `1px solid ${cfColor === 'var(--green)' ? '#00e87a' : '#f0455a'}40`,
        borderRadius: '8px',
        padding: '10px 14px',
        marginBottom: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--muted)' }}>Monthly Cash Flow</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '20px', fontWeight: 800, color: cfColor }}>
          {cf >= 0 ? '+' : ''}{fmt.currency(cf)}
        </span>
      </div>

      <NumInput label="Purchase Price"  value={price}    onChange={setPrice}    prefix="$" step={5000} />
      <NumInput label="Down Payment"    value={downPctg} onChange={setDownPctg} suffix="%" step={5}    min={3} />
      <NumInput label="Interest Rate"   value={rate}     onChange={v => setRate(+(Math.max(0, v).toFixed(2)))} suffix="%" step={0.25} min={0} />
      <NumInput label="Monthly Rent"    value={rent}     onChange={setRent}     prefix="$" step={50} />
      <NumInput label="Property Tax /mo" value={taxMo}  onChange={setTaxMo}    prefix="$" step={25} />
      <NumInput label="HOA /mo"         value={hoaMo}    onChange={setHoaMo}    prefix="$" step={25} />

      <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
        {[
          { label: 'Mortgage (P&I)',     value: -result.mortgage },
          { label: 'Taxes + Insurance',  value: -(taxMo + insuranceMo) },
          { label: 'HOA + Maint.',       value: -(hoaMo + Math.round(price * 0.01 / 12)) },
          { label: 'Gross Rent',         value: rent },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', color: 'var(--dim)' }}>{r.label}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: r.value >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {r.value >= 0 ? '+' : ''}{fmt.currency(r.value)}
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', color: 'var(--muted)' }}>Cap Rate</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'var(--text)' }}>{result.capRate.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  )
}
