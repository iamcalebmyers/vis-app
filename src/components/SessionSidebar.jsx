import { relativeTime } from "../utils/formatters.js";

const SIDEBAR_WIDTH = 260;

function NewChatButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        height: 40,
        padding: "0 14px",
        background: "var(--accent)",
        color: "#ffffff",
        border: "none",
        borderRadius: 8,
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        transition: "opacity 0.15s ease",
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
      New chat
    </button>
  );
}

function SessionItem({ session, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: "10px 12px",
        background: isActive ? "var(--card)" : "transparent",
        color: isActive ? "var(--white)" : "var(--text)",
        border: "none",
        borderRadius: 8,
        textAlign: "left",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        transition: "background 0.15s ease",
        fontFamily: "var(--font-sans)",
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = "var(--card)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = "transparent";
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 400,
          lineHeight: 1.35,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          width: "100%",
        }}
      >
        {session.name || "New chat"}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--muted)",
          lineHeight: 1,
        }}
      >
        {relativeTime(session.updatedAt)}
      </span>
    </button>
  );
}

function SessionSidebar({ sessions, activeId, onSelect, onNew }) {
  return (
    <aside
      className="vis-sidebar"
      style={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        background: "var(--bg)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      <div
        style={{
          padding: 12,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <NewChatButton onClick={onNew} />
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 8,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {sessions.length === 0 ? (
          <p
            style={{
              padding: "12px 4px",
              color: "var(--muted)",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            Your saved chats will appear here.
          </p>
        ) : (
          sessions.map((s) => (
            <SessionItem
              key={s.id}
              session={s}
              isActive={s.id === activeId}
              onClick={() => onSelect(s.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}

export default SessionSidebar;
