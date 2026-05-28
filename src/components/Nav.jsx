import GeoSearch from './navigation/GeoSearch'

const NAV_TABS = ['Dashboard', 'Reports', 'Markets', 'Rates', 'Property Search']

function DocIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="13" y2="17"/>
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}

export default function Nav({ page = 'dashboard', onNavigate, editMode, onToggleEdit }) {
  return (
    <nav style={{
      background: 'var(--nav)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'var(--green)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: '13px', color: '#000', lineHeight: 1 }}>V</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '16px', color: 'var(--text)' }}>vis</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: 'var(--dim)', marginLeft: '2px' }}>.realestate</span>
        </div>
      </div>

      {/* Nav Tabs */}
      <div style={{ display: 'flex', alignItems: 'stretch', height: '100%', gap: '4px' }}>
        {NAV_TABS.map(tab => {
          const active =
            (tab === 'Dashboard' && page === 'dashboard') ||
            (tab === 'Reports'   && page === 'reports')
          const clickable = tab === 'Dashboard' || tab === 'Reports'
          return (
            <button
              key={tab}
              onClick={() => {
                if (tab === 'Dashboard') onNavigate?.('dashboard')
                else if (tab === 'Reports') onNavigate?.('reports')
              }}
              style={{
                background: 'none', border: 'none',
                borderBottom: active ? '2px solid var(--green)' : '2px solid transparent',
                color: active ? 'var(--text)' : 'var(--muted)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px', fontWeight: active ? 600 : 400,
                padding: '0 14px',
                cursor: clickable ? 'pointer' : 'default',
                transition: 'color 0.15s, border-color 0.15s',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}
            >
              {tab === 'Reports' && <DocIcon />}
              {tab}
            </button>
          )
        })}
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <GeoSearch />

        {page === 'dashboard' && (
          <button
            onClick={onToggleEdit}
            style={{
              background: editMode ? 'var(--green)' : 'var(--card)',
              border: `1px solid ${editMode ? 'var(--green)' : 'var(--border)'}`,
              borderRadius: '6px',
              color: editMode ? 'var(--nav)' : 'var(--muted)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px',
              fontWeight: editMode ? 700 : 600,
              padding: '4px 11px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >{editMode ? 'Done' : 'Edit Layout'}</button>
        )}

        <button
          onClick={() => onNavigate?.(page === 'settings' ? 'dashboard' : 'settings')}
          style={{
            background: page === 'settings' ? 'rgba(0, 232, 122, 0.12)' : 'transparent',
            border: `1px solid ${page === 'settings' ? 'rgba(0,232,122,0.5)' : 'transparent'}`,
            borderRadius: '6px',
            color: page === 'settings' ? 'var(--green)' : 'var(--muted)',
            padding: '4px 7px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            transition: 'all 0.15s',
          }}
          title="Settings"
        >
          <GearIcon />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green)', animation: 'livePulse 2s ease-in-out infinite' }} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', fontWeight: 700, color: 'var(--green)', letterSpacing: '0.1em' }}>LIVE</span>
        </div>
      </div>
    </nav>
  )
}
