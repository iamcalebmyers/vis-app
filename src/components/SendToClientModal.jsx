import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase.js";

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function SendToClientModal({ reportType, reportData, user, onClose }) {
  const [profile, setProfile] = useState(null);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("agent_profiles")
      .select("id, handle")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) { setLoadingClients(false); return; }
        setProfile(data);
        supabase
          .from("client_profiles")
          .select("id, name, email")
          .eq("agent_id", data.id)
          .order("created_at", { ascending: false })
          .then(({ data: c }) => {
            setClients(c || []);
            if (c?.length === 1) setSelectedId(c[0].id);
            setLoadingClients(false);
          });
      });
  }, [user?.id]);

  async function handleSend() {
    if (!profile || !selectedId) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType,
          reportData,
          agentProfileId: profile.id,
          clientId: selectedId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send.");
      const client = clients.find(c => c.id === selectedId);
      setResult({ url: json.url, client });
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  function handleCopy() {
    copyToClipboard(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleMailto() {
    const label = reportType === "property" ? "Property Report" : reportType === "market" ? "Market Report" : "Investor Report";
    const subject = encodeURIComponent(`Your ${label}`);
    const body = encodeURIComponent(`Hi${result.client?.name ? ` ${result.client.name}` : ""},\n\nI've put together a report for you. You can view it here:\n\n${result.url}\n\nLet me know if you have any questions.`);
    window.open(`mailto:${result.client?.email || ""}?subject=${subject}&body=${body}`);
  }

  const OVERLAY = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 };
  const MODAL = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, width: 440, maxWidth: "100%", display: "flex", flexDirection: "column", gap: 0, overflow: "hidden" };
  const HEADER = { padding: "22px 24px 16px", borderBottom: "1px solid var(--border)" };
  const BODY = { padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 };
  const FOOTER = { padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" };

  return (
    <div style={OVERLAY} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={MODAL}>
        <div style={HEADER}>
          <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16, color: "var(--white)" }}>
            Send report to client
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            Select a client to generate a shareable report link.
          </div>
        </div>

        <div style={BODY}>
          {result ? (
            /* Confirmation state */
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px 14px", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 8 }}>
                <div style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-soft)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {result.url}
                </div>
                <button onClick={handleCopy} style={{ flexShrink: 0, height: 30, padding: "0 12px", borderRadius: 6, background: copied ? "#16a34a" : "var(--accent)", border: "none", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", transition: "background 0.2s", whiteSpace: "nowrap" }}>
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
                The link is ready — open it in your email to send it to {result.client?.name || result.client?.email || "the client"}.
              </div>
              <button onClick={handleMailto} style={{ height: 42, borderRadius: 8, background: "var(--accent)", border: "none", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", opacity: 1, transition: "opacity 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                Open in email app
              </button>
            </div>
          ) : loadingClients ? (
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", padding: "8px 0" }}>Loading clients…</div>
          ) : !profile ? (
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", padding: "8px 0" }}>Complete your profile setup first.</div>
          ) : clients.length === 0 ? (
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", padding: "8px 0" }}>
              No clients yet — invite clients from Settings → Clients.
            </div>
          ) : (
            /* Client picker */
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Choose a client</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflowY: "auto" }}>
                {clients.map(c => {
                  const selected = selectedId === c.id;
                  return (
                    <div key={c.id} onClick={() => setSelectedId(c.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: selected ? "var(--accent-soft)" : "var(--border-soft)", border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`, borderRadius: 8, cursor: "pointer", transition: "border-color 0.15s, background 0.15s" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: selected ? "var(--accent)" : "var(--border)", display: "grid", placeItems: "center", flexShrink: 0, transition: "background 0.15s" }}>
                        <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 13, color: selected ? "#fff" : "var(--muted)" }}>
                          {(c.name || c.email)[0].toUpperCase()}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {c.name && <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--white)", marginBottom: 1 }}>{c.name}</div>}
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</div>
                      </div>
                      {selected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />}
                    </div>
                  );
                })}
              </div>
              {error && <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#dc2626" }}>{error}</div>}
            </div>
          )}
        </div>

        <div style={FOOTER}>
          <button onClick={onClose} style={{ height: 38, padding: "0 18px", borderRadius: 8, background: "var(--border-soft)", border: "1px solid var(--border)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--muted)", cursor: "pointer" }}>
            {result ? "Done" : "Cancel"}
          </button>
          {!result && !loadingClients && clients.length > 0 && (
            <button onClick={handleSend} disabled={sending || !selectedId} style={{ height: 38, padding: "0 22px", borderRadius: 8, background: "var(--accent)", border: "none", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "#fff", cursor: sending || !selectedId ? "not-allowed" : "pointer", opacity: sending || !selectedId ? 0.55 : 1, transition: "opacity 0.15s" }}>
              {sending ? "Generating…" : "Send"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SendToClientModal;
