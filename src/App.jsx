import { useEffect, useState } from 'react'
import { applyTheme } from './theme'
import { SNAPSHOT_CARDS } from './mockData'
import { GeoProvider } from './context/GeoContext'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import ReportsPage from './pages/ReportsPage'

const DEFAULT_TOP_PANELS = [
  { id: 'main-chart',     label: 'Main Chart',     visible: true },
  { id: 'snapshot-cards', label: 'Snapshot Cards', visible: true },
]

const DEFAULT_METRICS = SNAPSHOT_CARDS.map(c => ({
  id: c.label.toLowerCase().replace(/[\s/]+/g, '-'),
  label: c.label,
  enabled: true,
}))

function load(key, def) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : def
  } catch { return def }
}

export default function App() {
  const [page,         setPage]        = useState('dashboard')
  const [theme,        setTheme]       = useState(localStorage.getItem('vis-theme') || 'charcoal')
  const [editMode,     setEditMode]    = useState(false)
  const [topPanels,    setTopPanels]   = useState(() => load('vis-top-panels',    DEFAULT_TOP_PANELS))
  const [metrics,      setMetrics]     = useState(() => load('vis-metrics',       DEFAULT_METRICS))

  useEffect(() => { applyTheme(theme) }, [theme])
  useEffect(() => { localStorage.setItem('vis-top-panels', JSON.stringify(topPanels)) }, [topPanels])
  useEffect(() => { localStorage.setItem('vis-metrics',    JSON.stringify(metrics))   }, [metrics])

  function handleTheme(name) {
    setTheme(name)
    applyTheme(name)
    localStorage.setItem('vis-theme', name)
  }

  if (page === 'reports') {
    return (
      <GeoProvider>
        <ReportsPage onNavigate={setPage} />
      </GeoProvider>
    )
  }

  if (page === 'settings') {
    return (
      <GeoProvider>
        <Settings
          theme={theme}
          setTheme={handleTheme}
          topPanels={topPanels}
          setTopPanels={setTopPanels}
          metrics={metrics}
          setMetrics={setMetrics}
          onNavigate={setPage}
        />
      </GeoProvider>
    )
  }

  return (
    <GeoProvider>
      <Dashboard
        metrics={metrics}
        topPanels={topPanels}
        setTopPanels={setTopPanels}
        editMode={editMode}
        setEditMode={setEditMode}
        onNavigate={setPage}
      />
    </GeoProvider>
  )
}
