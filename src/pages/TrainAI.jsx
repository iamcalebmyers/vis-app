import { useState, useEffect, useRef } from "react";
import { supabase } from "../utils/supabase.js";
import { hasFeature } from "../utils/tier.js";
import { extractText } from "../utils/docExtractor.js";

const TEXT_LIMIT = 5000;
const DOC_LIMIT = 10000;
const SAMPLE_Q = "Introduce yourself and briefly tell me what you know about buying a home in today's market.";

const TEXTAREA = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 14px",
  background: "var(--border-soft)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontFamily: "var(--font-sans)",
  fontSize: 14,
  color: "var(--text)",
  outline: "none",
  resize: "vertical",
  lineHeight: 1.6,
};

const BTN = (active, saved) => ({
  height: 36,
  padding: "0 16px",
  borderRadius: 7,
  background: saved ? "#16a34a" : "var(--accent)",
  border: "none",
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  fontWeight: 600,
  color: "#fff",
  cursor: active ? "not-allowed" : "pointer",
  opacity: active ? 0.7 : 1,
  transition: "background 0.2s",
});

function Counter({ n, limit }) {
  const pct = n / limit;
  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: pct >= 1 ? "#dc2626" : pct >= 0.8 ? "#f59e0b" : "var(--muted-faint)" }}>
      {n.toLocaleString()} / {limit.toLocaleString()}
    </span>
  );
}

function SectionLabel({ label, counter }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
      <label style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>{label}</label>
      {counter}
    </div>
  );
}

function TrainAI({ user, userRow }) {
  const tier = userRow?.tier || "solo";
  const canAccess = hasFeature(tier, "agent");

  const [hasProfile, setHasProfile] = useState(false);
  const [trainingText, setTrainingText] = useState("");
  const [docText, setDocText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState(null);
  const [savingText, setSavingText] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);
  const [savedText, setSavedText] = useState(false);
  const [savedDoc, setSavedDoc] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (!canAccess || !user?.id) return;
    supabase.from("agent_profiles").select("training_text, training_doc_text").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setHasProfile(true);
          setTrainingText(data.training_text || "");
          setDocText(data.training_doc_text || "");
        }
      });
  }, [user?.id, canAccess]);

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setExtractError("File must be under 5MB."); return; }
    setExtracting(true);
    setExtractError(null);
    try {
      const text = await extractText(file);
      setDocText(text.slice(0, DOC_LIMIT));
    } catch (err) {
      setExtractError(err.message);
    } finally {
      setExtracting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function saveField(field, value, setSaving, setSaved) {
    setSaving(true);
    setSaveError(null);
    const payload = { user_id: user.id, [field]: value };
    const { error } = hasProfile
      ? await supabase.from("agent_profiles").update(payload).eq("user_id", user.id)
      : await supabase.from("agent_profiles").insert({ user_id: user.id, training_text: trainingText, training_doc_text: docText });
    if (error) {
      setSaveError("Save failed: " + error.message);
    } else {
      if (!hasProfile) setHasProfile(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  async function handlePreview() {
    setPreviewing(true);
    setPreview(null);
    const combined = [trainingText, docText].filter(Boolean).join("\n\n").trim();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: SAMPLE_Q }],
          agentTraining: combined || null,
        }),
      });
      const data = await res.json();
      setPreview(data.reply || "No response.");
    } catch {
      setPreview("Preview failed — make sure the dev server is running.");
    } finally {
      setPreviewing(false);
    }
  }

  if (!canAccess) {
    return (
      <div style={{ maxWidth: 560, margin: "60px auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18, color: "var(--white)", marginBottom: 10 }}>Train your AI</div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
          AI training is available on the Agent plan and above.
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px 60px" }}>
      <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 20, color: "var(--white)", marginBottom: 6 }}>Train your AI</div>
      <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", marginBottom: 32, lineHeight: 1.6 }}>
        Tell your AI about your market, clients, and style. This shapes how it responds on your branded URL.
      </div>

      <div style={{ marginBottom: 32 }}>
        <SectionLabel label="Training text" counter={<Counter n={trainingText.length} limit={TEXT_LIMIT} />} />
        <textarea
          value={trainingText}
          onChange={e => setTrainingText(e.target.value.slice(0, TEXT_LIMIT))}
          placeholder="Tell your AI about your market, your clients, your preferred tone, local knowledge, anything you want it to know..."
          style={{ ...TEXTAREA, minHeight: 160 }}
        />
        <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => saveField("training_text", trainingText, setSavingText, setSavedText)} disabled={savingText} style={BTN(savingText, savedText)}>
            {savingText ? "Saving…" : savedText ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <SectionLabel label="Document upload" counter={<Counter n={docText.length} limit={DOC_LIMIT} />} />
        <div style={{ marginBottom: 10 }}>
          <button onClick={() => fileRef.current?.click()} disabled={extracting}
            style={{ height: 36, padding: "0 16px", borderRadius: 7, background: "var(--card)", border: "1px solid var(--border)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--white)", cursor: extracting ? "not-allowed" : "pointer", opacity: extracting ? 0.6 : 1 }}>
            {extracting ? "Extracting…" : "Upload PDF, DOCX, or TXT"}
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={handleFileUpload} />
        </div>
        {extractError && <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#dc2626", marginBottom: 8 }}>{extractError}</div>}
        <textarea
          value={docText}
          onChange={e => setDocText(e.target.value.slice(0, DOC_LIMIT))}
          placeholder="Extracted document text appears here. You can edit it before saving."
          style={{ ...TEXTAREA, minHeight: 120 }}
        />
        <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => saveField("training_doc_text", docText, setSavingDoc, setSavedDoc)} disabled={savingDoc} style={BTN(savingDoc, savedDoc)}>
            {savingDoc ? "Saving…" : savedDoc ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      {saveError && (
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#dc2626", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 6, padding: "8px 12px", marginBottom: 24 }}>
          {saveError}
        </div>
      )}

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 28 }}>
        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: "var(--white)", marginBottom: 6 }}>Test your AI</div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", marginBottom: 14, lineHeight: 1.5 }}>
          Preview how your training shapes the AI's response before clients see it.
        </div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted-soft)", fontStyle: "italic", marginBottom: 16, padding: "8px 12px", background: "var(--border-soft)", borderRadius: 6 }}>
          "{SAMPLE_Q}"
        </div>
        <button onClick={handlePreview} disabled={previewing}
          style={{ height: 38, padding: "0 20px", borderRadius: 7, background: "transparent", border: "1.5px solid var(--accent)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--accent)", cursor: previewing ? "not-allowed" : "pointer", opacity: previewing ? 0.7 : 1 }}>
          {previewing ? "Generating…" : "Preview AI response"}
        </button>
        {preview && (
          <div style={{ marginTop: 16, padding: 16, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>AI response</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{preview}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrainAI;
