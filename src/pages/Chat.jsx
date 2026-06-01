import { useState } from "react";
import Nav from "../components/Nav.jsx";
import ChatThread from "../components/ChatThread.jsx";
import ChatInput from "../components/ChatInput.jsx";
import { sendMessage } from "../utils/claudeApi.js";

const NAV_HEIGHT = 48;

function Hero() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          aria-hidden="true"
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "var(--accent)",
            color: "#ffffff",
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          V
        </span>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 800,
            fontSize: 36,
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
              fontSize: 12,
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
          fontSize: 16,
        }}
      >
        See the market clearly
      </p>
    </div>
  );
}

function toApiMessages(messages) {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}

function Chat() {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const hasContent = messages.length > 0 || typing;

  async function handleSend(text) {
    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setTyping(true);

    try {
      const reply = await sendMessage(toApiMessages(next));
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "ai", content: reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "ai",
          content: `Sorry — something went wrong reaching the server.\n\n${err?.message || "Unknown error"}`,
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--bg)",
      }}
    >
      <Nav active="chat" />

      {hasContent ? (
        <>
          <ChatThread messages={messages} typing={typing} />
          <ChatInput onSend={handleSend} disabled={typing} />
        </>
      ) : (
        <div
          style={{
            flex: 1,
            minHeight: `calc(100vh - ${NAV_HEIGHT}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 32,
            padding: "40px 0",
          }}
        >
          <Hero />
          <div style={{ width: "100%", maxWidth: 760 }}>
            <ChatInput onSend={handleSend} disabled={false} inline />
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
