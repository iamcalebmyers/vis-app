import { useState, useEffect } from 'react'
import { ALL_WIDGETS } from '../data/widgetConfig'
import { DEFAULT_LAYOUT } from '../data/defaultLayouts'

// Build the in-memory widget list by merging fresh metadata from ALL_WIDGETS
// with just the user-mutable state (enabled, order) from localStorage. This
// ensures that adding a new field like `source` to widgetConfig.js takes
// effect for users who already have a saved layout, instead of being shadowed
// by stale objects in localStorage.
function buildState(saved) {
  const savedById = saved
    ? Object.fromEntries(saved.map(w => [w.id, w]))
    : {}

  return ALL_WIDGETS.map((w, i) => {
    const s = savedById[w.id]
    if (s) {
      return {
        ...w,                              // fresh metadata (title, source, built, …)
        enabled: !!s.enabled,
        order:   typeof s.order === 'number' ? s.order : i,
      }
    }
    const layoutIdx = DEFAULT_LAYOUT.indexOf(w.id)
    return {
      ...w,
      enabled: layoutIdx >= 0,
      order:   layoutIdx >= 0 ? layoutIdx : DEFAULT_LAYOUT.length + i,
    }
  }).sort((a, b) => a.order - b.order)
}

export function useWidgetConfig() {
  const [widgets, setWidgets] = useState(() => {
    try {
      const raw = localStorage.getItem('vis-widgets')
      const parsed = raw ? JSON.parse(raw) : null
      return buildState(Array.isArray(parsed) ? parsed : null)
    } catch {
      return buildState(null)
    }
  })

  // Persist only user-mutable state. Metadata always comes from the code.
  useEffect(() => {
    const minimal = widgets.map(w => ({ id: w.id, enabled: w.enabled, order: w.order }))
    localStorage.setItem('vis-widgets', JSON.stringify(minimal))
  }, [widgets])

  function toggle(id) {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w))
  }

  function reorder(orderedIds) {
    setWidgets(prev => {
      const map = Object.fromEntries(prev.map(w => [w.id, w]))
      return orderedIds.map((id, i) => ({ ...map[id], order: i }))
        .concat(prev.filter(w => !orderedIds.includes(w.id)))
    })
  }

  function loadLayout(layout) {
    setWidgets(ALL_WIDGETS.map((w, i) => {
      const layoutIdx = layout.indexOf(w.id)
      return {
        ...w,
        enabled: layoutIdx >= 0,
        order:   layoutIdx >= 0 ? layoutIdx : layout.length + i,
      }
    }).sort((a, b) => a.order - b.order))
  }

  function exportLayout() {
    const data = JSON.stringify(widgets, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'vis-layout.json'; a.click()
    URL.revokeObjectURL(url)
  }

  function importLayout(file) {
    const reader = new FileReader()
    reader.onload = e => {
      try { setWidgets(buildState(JSON.parse(e.target.result))) } catch {}
    }
    reader.readAsText(file)
  }

  const enabledWidgets = widgets.filter(w => w.enabled).sort((a, b) => a.order - b.order)

  return { widgets, enabledWidgets, toggle, reorder, loadLayout, exportLayout, importLayout }
}
