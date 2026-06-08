const KEY = "vis-report-templates";

export function loadTemplates() {
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function saveTemplate(template) {
  const all = loadTemplates();
  const withId = { ...template, id: template.id || crypto.randomUUID(), savedAt: Date.now() };
  const idx = all.findIndex(t => t.id === withId.id);
  if (idx >= 0) all[idx] = withId; else all.unshift(withId);
  localStorage.setItem(KEY, JSON.stringify(all));
  return withId;
}

export function deleteTemplate(id) {
  const filtered = loadTemplates().filter(t => t.id !== id);
  localStorage.setItem(KEY, JSON.stringify(filtered));
}

export function sectionVisible(template, sectionId) {
  if (!template) return true;
  const s = template.sections?.find(s => s.id === sectionId);
  return s ? s.included : true;
}
