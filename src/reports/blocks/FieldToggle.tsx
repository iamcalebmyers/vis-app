const FIELDS = [
  { key: 'previousSale', label: 'Previous sale' },
  { key: 'pricePerSqft', label: 'Price / sqft' },
  { key: 'schoolRating', label: 'School rating' },
  { key: 'floodZone',    label: 'Flood zone'    },
  { key: 'hoaMonthly',   label: 'HOA'           },
  { key: 'annualTaxes',  label: 'Annual taxes'  },
]

type Props = {
  visibleFields: string[]
  onToggle: (key: string) => void
}

export default function FieldToggle({ visibleFields, onToggle }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px',
        color: 'var(--dim)', letterSpacing: '0.07em', textTransform: 'uppercase',
        marginRight: '2px', flexShrink: 0,
      }}>Show fields</span>

      {FIELDS.map(({ key, label }) => {
        const on = visibleFields.includes(key)
        return (
          <button
            key={key}
            onClick={() => onToggle(key)}
            style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600,
              padding: '3px 10px', borderRadius: '20px', cursor: 'pointer',
              border: `1px solid ${on ? 'var(--green)' : 'var(--border)'}`,
              background: on ? 'rgba(0,201,104,0.08)' : 'var(--card)',
              color: on ? 'var(--green)' : 'var(--muted)',
              transition: 'all 0.12s',
            }}
          >
            {on ? '✓ ' : ''}{label}
          </button>
        )
      })}
    </div>
  )
}
