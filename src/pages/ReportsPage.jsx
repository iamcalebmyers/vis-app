import { useState } from 'react'
import Nav from '../components/Nav'
import { SAMPLE_REPORT } from '../reports/mockReport'
import MarketScoreBlock from '../reports/blocks/MarketScoreBlock'
import MarketConditionsBlock from '../reports/blocks/MarketConditionsBlock'
import PropertyDetailBlock from '../reports/blocks/PropertyDetailBlock'
import FieldToggle from '../reports/blocks/FieldToggle'

function CardLayoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const btnBase = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600,
  padding: '7px 14px', borderRadius: '7px', cursor: 'pointer', transition: 'all 0.15s',
}

const ALL_PROPERTY_FIELDS = ['previousSale', 'pricePerSqft', 'schoolRating', 'floodZone', 'hoaMonthly', 'annualTaxes']

export default function ReportsPage({ onNavigate }) {
  const [format, setFormat] = useState(SAMPLE_REPORT.format)
  const [visibleFields, setVisibleFields] = useState(ALL_PROPERTY_FIELDS)
  const report = SAMPLE_REPORT
  const visibleBlocks = report.blocks.filter(b => b.visible)

  function toggleField(key) {
    setVisibleFields(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Nav page="reports" onNavigate={onNavigate} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '24px',
              fontWeight: 800, color: 'var(--text)', margin: 0,
            }}>Market + Property Report</h1>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px',
              color: 'var(--muted)', marginTop: '4px', letterSpacing: '0.04em',
            }}>{report.address} · {report.city}, {report.state} {report.zip}</div>
          </div>

          {/* Format picker */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '15px',
              fontWeight: 700, color: 'var(--text)', marginBottom: '4px',
            }}>Choose report format</div>
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
              color: 'var(--muted)', marginBottom: '12px',
            }}>Both formats contain identical data and support agent white labeling</div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                {
                  id: 'card',
                  Icon: CardLayoutIcon,
                  label: 'Modern card layout',
                  sub: 'Interactive web view · Shareable link · Export as PDF',
                  showDefault: true,
                },
                {
                  id: 'print',
                  Icon: DocumentIcon,
                  label: 'Print / document layout',
                  sub: 'Formal document style · Optimized for print · Export as PDF',
                  showDefault: false,
                },
              ].map(({ id, Icon, label, sub, showDefault }) => {
                const active = format === id
                return (
                  <button
                    key={id}
                    onClick={() => setFormat(id)}
                    style={{
                      flex: 1, textAlign: 'left', cursor: 'pointer',
                      padding: '12px 18px', borderRadius: '10px',
                      border: `1.5px solid ${active ? 'var(--green)' : 'var(--border)'}`,
                      background: active ? 'rgba(0,201,104,0.06)' : 'var(--card)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                      <span style={{ color: active ? 'var(--green)' : 'var(--muted)', display: 'flex' }}>
                        <Icon />
                      </span>
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: '14px',
                        fontWeight: 700, color: 'var(--text)',
                      }}>{label}</span>
                      {showDefault && active && (
                        <span style={{
                          fontSize: '10px', fontWeight: 600, padding: '2px 9px',
                          borderRadius: '20px', fontFamily: "'IBM Plex Mono', monospace",
                          background: 'rgba(0,201,104,0.12)', color: '#059669',
                        }}>Default</span>
                      )}
                    </div>
                    <div style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: '12px',
                      color: 'var(--muted)', lineHeight: 1.5,
                    }}>{sub}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action bar */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center' }}>
            <button style={{ ...btnBase, background: 'var(--green)', color: '#000', border: 'none' }}>
              <DownloadIcon /> Export PDF
            </button>
            <button style={{ ...btnBase, background: 'var(--bg)', color: 'var(--text)', border: '0.5px solid var(--border)' }}>
              <LinkIcon /> Copy share link
            </button>
            <button style={{ ...btnBase, background: 'var(--bg)', color: 'var(--text)', border: '0.5px solid var(--border)' }}>
              <MailIcon /> Send to client
            </button>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px',
              color: 'var(--muted)', marginLeft: '4px',
            }}>Generated {formatDate(report.generatedAt)}</span>
          </div>

          {/* Report container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {visibleBlocks.map(block => {
              if (block.type === 'marketConditions') {
                return (
                  <div key={block.id} style={{
                    background: format === 'card' ? 'var(--card)' : '#ffffff',
                    border: format === 'card' ? '0.5px solid var(--border)' : '0.5px solid #e0e0e0',
                    borderRadius: '12px', padding: '14px 16px',
                  }}>
                    <MarketConditionsBlock
                      rate={6.84}
                      rateDelta={0.03}
                      medianPrice={487000}
                      medianPriceDelta={-3.2}
                      daysOnMarket={42}
                      domDelta={14}
                      format={format}
                    />
                  </div>
                )
              }
              if (block.type === 'propertyDetail') {
                return (
                  <div key={block.id}>
                    <FieldToggle visibleFields={visibleFields} onToggle={toggleField} />
                    <div style={{
                      background: format === 'card' ? 'var(--card)' : '#ffffff',
                      border: format === 'card' ? '0.5px solid var(--border)' : '0.5px solid #e0e0e0',
                      borderRadius: '12px', padding: '14px 16px',
                    }}>
                      <PropertyDetailBlock
                        address={report.address}
                        cityStateZip={`${report.city}, ${report.state} ${report.zip}`}
                        beds={4} baths={3} sqft={2340} yearBuilt={2019}
                        visEstimate={487500} estimateRangeLow={465000} estimateRangeHigh={510000}
                        previousSalePrice={418000} previousSaleDate="Jun 2022"
                        pricePerSqft={208}
                        schoolRating={8} schoolName="Zavala Elementary"
                        floodZone="Zone X — Low Risk"
                        hoaMonthly={120} annualTaxes={9840}
                        appreciationPct={16.6}
                        format={format}
                        visibleFields={visibleFields}
                      />
                    </div>
                  </div>
                )
              }
              if (block.type === 'marketScore') {
                return (
                  <div key={block.id} style={{
                    background: format === 'card' ? 'var(--card)' : '#ffffff',
                    border: format === 'card' ? '0.5px solid var(--border)' : '0.5px solid #e0e0e0',
                    borderRadius: '12px', padding: '14px 16px',
                  }}>
                    <MarketScoreBlock
                      score={62}
                      label="Balanced — Slight Seller Advantage"
                      description="More inventory than 12 months ago, but well-priced homes still move quickly"
                      format={format}
                      geo={`${report.city} ${report.state}`}
                    />
                  </div>
                )
              }
              return (
                <div key={block.id} style={{
                  background: 'var(--card)', border: '1px dashed var(--border)',
                  borderRadius: '12px', padding: '24px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px',
                    color: 'var(--dim)', letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>{block.type}</span>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}
