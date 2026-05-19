import { useRef, useState } from 'react'
import { themes } from '../theme'
import { useGeo } from '../context/GeoContext'
import { useWidgetConfig } from '../hooks/useWidgetConfig'
import { GEO_HIERARCHY } from '../data/geoData'
import { CATEGORY_LABELS } from '../data/widgetConfig'
import { INVESTOR_LAYOUT, AGENT_LAYOUT, DEFAULT_LAYOUT } from '../data/defaultLayouts'
import Nav from '../components/Nav'

const THEME_LABELS = { charcoal: 'Charcoal', black: 'True Black', light: 'Light' }

// ─────────────────────────── Shared UI ──────────────────────────────────────
function SectionHeader({ children, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border)',
    }}>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px',
        color: 'var(--muted)', letterSpacing: '0.1em',
      }}>{children}</span>
      {action}
    </div>
  )
}

function Toggle({ on, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: '36px', height: '20px', borderRadius: '10px',
        background: on ? 'var(--green)' : 'var(--border)',
        cursor: 'pointer', transition: 'background 0.2s',
        position: 'relative', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: '3px',
        left: on ? '19px' : '3px',
        width: '14px', height: '14px', borderRadius: '50%',
        background: on ? 'var(--nav)' : 'var(--dim)',
        transition: 'left 0.2s, background 0.2s',
      }} />
    </div>
  )
}

function Row({ label, sublabel, right, dim = false, badge }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '12px',
      padding: '10px 14px',
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      marginBottom: '6px',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 500,
            color: dim ? 'var(--muted)' : 'var(--text)',
            transition: 'color 0.15s',
          }}>{label}</span>
          {badge}
        </div>
        {sublabel && (
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px',
            color: 'var(--dim)', marginTop: '2px',
          }}>{sublabel}</div>
        )}
      </div>
      {right}
    </div>
  )
}

function Button({ onClick, children, variant = 'secondary' }) {
  const styles = variant === 'primary'
    ? { bg: 'var(--green)', color: 'var(--nav)', border: 'var(--green)', weight: 700 }
    : variant === 'danger'
    ? { bg: 'transparent', color: 'var(--red)', border: 'var(--red)', weight: 600 }
    : { bg: 'var(--card)', color: 'var(--text)', border: 'var(--border)', weight: 600 }
  return (
    <button
      onClick={onClick}
      style={{
        background: styles.bg, color: styles.color,
        border: `1px solid ${styles.border}`,
        borderRadius: '6px', padding: '7px 14px',
        fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: styles.weight,
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >{children}</button>
  )
}

// ─────────────────────────── Theme ──────────────────────────────────────────
function ThemeCard({ name, active, onSelect }) {
  const t = themes[name]
  return (
    <div
      onClick={() => onSelect(name)}
      style={{
        flex: 1,
        background: t['--bg'],
        border: `2px solid ${active ? t['--green'] : t['--border']}`,
        borderRadius: '12px', padding: '16px', cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
        <div style={{ background: t['--nav'], borderRadius: '6px', height: '12px', border: `1px solid ${t['--border']}` }} />
        <div style={{ display: 'flex', gap: '5px' }}>
          <div style={{ background: t['--card'], borderRadius: '5px', height: '28px', flex: 2, border: `1px solid ${t['--border']}` }} />
          <div style={{ background: t['--card'], borderRadius: '5px', height: '28px', flex: 1, border: `1px solid ${t['--border']}` }} />
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ background: t['--card'], borderRadius: '4px', height: '18px', flex: 1, border: `1px solid ${t['--border']}` }} />
          ))}
        </div>
        <div style={{ width: '40%', height: '4px', borderRadius: '2px', background: t['--green'] }} />
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '13px', color: t['--text'] }}>
        {THEME_LABELS[name]}
      </div>
      {active && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: t['--green'], marginTop: '3px', letterSpacing: '0.08em' }}>
          ACTIVE
        </div>
      )}
    </div>
  )
}

// ─────────────────────────── Profile Preset ─────────────────────────────────
function ProfileCard({ name, description, icon, active, onSelect }) {
  return (
    <div
      onClick={onSelect}
      style={{
        flex: 1, padding: '16px', borderRadius: '12px',
        background: active ? 'rgba(0,232,122,0.06)' : 'var(--card)',
        border: `2px solid ${active ? 'var(--green)' : 'var(--border)'}`,
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      <div style={{ fontSize: '22px', marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>
        {name}
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--muted)', lineHeight: 1.4 }}>
        {description}
      </div>
      {active && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'var(--green)', marginTop: '8px', letterSpacing: '0.08em' }}>
          ACTIVE
        </div>
      )}
    </div>
  )
}

// ─────────────────────────── Main ───────────────────────────────────────────
export default function Settings({
  theme, setTheme,
  topPanels, setTopPanels,
  metrics, setMetrics,
  onNavigate,
}) {
  const { activeGeo, setActiveGeo } = useGeo()
  const { widgets, enabledWidgets, toggle: toggleWidget, loadLayout, exportLayout, importLayout } = useWidgetConfig()
  const fileInputRef = useRef(null)
  const [activeProfile, setActiveProfile] = useState(() => localStorage.getItem('vis-profile') || 'default')

  function applyProfile(profile) {
    const layout = profile === 'investor' ? INVESTOR_LAYOUT
                 : profile === 'agent'    ? AGENT_LAYOUT
                 : DEFAULT_LAYOUT
    loadLayout(layout)
    setActiveProfile(profile)
    localStorage.setItem('vis-profile', profile)
  }

  function handleImportClick() { fileInputRef.current?.click() }
  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) importLayout(file)
    e.target.value = ''
  }

  function resetAll() {
    if (!confirm('Reset all dashboard settings to defaults? This clears your theme, widget layout, hidden cards, and panel preferences.')) return
    [
      'vis-theme', 'vis-geo', 'vis-widgets', 'vis-top-panels', 'vis-bottom-panels',
      'vis-metrics', 'vis-card-order', 'vis-cards-hidden', 'vis-profile',
    ].forEach(k => localStorage.removeItem(k))
    location.reload()
  }

  // Group widgets by category
  const widgetsByCategory = widgets.reduce((acc, w) => {
    if (!acc[w.category]) acc[w.category] = []
    acc[w.category].push(w)
    return acc
  }, {})
  const categoryOrder = ['market', 'forecast', 'data_explorer', 'investment', 'agent', 'neighborhood']

  const enabledCount = enabledWidgets.length
  const totalBuilt   = widgets.filter(w => w.built).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Nav page="settings" onNavigate={onNavigate} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>

          {/* Page header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '4px' }}>
              Settings
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--muted)' }}>
              Toggle any dashboard feature on or off. Changes are saved automatically.
            </p>
          </div>

          {/* APPEARANCE */}
          <div style={{ marginBottom: '32px' }}>
            <SectionHeader>APPEARANCE</SectionHeader>
            <div style={{ display: 'flex', gap: '12px' }}>
              {Object.keys(themes).map(name => (
                <ThemeCard key={name} name={name} active={theme === name} onSelect={setTheme} />
              ))}
            </div>
          </div>

          {/* DEFAULT GEOGRAPHY */}
          <div style={{ marginBottom: '32px' }}>
            <SectionHeader>DEFAULT GEOGRAPHY</SectionHeader>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
              Geographic scope applied to every widget on load.
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {GEO_HIERARCHY.map(geo => (
                <button
                  key={geo.key}
                  onClick={() => setActiveGeo(geo.key)}
                  style={{
                    background: activeGeo === geo.key ? 'var(--green)' : 'var(--card)',
                    border: `1px solid ${activeGeo === geo.key ? 'var(--green)' : 'var(--border)'}`,
                    borderRadius: '20px',
                    color: activeGeo === geo.key ? 'var(--nav)' : 'var(--muted)',
                    fontFamily: activeGeo === geo.key ? "'IBM Plex Mono', monospace" : "'DM Sans', sans-serif",
                    fontSize: '12px',
                    fontWeight: activeGeo === geo.key ? 700 : 500,
                    padding: '7px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >{geo.label}</button>
              ))}
            </div>
          </div>

          {/* PROFILE PRESETS */}
          <div style={{ marginBottom: '32px' }}>
            <SectionHeader>PROFILE PRESETS</SectionHeader>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
              Quickly load a curated widget layout. Replaces your current widget selection.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <ProfileCard
                name="Investor"
                icon="💰"
                description="Cash flow, BRRRR, overvaluation, appreciation, rent yield."
                active={activeProfile === 'investor'}
                onSelect={() => applyProfile('investor')}
              />
              <ProfileCard
                name="Agent"
                icon="🏠"
                description="Affordability, mortgage, DOM, list/sale ratio, comps."
                active={activeProfile === 'agent'}
                onSelect={() => applyProfile('agent')}
              />
              <ProfileCard
                name="Default"
                icon="📊"
                description="Balanced mix of market signals, forecasting, and investment."
                active={activeProfile === 'default'}
                onSelect={() => applyProfile('default')}
              />
            </div>
          </div>

          {/* DASHBOARD SECTIONS */}
          <div style={{ marginBottom: '32px' }}>
            <SectionHeader>DASHBOARD SECTIONS</SectionHeader>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
              Show or hide top-level sections of the dashboard.
            </p>
            {topPanels.map(p => (
              <Row
                key={p.id}
                label={p.label}
                sublabel={p.id === 'main-chart' ? 'TradingView line/bar/candle chart' : 'iPhone-style draggable metric cards'}
                dim={!p.visible}
                right={<Toggle on={p.visible} onClick={() => setTopPanels(prev => prev.map(x => x.id === p.id ? { ...x, visible: !x.visible } : x))} />}
              />
            ))}
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px',
              color: 'var(--dim)', marginTop: '8px', letterSpacing: '0.05em',
            }}>Market Score and Fed Calendar are now toggled in the Market Intelligence Widgets section below.</p>
          </div>

          {/* MARKET INTELLIGENCE WIDGETS */}
          <div style={{ marginBottom: '32px' }}>
            <SectionHeader
              action={
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px',
                  color: 'var(--dim)', letterSpacing: '0.06em',
                }}>{enabledCount}/{totalBuilt} ACTIVE</span>
              }
            >MARKET INTELLIGENCE WIDGETS</SectionHeader>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>
              Toggle any widget on or off. Drag to reorder them directly on the dashboard.
            </p>

            {categoryOrder.map(cat => {
              const list = widgetsByCategory[cat]
              if (!list || list.length === 0) return null
              return (
                <div key={cat} style={{ marginBottom: '20px' }}>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 700,
                    color: 'var(--text)', marginBottom: '8px',
                  }}>{CATEGORY_LABELS[cat]}</div>
                  {list.map(w => (
                    <Row
                      key={w.id}
                      label={w.title}
                      sublabel={`${w.size} · ${w.built ? 'available' : 'coming soon'}`}
                      dim={!w.enabled}
                      badge={!w.built && (
                        <span style={{
                          fontFamily: "'IBM Plex Mono', monospace", fontSize: '8px',
                          background: 'rgba(245,200,66,0.12)',
                          color: 'var(--yellow)',
                          border: '1px solid rgba(245,200,66,0.3)',
                          borderRadius: '10px', padding: '1px 7px',
                          letterSpacing: '0.06em',
                        }}>SOON</span>
                      )}
                      right={<Toggle on={w.enabled} onClick={() => toggleWidget(w.id)} />}
                    />
                  ))}
                </div>
              )
            })}
          </div>

          {/* LAYOUT MANAGEMENT */}
          <div style={{ marginBottom: '32px' }}>
            <SectionHeader>LAYOUT MANAGEMENT</SectionHeader>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
              Export or restore your full dashboard configuration.
            </p>
            <div style={{
              display: 'flex', gap: '8px', flexWrap: 'wrap',
              padding: '14px', background: 'var(--card)',
              border: '1px solid var(--border)', borderRadius: '10px',
            }}>
              <Button onClick={exportLayout}>Export layout (.json)</Button>
              <Button onClick={handleImportClick}>Import layout</Button>
              <Button onClick={resetAll} variant="danger">Reset to defaults</Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Done */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', paddingBottom: '24px' }}>
            <Button onClick={() => onNavigate('dashboard')} variant="primary">Back to Dashboard</Button>
          </div>

        </div>
      </div>
    </div>
  )
}
