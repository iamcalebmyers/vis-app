const STORAGE_KEY = "vis-sessions";
const MAX_NAME_LENGTH = 40;

function safeRead() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // localStorage may be full or blocked; fail silently
  }
}

export function loadSessions() {
  return safeRead().sort(
    (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0),
  );
}

export function getSession(id) {
  return safeRead().find((s) => s.id === id) || null;
}

export function saveSession(session) {
  if (!session?.id) return;
  const sessions = safeRead();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.push(session);
  }
  safeWrite(sessions);
}

export function deleteSession(id) {
  const sessions = safeRead().filter((s) => s.id !== id);
  safeWrite(sessions);
}

export function makeSessionName(firstUserMessage) {
  if (!firstUserMessage) return "New chat";
  const trimmed = firstUserMessage.trim().replace(/\s+/g, " ");
  if (trimmed.length <= MAX_NAME_LENGTH) return trimmed;
  return trimmed.slice(0, MAX_NAME_LENGTH).trim() + "…";
}
