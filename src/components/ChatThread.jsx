import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage.jsx";
import TypingIndicator from "./TypingIndicator.jsx";

function PageTitle({ session }) {
  if (!session?.name) return null;
  const date = session.createdAt
    ? new Date(session.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 18,
          fontWeight: 700,
          color: "var(--white)",
          marginBottom: 3,
          letterSpacing: "-0.01em",
        }}
      >
        {session.name}
      </div>
      {date && (
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            color: "var(--muted)",
          }}
        >
          Started {date}
        </div>
      )}
    </div>
  );
}

function ChatThread({ messages, typing, onGenerateReport, session }) {
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, typing]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px 32px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 820,
          margin: "0 auto",
        }}
      >
        <PageTitle session={session} />
        {messages.map((m) => (
          <ChatMessage
            key={m.id}
            role={m.role}
            content={m.content}
            cardType={m.cardType}
            cardData={m.cardData}
            showButton={m.showButton}
            createdAt={m.createdAt}
            onGenerateReport={onGenerateReport}
          />
        ))}
        {typing && <TypingIndicator />}
        <div ref={endRef} />
      </div>
    </div>
  );
}

export default ChatThread;
