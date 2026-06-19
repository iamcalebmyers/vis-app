import { useState } from "react";

const DISCLAIMER =
  "Vis uses AI and publicly available data · Not financial or legal advice";

function ChatInput({ onSend, disabled = false, autoFocus = true, showDisclaimer = true, bare = false }) {
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
    <div style={{ width: "100%" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 760,
          margin: "0 auto",
          display: "flex",
          gap: 8,
          alignItems: "stretch",
          borderRadius: 14,
          padding: "8px 8px 8px 14px",
          background: "rgba(255, 255, 255, 0.06)",
          border: bare ? "none" : "1px solid var(--composer-border)",
          boxShadow: bare ? "none" : "inset 0 1px 0 rgba(255, 255, 255, 0.12)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
        }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask anything about any property or market..."
          disabled={disabled}
          autoFocus={autoFocus}
          aria-label="Chat message"
          className="composer-input"
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            fontFamily: "var(--font-sans)",
            outline: "none",
            boxShadow: "none",
            minHeight: 36,
          }}
        />
        <button
          type="submit"
          disabled={sendDisabled}
          aria-label="Send message"
          style={{
            background: "var(--accent)",
            color: "#ffffff",
            border: "none",
            borderRadius: 7,
            padding: "8px 18px",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: 600,
            cursor: sendDisabled ? "not-allowed" : "pointer",
            opacity: sendDisabled ? 0.5 : 1,
            transition: "opacity 0.15s ease",
          }}
        >
          Send
        </button>
      </form>
      {showDisclaimer && (
        <div
          style={{
            width: "100%",
            maxWidth: 760,
            margin: "7px auto 0",
            textAlign: "center",
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            color: "var(--muted-faint)",
          }}
        >
          {DISCLAIMER}
        </div>
      )}
    </div>
  );
}

export default ChatInput;
