import { useState, useEffect, useRef } from "react";
import { loadTemplates } from "../utils/useTemplates.js";

function TemplatePicker({ reportType, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const ref = useRef();

  useEffect(() => {
    setTemplates(loadTemplates().filter(t => t.reportType === reportType));
  }, [reportType, open]);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (templates.length === 0) return null;

  const label = selected ? selected.name : "Default";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ height: 30, padding: "0 12px", display: "inline-flex", alignItems: "center", gap: 6, background: selected ? "rgba(218,107,58,0.1)" : "var(--card)", border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`, borderRadius: 7, fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: selected ? "var(--accent)" : "var(--muted-soft)", cursor: "pointer", transition: "all 0.15s" }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>Template:</span>
        {label}
        <span style={{ fontSize: 10, color: "var(--muted)" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, minWidth: 200, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", zIndex: 50, overflow: "hidden" }}>
          <button
            onClick={() => { onSelect(null); setOpen(false); }}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", background: !selected ? "var(--border-soft)" : "transparent", border: "none", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: !selected ? 700 : 400, color: !selected ? "var(--white)" : "var(--text)", cursor: "pointer" }}
          >
            Default
          </button>
          {templates.map(t => (
            <button
              key={t.id}
              onClick={() => { onSelect(t); setOpen(false); }}
              style={{ width: "100%", textAlign: "left", padding: "10px 14px", background: selected?.id === t.id ? "var(--border-soft)" : "transparent", border: "none", borderTop: "1px solid var(--border)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: selected?.id === t.id ? 700 : 400, color: selected?.id === t.id ? "var(--white)" : "var(--text)", cursor: "pointer" }}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default TemplatePicker;
