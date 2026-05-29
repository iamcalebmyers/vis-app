type Props = {
  address: string
  cityStateZip: string
  beds: number
  baths: number
  sqft: number
  yearBuilt: number
  visEstimate: number
  estimateRangeLow: number
  estimateRangeHigh: number
  previousSalePrice: number
  previousSaleDate: string
  pricePerSqft: number
  schoolRating: number
  schoolName: string
  floodZone: string
  hoaMonthly: number
  annualTaxes: number
  appreciationPct: number
  format: 'card' | 'print'
  visibleFields: string[]
}

function fmtMoney(v: number) {
  return `$${v.toLocaleString('en-US')}`
}

function fmtK(v: number) {
  return `$${Math.round(v / 1000)}K`
}

export default function PropertyDetailBlock(props: Props) {
  const {
    address, cityStateZip, beds, baths, sqft, yearBuilt,
    visEstimate, estimateRangeLow, estimateRangeHigh,
    previousSalePrice, previousSaleDate, pricePerSqft,
    schoolRating, schoolName, floodZone, hoaMonthly, annualTaxes,
    appreciationPct, format, visibleFields,
  } = props

  const subline = `${cityStateZip} · ${beds}bd · ${baths}ba · ${sqft.toLocaleString()} sqft · Built ${yearBuilt}`

  const optionalRows = [
    { key: 'previousSale', label: 'Previous sale',  value: `${fmtMoney(previousSalePrice)} · ${previousSaleDate}` },
    { key: 'pricePerSqft', label: 'Price per sqft', value: `${fmtMoney(pricePerSqft)} / sqft` },
    { key: 'schoolRating', label: 'School rating',  value: `${schoolRating}/10 · ${schoolName}` },
    { key: 'floodZone',    label: 'Flood zone',     value: floodZone },
    { key: 'hoaMonthly',   label: 'HOA',            value: `${fmtMoney(hoaMonthly)} / month` },
    { key: 'annualTaxes',  label: 'Annual taxes',   value: fmtMoney(annualTaxes) },
  ].filter(r => visibleFields.includes(r.key))

  /* ── PRINT ─────────────────────────────────────────────────────────────── */
  if (format === 'print') {
    const allAttrs = [
      { label: 'Bedrooms',       value: String(beds)                                },
      { label: 'Bathrooms',      value: String(baths)                               },
      { label: 'Square footage', value: `${sqft.toLocaleString()} sqft`             },
      { label: 'Year built',     value: String(yearBuilt)                           },
      ...(visibleFields.includes('hoaMonthly')   ? [{ label: 'HOA',           value: `${fmtMoney(hoaMonthly)} / month`                  }] : []),
      ...(visibleFields.includes('floodZone')    ? [{ label: 'Flood zone',    value: floodZone                                          }] : []),
      ...(visibleFields.includes('schoolRating') ? [{ label: 'School rating', value: `${schoolRating}/10 · ${schoolName}`               }] : []),
      ...(visibleFields.includes('previousSale') ? [{ label: 'Previous sale', value: `${fmtMoney(previousSalePrice)} · ${previousSaleDate}` }] : []),
      ...(visibleFields.includes('annualTaxes')  ? [{ label: 'Annual taxes',  value: fmtMoney(annualTaxes)                              }] : []),
      ...(visibleFields.includes('pricePerSqft') ? [{ label: 'Price / sqft',  value: `${fmtMoney(pricePerSqft)} / sqft`                 }] : []),
    ]

    // Pair into 2-column table rows
    const rows: Array<[typeof allAttrs[0], typeof allAttrs[0] | undefined]> = []
    for (let i = 0; i < allAttrs.length; i += 2) {
      rows.push([allAttrs[i], allAttrs[i + 1]])
    }

    return (
      <div>
        <h2 style={{
          fontFamily: 'Arial, sans-serif', fontSize: '12px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444',
          margin: '0 0 10px', paddingBottom: '4px', borderBottom: '2px solid #111',
        }}>
          Property analysis · {address}
        </h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'Arial, sans-serif', marginBottom: '14px' }}>
          <thead>
            <tr>
              {['Attribute', 'Detail', 'Attribute', 'Detail'].map((h, i) => (
                <th key={i} style={{
                  background: '#111', color: '#fff', padding: '6px 10px',
                  textAlign: 'left', fontWeight: 600, fontSize: '10px',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([left, right], i) => (
              <tr key={i}>
                <td style={{ padding: '6px 10px', borderBottom: '0.5px solid #e0e0e0', color: '#555' }}>{left.label}</td>
                <td style={{ padding: '6px 10px', borderBottom: '0.5px solid #e0e0e0', color: '#333', fontWeight: 500 }}>{left.value}</td>
                <td style={{ padding: '6px 10px', borderBottom: '0.5px solid #e0e0e0', color: '#555' }}>{right?.label ?? ''}</td>
                <td style={{ padding: '6px 10px', borderBottom: '0.5px solid #e0e0e0', color: '#333', fontWeight: 500 }}>{right?.value ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Estimate box */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#f7f7f7', border: '1px solid #e0e0e0', borderRadius: '6px',
          padding: '12px 16px', marginBottom: '14px',
        }}>
          <div>
            <div style={{
              fontFamily: 'Arial, sans-serif', fontSize: '10px', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: '3px',
            }}>Vis estimated value</div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '26px', fontWeight: 700, color: '#111' }}>
              {fmtMoney(visEstimate)}
            </div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#555' }}>
              Range: {fmtMoney(estimateRangeLow)} — {fmtMoney(estimateRangeHigh)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#555' }}>Appreciation since purchase</div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '18px', fontWeight: 700, color: '#059669' }}>
              +{appreciationPct}%
            </div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#555' }}>
              {fmtMoney(previousSalePrice)} → {fmtMoney(visEstimate)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── CARD ──────────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      {/* Left: address + rows */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '18px',
          fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)',
        }}>{address}</div>
        <div style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '12px',
          color: 'var(--muted)', marginBottom: '10px', marginTop: '1px',
        }}>{subline}</div>

        {optionalRows.map((row, i) => (
          <div key={row.key} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '7px 0',
            borderBottom: i < optionalRows.length - 1 ? '0.5px solid var(--border)' : 'none',
          }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--muted)' }}>
              {row.label}
            </span>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px',
              fontWeight: 600, color: 'var(--text)',
            }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Right: VIS ESTIMATE */}
      <div style={{ textAlign: 'right', marginLeft: '24px', flexShrink: 0 }}>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px',
          color: 'var(--muted)', letterSpacing: '0.07em', marginBottom: '3px',
        }}>VIS ESTIMATE</div>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: '26px',
          fontWeight: 900, color: 'var(--green)', letterSpacing: '-0.03em',
        }}>{fmtMoney(visEstimate)}</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--muted)' }}>
          Range {fmtK(estimateRangeLow)} — {fmtK(estimateRangeHigh)}
        </div>
        <div style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '11px',
          color: '#059669', marginTop: '3px',
        }}>↑ +{appreciationPct}% since purchase</div>
      </div>
    </div>
  )
}
