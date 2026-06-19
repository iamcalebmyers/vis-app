import { useState } from "react";

const SIDEBAR_WIDTH = 220;

function NewChatButton({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        marginTop: 8,
        padding: "7px 10px",
        background: "transparent",
        border: `1.5px dashed ${hover ? "var(--accent)" : "var(--muted-faint)"}`,
        borderRadius: 6,
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        color: hover ? "var(--accent)" : "var(--muted)",
        cursor: "pointer",
        textAlign: "left",
        transition: "color 0.12s ease, border-color 0.12s ease",
      }}
    >
      + New chat
    </button>
  );
}

function SessionItem({ session, isActive, onClick }) {
  const [hover, setHover] = useState(false);

  const background = isActive
    ? "var(--border-soft)"
    : hover
      ? "var(--border-soft)"
      : "transparent";

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "8px 10px",
        background,
        border: "none",
        borderRadius: 8,
        textAlign: "left",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        fontWeight: isActive ? 600 : 500,
        color: isActive ? "var(--accent)" : "var(--muted-soft)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        transition: "background 0.12s ease, border-color 0.12s ease, color 0.12s ease",
      }}
    >
      {session.name || "New chat"}
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
        background: "var(--card)",
        borderRight: "1px solid var(--border)",
        padding: "16px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--muted-faint)",
          letterSpacing: "0.08em",
          padding: "4px 8px",
          marginBottom: 4,
          textTransform: "uppercase",
        }}
      >
        Recent chats
      </div>

      {sessions.length === 0 ? (
        <p
          style={{
            padding: "12px 8px",
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

      <NewChatButton onClick={onNew} />
    </aside>
  );
}

export default SessionSidebar;
