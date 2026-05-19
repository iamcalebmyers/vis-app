export const themes = {
  charcoal: {
    '--bg':     '#141416',
    '--nav':    '#1c1c1f',
    '--card':   '#212124',
    '--border': '#28282d',
    '--text':   '#f5f5f5',
    '--muted':  '#666666',
    '--dim':    '#4a4a52',
    '--green':  '#00e87a',
    '--red':    '#f0455a',
    '--yellow': '#f5c842',
  },
  black: {
    '--bg':     '#0a0a0a',
    '--nav':    '#111111',
    '--card':   '#141414',
    '--border': '#1f1f1f',
    '--text':   '#ffffff',
    '--muted':  '#555555',
    '--dim':    '#444444',
    '--green':  '#00e87a',
    '--red':    '#f0455a',
    '--yellow': '#f5c842',
  },
  light: {
    '--bg':     '#f4f4f4',
    '--nav':    '#ffffff',
    '--card':   '#ffffff',
    '--border': '#e5e5e5',
    '--text':   '#111111',
    '--muted':  '#999999',
    '--dim':    '#bbbbbb',
    '--green':  '#00c968',
    '--red':    '#e03a50',
    '--yellow': '#d4a000',
  },
}

export function applyTheme(name) {
  const theme = themes[name] || themes.charcoal
  const root = document.documentElement
  Object.entries(theme).forEach(([key, val]) => {
    root.style.setProperty(key, val)
  })
  localStorage.setItem('vis-theme', name)
}
