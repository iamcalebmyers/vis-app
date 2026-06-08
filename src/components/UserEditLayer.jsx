import { useState } from "react";

const INPUT = {
  background: "transparent",
  border: "none",
  borderBottom: "1px solid transparent",
  outline: "none",
  padding: "2px 0",
  transition: "border-color 0.15s ease",
};

function UserFactRow({ fact, onChange, onDelete }) {
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "0.5px solid var(--border)" }}
    >
      <input
        placeholder="Label"
        value={fact.label}
        onChange={e => onChange(fact.id, e.target.value, fact.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...INPUT, fontFamily: "Arial, sans-serif", fontSize: 12, color: "var(--muted-soft)", width: 160, borderBottomColor: focused ? "var(--accent)" : "transparent" }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--accent)", background: "var(--accent-soft)", borderRadius: 3, padding: "1px 5px", flexShrink: 0 }}>added by you</span>
        <input
          placeholder="Value"
          value={fact.value}
          onChange={e => onChange(fact.id, fact.label, e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...INPUT, fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--text)", textAlign: "right", width: 140, borderBottomColor: focused ? "var(--accent)" : "transparent" }}
        />
        <button
          type="button"
          onClick={() => onDelete(fact.id)}
          aria-label="Remove"
          style={{ opacity: hover ? 1 : 0, transition: "opacity 0.1s ease", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 16, padding: 0, lineHeight: 1, flexShrink: 0 }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

function UserEditLayer({ facts, onAdd, onChange, onDelete }) {
  return (
    <section style={{ marginTop: 24 }}>
      <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", borderBottom: "2px solid var(--white)", paddingBottom: 6, marginBottom: 6 }}>
        Your notes & corrections
      </div>
      {facts.map(fact => (
        <UserFactRow key={fact.id} fact={fact} onChange={onChange} onDelete={onDelete} />
      ))}
      <button
        type="button"
        onClick={onAdd}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", marginTop: 10, padding: "8px 0", background: "transparent", border: "1.5px dashed var(--border)", borderRadius: 7, fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--muted)", cursor: "pointer", transition: "color 0.15s ease, border-color 0.15s ease" }}
        onMouseEnter={e => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
      >
        + Add a fact or note
      </button>
    </section>
  );
}

export default UserEditLayer;
