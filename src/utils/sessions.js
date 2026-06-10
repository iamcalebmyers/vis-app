const STORAGE_KEY = "vis-sessions";
const MAX_NAME_LENGTH = 40;
const MAX_SESSIONS = 50;
const MAX_MESSAGES_PER_SESSION = 30;

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

function trimSession(session) {
  if (!session.messages || session.messages.length <= MAX_MESSAGES_PER_SESSION) return session;
  return { ...session, messages: session.messages.slice(-MAX_MESSAGES_PER_SESSION) };
}

function safeWrite(sessions) {
  // Keep only the most recent sessions, trimmed
  const trimmed = sessions
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, MAX_SESSIONS)
    .map(trimSession);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // If still too full, drop the oldest half and retry
    try {
      const half = trimmed.slice(0, Math.floor(MAX_SESSIONS / 2));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(half));
    } catch {}
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
