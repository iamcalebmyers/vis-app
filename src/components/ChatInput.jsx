import { useState } from "react";

function ChatInput({ onSend, disabled = false, autoFocus = true }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  }

  const trimmed = value.trim();
  const sendDisabled = disabled || !trimmed;

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        padding: 12,
        display: "flex",
        gap: 8,
        alignItems: "stretch",
        background: "var(--card)",
        border: "none",
        borderRadius: 16,
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write a message..."
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label="Chat message"
        style={{
          flex: 1,
          height: 56,
          padding: "0 14px",
          background: "var(--card)",
          color: "var(--text)",
          border: "none",
          borderRadius: 8,
          fontFamily: "var(--font-sans)",
          fontSize: 15,
          outline: "none",
        }}
      />
      <button
        type="submit"
        disabled={sendDisabled}
        aria-label="Send message"
        style={{
          minWidth: 72,
          padding: "0 18px",
          background: "var(--accent)",
          color: "#ffffff",
          border: "none",
          borderRadius: 10,
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          fontWeight: 700,
          cursor: sendDisabled ? "not-allowed" : "pointer",
          opacity: sendDisabled ? 0.5 : 1,
          transition: "opacity 0.15s ease",
        }}
      >
        Send
      </button>
    </form>
  );
}

export default ChatInput;
