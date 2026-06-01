import { useState } from "react";

function ChatInput({ onSend, disabled = false }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "var(--bg)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 760,
          margin: "0 auto",
          padding: "12px 20px 20px 20px",
          display: "flex",
          gap: 8,
          alignItems: "stretch",
          background: "var(--card)",
          borderRadius: 12,
          marginTop: -12,
          marginBottom: 16,
        }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask anything about real estate..."
          disabled={disabled}
          aria-label="Chat message"
          style={{
            flex: 1,
            height: 40,
            padding: "0 14px",
            background: "var(--bg)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontFamily: "var(--font-sans)",
            fontSize: 15,
            outline: "none",
            transition: "border-color 0.15s ease",
          }}
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          style={{
            height: 40,
            padding: "0 18px",
            background: "var(--accent)",
            color: "#ffffff",
            border: "none",
            borderRadius: 8,
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            fontWeight: 700,
            cursor: disabled || !value.trim() ? "not-allowed" : "pointer",
            opacity: disabled || !value.trim() ? 0.5 : 1,
            transition: "opacity 0.15s ease",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatInput;
