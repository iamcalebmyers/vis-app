import { useEffect, useState } from "react";
import Nav from "../components/Nav.jsx";
import ChatThread from "../components/ChatThread.jsx";
import ChatInput from "../components/ChatInput.jsx";
import SessionSidebar from "../components/SessionSidebar.jsx";
import { sendMessage } from "../utils/claudeApi.js";
import {
  loadSessions,
  saveSession,
  makeSessionName,
} from "../utils/sessions.js";

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
  const [sessions, setSessions] = useState(() => loadSessions());
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);

  const hasContent = messages.length > 0 || typing;

  useEffect(() => {
    if (!activeSession || messages.length === 0) return;
    const updated = {
      ...activeSession,
      messages,
      updatedAt: Date.now(),
    };
    saveSession(updated);
    setSessions(loadSessions());
  }, [activeSession, messages]);

  function handleNewChat() {
    setActiveSession(null);
    setMessages([]);
    setTyping(false);
  }

  function handleSelectSession(id) {
    const found = sessions.find((s) => s.id === id);
    if (!found) return;
    setActiveSession({
      id: found.id,
      name: found.name,
      createdAt: found.createdAt,
    });
    setMessages(found.messages || []);
    setTyping(false);
  }

  async function handleSend(text) {
    let session = activeSession;
    if (!session) {
      session = {
        id: crypto.randomUUID(),
        name: makeSessionName(text),
        createdAt: Date.now(),
      };
      setActiveSession(session);
    }

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
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <SessionSidebar
        sessions={sessions}
        activeId={activeSession?.id || null}
        onSelect={handleSelectSession}
        onNew={handleNewChat}
      />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Nav active="chat" />

        {hasContent ? (
          <>
            <ChatThread messages={messages} typing={typing} />
            <div style={{ padding: "12px 20px 20px", background: "var(--bg)" }}>
              <ChatInput
                onSend={handleSend}
                disabled={typing}
                autoFocus={false}
              />
            </div>
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
              padding: "40px 20px",
            }}
          >
            <Hero />
            <div style={{ width: "100%", maxWidth: 760 }}>
              <ChatInput onSend={handleSend} disabled={false} autoFocus />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
