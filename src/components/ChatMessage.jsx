function AiAvatar() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        background: "var(--accent)",
        color: "#ffffff",
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--font-mono)",
        fontWeight: 700,
        fontSize: 13,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      V
    </span>
  );
}

function ChatMessage({ role, content }) {
  const isUser = role === "user";

  const bubble = (
    <div
      style={{
        maxWidth: "75%",
        padding: "10px 14px",
        background: isUser ? "var(--accent)" : "var(--card)",
        color: isUser ? "#ffffff" : "var(--text)",
        borderRadius: isUser ? "10px 0 10px 10px" : "0 10px 10px 10px",
        fontFamily: "var(--font-sans)",
        fontSize: 15,
        fontWeight: 400,
        lineHeight: 1.5,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {content}
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        alignItems: "flex-end",
        gap: 8,
        margin: "8px 0",
      }}
    >
      {!isUser && <AiAvatar />}
      {bubble}
    </div>
  );
}

export default ChatMessage;
