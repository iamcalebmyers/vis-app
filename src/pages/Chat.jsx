import { useState } from "react";
import Nav from "../components/Nav.jsx";
import ChatThread from "../components/ChatThread.jsx";
import ChatInput from "../components/ChatInput.jsx";

const STUB_REPLY =
  "Hi — I'm Vis. The AI isn't wired up yet (Session 3). For now this is the chat shell so you can see the bubbles, typing dots, and input bar working.";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);

  function handleSend(text) {
    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "ai",
          content: STUB_REPLY,
        },
      ]);
      setTyping(false);
    }, 1200);
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
      <ChatThread messages={messages} typing={typing} />
      <ChatInput onSend={handleSend} disabled={typing} />
    </div>
  );
}

export default Chat;
