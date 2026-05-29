type Comp = {
  address: string
  beds: number
  baths: number
  sqft: number
  salePrice: number
  pricePerSqft: number
}

type Props = {
  comps: Comp[]
  format: 'card' | 'print'
}

function fmtMoney(v: number) {
  return `$${v.toLocaleString('en-US')}`
}

const COLS = [
  { key: 'address',     label: 'Address',     align: 'left'  as const },
  { key: 'bedsBaths',   label: 'Beds/Bath',   align: 'left'  as const },
  { key: 'sqft',        label: 'Sq ft',       align: 'right' as const },
  { key: 'salePrice',   label: 'Sale price',  align: 'right' as const },
  { key: 'pricePerSqft',label: '$/sqft',      align: 'right' as const },
]

function avgPrice(comps: Comp[]) {
  return Math.round(comps.reduce((s, c) => s + c.salePrice, 0) / comps.length)
}

function avgPpSqft(comps: Comp[]) {
  return Math.round(comps.reduce((s, c) => s + c.pricePerSqft, 0) / comps.length)
}

export default function CompsBlock({ comps, format }: Props) {
  const avg = { price: avgPrice(comps), ppSqft: avgPpSqft(comps) }

  function rowValues(c: Comp) {
    return {
      address:      c.address,
      bedsBaths:    `${c.beds}/${c.baths}`,
      sqft:         c.sqft.toLocaleString('en-US'),
      salePrice:    fmtMoney(c.salePrice),
      pricePerSqft: `$${c.pricePerSqft}`,
    }
  }

  /* ── PRINT ─────────────────────────────────────────────────────────────── */
  if (format === 'print') {
    return (
      <div>
        <h2 style={{
          fontFamily: 'Arial, sans-serif', fontSize: '12px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444',
          margin: '0 0 10px', paddingBottom: '4px', borderBottom: '2px solid #111',
        }}>Comparable sales (90 days)</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'Arial, sans-serif', marginBottom: '10px' }}>
          <thead>
            <tr>
              {COLS.map(col => (
                <th key={col.key} style={{
                  background: '#111', color: '#fff', padding: '6px 10px',
                  textAlign: col.align, fontWeight: 600, fontSize: '10px',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comps.map((c, i) => {
              const vals = rowValues(c)
              return (
                <tr key={i}>
                  {COLS.map(col => (
                    <td key={col.key} style={{
                      padding: '6px 10px', borderBottom: '0.5px solid #e0e0e0',
                      color: '#333', textAlign: col.align,
                    }}>{vals[col.key as keyof typeof vals]}</td>
                  ))}
                </tr>
              )
            })}
            {/* Average row */}
            <tr style={{ background: '#f7f7f7' }}>
              <td style={{ padding: '6px 10px', fontWeight: 700, color: '#111', fontFamily: 'Arial, sans-serif' }}>Comp average</td>
              <td style={{ padding: '6px 10px', color: '#999', textAlign: 'left' }}>—</td>
              <td style={{ padding: '6px 10px', color: '#999', textAlign: 'right' }}>—</td>
              <td style={{ padding: '6px 10px', fontWeight: 700, color: '#111', textAlign: 'right' }}>{fmtMoney(avg.price)}</td>
              <td style={{ padding: '6px 10px', fontWeight: 700, color: '#111', textAlign: 'right' }}>${avg.ppSqft}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  /* ── CARD ──────────────────────────────────────────────────────────────── */
  return (
    <div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px',
        letterSpacing: '0.07em', textTransform: 'uppercase',
        color: 'var(--muted)', marginBottom: '10px',
      }}>Comparable sales (90 days)</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr>
            {COLS.map(col => (
              <th key={col.key} style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px',
                fontWeight: 700, color: 'var(--dim)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                padding: '0 8px 8px', textAlign: col.align,
                borderBottom: '0.5px solid var(--border)',
              }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comps.map((c, i) => {
            const vals = rowValues(c)
            return (
              <tr key={i}>
                {COLS.map(col => (
                  <td key={col.key} style={{
                    fontFamily: col.key === 'address' ? "'DM Sans', sans-serif" : "'IBM Plex Mono', monospace",
                    fontSize: '12px', color: 'var(--text)',
                    padding: '8px 8px',
                    borderBottom: '0.5px solid var(--border)',
                    textAlign: col.align,
                  }}>{vals[col.key as keyof typeof vals]}</td>
                ))}
              </tr>
            )
          })}
          {/* Average row */}
          <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
            <td style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 700, color: 'var(--text)', padding: '8px 8px' }}>Comp average</td>
            <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', color: 'var(--dim)', padding: '8px 8px' }}>—</td>
            <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', color: 'var(--dim)', padding: '8px 8px', textAlign: 'right' }}>—</td>
            <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', fontWeight: 700, color: 'var(--text)', padding: '8px 8px', textAlign: 'right' }}>{fmtMoney(avg.price)}</td>
            <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', fontWeight: 700, color: 'var(--text)', padding: '8px 8px', textAlign: 'right' }}>${avg.ppSqft}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
