import DataCard from "./DataCard.jsx";

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

function ChatMessage({
  role,
  content,
  text,
  cardType,
  cardData,
  showButton,
  onGenerateReport,
}) {
  const isUser = role === "user";
  const body = text ?? content ?? "";
  const hasCard = !isUser && Boolean(cardType);

  const bubble = (
    <div
      style={{
        maxWidth: hasCard ? "90%" : "75%",
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
      {body}
      {hasCard && (
        <DataCard
          type={cardType}
          data={cardData}
          showButton={showButton}
          onGenerateReport={onGenerateReport}
        />
      )}
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
