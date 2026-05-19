import { useState, useEffect } from 'react'
import { ALL_WIDGETS } from '../data/widgetConfig'
import { DEFAULT_LAYOUT } from '../data/defaultLayouts'

function buildDefaultState(layout) {
  const enabledSet = new Set(layout)
  return ALL_WIDGETS.map((w, i) => ({
    ...w,
    enabled: enabledSet.has(w.id),
    order: layout.indexOf(w.id) >= 0 ? layout.indexOf(w.id) : layout.length + i,
  })).sort((a, b) => a.order - b.order)
}

export function useWidgetConfig() {
  const [widgets, setWidgets] = useState(() => {
    try {
      const saved = localStorage.getItem('vis-widgets')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Merge any new widgets added since last save
        const savedIds = new Set(parsed.map(w => w.id))
        const newWidgets = ALL_WIDGETS.filter(w => !savedIds.has(w.id)).map((w, i) => ({
          ...w, enabled: false, order: parsed.length + i,
        }))
        return [...parsed, ...newWidgets]
      }
    } catch {}
    return buildDefaultState(DEFAULT_LAYOUT)
  })

  useEffect(() => {
    localStorage.setItem('vis-widgets', JSON.stringify(widgets))
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
    setWidgets(buildDefaultState(layout))
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
      try { setWidgets(JSON.parse(e.target.result)) } catch {}
    }
    reader.readAsText(file)
  }

  const enabledWidgets = widgets.filter(w => w.enabled).sort((a, b) => a.order - b.order)

  return { widgets, enabledWidgets, toggle, reorder, loadLayout, exportLayout, importLayout }
}
