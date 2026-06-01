import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage.jsx";
import TypingIndicator from "./TypingIndicator.jsx";

function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: "48px 16px",
        minHeight: "60vh",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          aria-hidden="true"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--accent)",
            color: "#ffffff",
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          V
        </span>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 800,
            fontSize: 32,
            color: "var(--white)",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          vis
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 400,
              fontSize: 11,
              color: "var(--muted)",
              marginLeft: 2,
              letterSpacing: 0,
            }}
          >
            .realestate
          </span>
        </span>
      </div>
      <p
        style={{
          color: "var(--muted)",
          fontFamily: "var(--font-sans)",
          fontWeight: 400,
          fontSize: 15,
        }}
      >
        See the market clearly
      </p>
    </div>
  );
}

function ChatThread({ messages, typing }) {
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, typing]);

  const isEmpty = messages.length === 0 && !typing;

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px 20px 120px 20px",
        width: "100%",
        maxWidth: 760,
        margin: "0 auto",
      }}
    >
      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          {messages.map((m) => (
            <ChatMessage key={m.id} role={m.role} content={m.content} />
          ))}
          {typing && <TypingIndicator />}
          <div ref={endRef} />
        </>
      )}
    </div>
  );
}

export default ChatThread;
