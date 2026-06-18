import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase.js";
import { hasFeature } from "../utils/tier.js";

const AGENT_W = 196;
const CLIENT_W = 152;
const CLIENT_GAP = 10;
const AGENT_GAP = 28;
const LINE = "var(--border)";

/* ─── Primitives ─── */
function Avatar({ name, size = 32, bg = "var(--accent-soft)", color = "var(--accent)", logoUrl }) {
  if (logoUrl) {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", border: `1.5px solid ${color}`, overflow: "hidden", flexShrink: 0 }}>
        <img src={logoUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, border: `1.5px solid ${color}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
      <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: Math.round(size * 0.38), color }}>
        {(name || "?")[0].toUpperCase()}
      </span>
    </div>
  );
}

function Stem({ h = 28 }) {
  return <div style={{ width: 2, height: h, background: LINE, flexShrink: 0 }} />;
}

/* Horizontal connector spanning center-of-first to center-of-last child */
function Branch({ items, getWidth, gap, renderItem }) {
  if (!items.length) return null;
  const colWidths = items.map(getWidth);
  const totalW = colWidths.reduce((s, w) => s + w, 0) + (items.length - 1) * gap;
  const lineLeft = colWidths[0] / 2;
  const lineRight = colWidths[colWidths.length - 1] / 2;
  return (
    <div style={{ width: totalW, position: "relative", flexShrink: 0 }}>
      {items.length > 1 && (
        <div style={{ position: "absolute", top: 0, left: lineLeft, right: lineRight, height: 2, background: LINE }} />
      )}
      <div style={{ display: "flex", gap }}>
        {items.map((item, i) => (
          <div key={item.id ?? i} style={{ width: colWidths[i], flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Stem />
            {renderItem(item, i)}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Node cards ─── */
function RootCard({ name, sub, logoUrl }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "14px 22px", background: "var(--card)", border: `2px solid var(--accent)`, borderRadius: 12 }}>
      <Avatar name={name} size={44} bg="var(--accent-soft)" color="var(--accent)" logoUrl={logoUrl} />
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16, color: "var(--white)" }}>{name}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--accent)", background: "var(--accent-soft)", borderRadius: 4, padding: "2px 6px", letterSpacing: "0.08em" }}>ADMIN</span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{sub}</div>
      </div>
    </div>
  );
}

function AgentCard({ agent, clientCount, onInvite, active }) {
  return (
    <div style={{ width: AGENT_W, padding: "12px 14px", background: "var(--card)", border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`, borderRadius: 10, boxShadow: active ? "0 0 0 3px var(--accent-soft)" : "none", transition: "border-color 0.15s, box-shadow 0.15s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <Avatar name={agent.ai_name || agent.handle} size={32} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, color: "var(--white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.ai_name || "(no name)"}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>@{agent.handle}</div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)" }}>{clientCount} {clientCount === 1 ? "client" : "clients"}</span>
        <button onClick={onInvite} style={{ height: 26, padding: "0 10px", borderRadius: 6, background: active ? "var(--accent)" : "var(--accent-soft)", border: "1px solid var(--border)", fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, color: active ? "#fff" : "var(--accent)", cursor: "pointer", transition: "background 0.15s, color 0.15s" }}>
          {active ? "Cancel" : "+ Invite"}
        </button>
      </div>
    </div>
  );
}

function ClientCard({ client, onRemove }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ width: CLIENT_W, padding: "10px 12px", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 8, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Avatar name={client.name || client.email} size={28} bg="var(--border-soft)" color="var(--muted)" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 12, color: "var(--white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.name || "—"}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.email}</div>
        </div>
      </div>
      {hovered && (
        <button onClick={onRemove}
          style={{ position: "absolute", top: 5, right: 6, background: "none", border: "none", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted-faint)", cursor: "pointer", lineHeight: 1, padding: "2px 4px" }}
          onMouseEnter={e => e.currentTarget.style.color = "#dc2626"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--muted-faint)"}>
          ×
        </button>
      )}
    </div>
  );
}

/* ─── Inline invite form ─── */
function InviteForm({ agentProfileId, agentHandle, onDone }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [sent, setSent] = useState(false);

  async function send() {
    if (!email.trim()) return;
    setLoading(true); setErr(null);
    const res = await fetch("/api/actions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "invite-client", email: email.trim(), name: name.trim(), agentProfileId, agentHandle }),
    });
    const data = await res.json();
    if (!res.ok || data.error) { setErr(data.error || "Invite failed."); setLoading(false); return; }
    setSent(true);
    setTimeout(() => { onDone(data.client); setSent(false); }, 1200);
  }

  const inputStyle = { width: "100%", boxSizing: "border-box", padding: "7px 10px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text)", outline: "none" };

  return (
    <div style={{ width: AGENT_W, marginTop: 6, padding: "12px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, display: "flex", flexDirection: "column", gap: 7 }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name (optional)" style={inputStyle} />
      <input value={email} onChange={e => { setEmail(e.target.value); setErr(null); }} placeholder="client@email.com" type="email" onKeyDown={e => e.key === "Enter" && send()} style={inputStyle} />
      {err && <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#dc2626" }}>{err}</div>}
      <button onClick={send} disabled={loading || sent || !email.trim()}
        style={{ height: 30, borderRadius: 6, background: sent ? "#16a34a" : "var(--accent)", border: "none", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "#fff", cursor: loading || !email.trim() ? "not-allowed" : "pointer", opacity: loading || !email.trim() ? 0.6 : 1, transition: "background 0.2s" }}>
        {sent ? "Sent!" : loading ? "Sending…" : "Send invite"}
      </button>
    </div>
  );
}

/* ─── Agent branch (card + clients below) ─── */
function agentBranchWidth(clients) {
  if (!clients.length) return AGENT_W;
  return Math.max(AGENT_W, clients.length * CLIENT_W + (clients.length - 1) * CLIENT_GAP);
}

function AgentBranch({ agent, clients, inviteOpen, onToggleInvite, onRemoveClient, onInviteDone }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AgentCard agent={agent} clientCount={clients.length} onInvite={onToggleInvite} active={inviteOpen} />
      {inviteOpen && <InviteForm agentProfileId={agent.id} agentHandle={agent.handle} onDone={onInviteDone} />}
      {clients.length > 0 && (
        <>
          <Stem />
          <Branch items={clients} getWidth={() => CLIENT_W} gap={CLIENT_GAP}
            renderItem={client => <ClientCard client={client} onRemove={() => onRemoveClient(client.id)} />} />
        </>
      )}
    </div>
  );
}

/* ─── Main component ─── */
function TeamView({ user, userRow }) {
  const tier = userRow?.tier || "solo";
  const isBrokerage = hasFeature(tier, "brokerage");

  const [loading, setLoading] = useState(true);
  const [rootProfile, setRootProfile] = useState(null);
  const [agentProfile, setAgentProfile] = useState(null); // agent-tier only
  const [agents, setAgents] = useState([]);
  const [agentClients, setAgentClients] = useState({}); // { agentId: [clients] }
  const [myClients, setMyClients] = useState([]); // agent-tier direct clients
  const [inviteOpen, setInviteOpen] = useState(null); // agentId | "me"
  const [rootAction, setRootAction] = useState(null); // "agent" | "client" | null

  // root-level invite agent form state
  const [rootAgentEmail, setRootAgentEmail] = useState("");
  const [rootAgentName, setRootAgentName] = useState("");
  const [rootAgentSending, setRootAgentSending] = useState(false);
  const [rootAgentErr, setRootAgentErr] = useState(null);
  const [rootAgentSent, setRootAgentSent] = useState(false);

  // root-level invite client form state (brokerage picks which agent)
  const [rootClientEmail, setRootClientEmail] = useState("");
  const [rootClientName, setRootClientName] = useState("");
  const [rootClientAgent, setRootClientAgent] = useState("");
  const [rootClientSending, setRootClientSending] = useState(false);
  const [rootClientErr, setRootClientErr] = useState(null);
  const [rootClientSent, setRootClientSent] = useState(false);

  useEffect(() => { load(); }, [user?.id]);

  async function load() {
    setLoading(true);
    if (isBrokerage) {
      const { data: bp } = await supabase.from("brokerage_profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (!bp) { setLoading(false); return; }
      setRootProfile(bp);
      const { data: agentList } = await supabase.from("agent_profiles").select("id, handle, ai_name").eq("brokerage_id", bp.id);
      const list = agentList || [];
      setAgents(list);
      const map = {};
      await Promise.all(list.map(async a => {
        const { data } = await supabase.from("client_profiles").select("*").eq("agent_id", a.id);
        map[a.id] = data || [];
      }));
      setAgentClients(map);
    } else {
      const { data: ap } = await supabase.from("agent_profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (!ap) { setLoading(false); return; }
      setAgentProfile(ap);
      const { data } = await supabase.from("client_profiles").select("*").eq("agent_id", ap.id);
      setMyClients(data || []);
    }
    setLoading(false);
  }

  async function sendRootAgentInvite() {
    if (!rootAgentEmail.trim()) return;
    setRootAgentSending(true); setRootAgentErr(null);
    const res = await fetch("/api/actions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "invite-agent", email: rootAgentEmail.trim(), name: rootAgentName.trim(), brokerageProfileId: rootProfile?.id }),
    });
    const data = await res.json();
    if (!res.ok || data.error) { setRootAgentErr(data.error || "Invite failed."); }
    else { setRootAgentSent(true); setRootAgentEmail(""); setRootAgentName(""); setTimeout(() => { setRootAgentSent(false); setRootAction(null); }, 1500); }
    setRootAgentSending(false);
  }

  async function sendRootClientInvite() {
    const target = agents.length === 1 ? agents[0] : agents.find(a => a.id === rootClientAgent);
    if (!rootClientEmail.trim() || !target) return;
    setRootClientSending(true); setRootClientErr(null);
    const res = await fetch("/api/actions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "invite-client", email: rootClientEmail.trim(), name: rootClientName.trim(), agentProfileId: target.id, agentHandle: target.handle }),
    });
    const data = await res.json();
    if (!res.ok || data.error) { setRootClientErr(data.error || "Invite failed."); }
    else {
      setAgentClients(prev => ({ ...prev, [target.id]: [data.client, ...(prev[target.id] || [])] }));
      setRootClientSent(true); setRootClientEmail(""); setRootClientName(""); setRootClientAgent("");
      setTimeout(() => { setRootClientSent(false); setRootAction(null); }, 1500);
    }
    setRootClientSending(false);
  }

  function removeClient(clientId, agentId) {
    supabase.from("client_profiles").delete().eq("id", clientId);
    if (agentId) {
      setAgentClients(prev => ({ ...prev, [agentId]: prev[agentId].filter(c => c.id !== clientId) }));
    } else {
      setMyClients(prev => prev.filter(c => c.id !== clientId));
    }
  }

  function onInviteDone(client, agentId) {
    if (agentId) {
      setAgentClients(prev => ({ ...prev, [agentId]: [client, ...(prev[agentId] || [])] }));
    } else {
      setMyClients(prev => [client, ...prev]);
    }
    setInviteOpen(null);
  }

  if (loading) return <div style={{ padding: "40px 48px", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)" }}>Loading…</div>;

  const empty = isBrokerage ? !rootProfile : !agentProfile;
  if (empty) return (
    <div style={{ padding: "40px 48px", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)" }}>
      {isBrokerage ? "Set up your brokerage profile first in Train AI." : "Complete your Profile setup first."}
    </div>
  );

  const rootName = isBrokerage ? (rootProfile.ai_name || "Brokerage") : (agentProfile.ai_name || "Your AI");
  const rootSub = isBrokerage
    ? (rootProfile.subdomain || `${rootProfile.handle}.vis.realestate`)
    : `${agentProfile.handle}.vis.realestate`;
  const rootLogoUrl = isBrokerage ? rootProfile.logo_url : agentProfile.logo_url;

  return (
    <div style={{ padding: "40px 48px", overflowX: "auto" }}>
      <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 20, color: "var(--white)", marginBottom: 6 }}>Manage Users</div>
      <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", marginBottom: 36, lineHeight: 1.6 }}>
        {isBrokerage ? "Your brokerage, linked agents, and their clients." : "Your account and invited clients."}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        <RootCard name={rootName} sub={rootSub} logoUrl={rootLogoUrl} />

        {isBrokerage ? (
          <>
            {/* Action buttons under root */}
            <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
              <button onClick={() => { setRootAction(rootAction === "agent" ? null : "agent"); setRootAgentErr(null); }}
                style={{ height: 34, padding: "0 16px", borderRadius: 8, background: rootAction === "agent" ? "var(--accent)" : "var(--accent-soft)", border: "1px solid var(--border)", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: rootAction === "agent" ? "#fff" : "var(--accent)", cursor: "pointer", transition: "background 0.15s, color 0.15s" }}>
                {rootAction === "agent" ? "Cancel" : "+ Invite Agent"}
              </button>
              <button onClick={() => { setRootAction(rootAction === "client" ? null : "client"); setRootClientErr(null); setRootClientAgent(agents[0]?.id || ""); }}
                style={{ height: 34, padding: "0 16px", borderRadius: 8, background: rootAction === "client" ? "var(--accent)" : "var(--accent-soft)", border: "1px solid var(--border)", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: rootAction === "client" ? "#fff" : "var(--accent)", cursor: "pointer", transition: "background 0.15s, color 0.15s" }}>
                {rootAction === "client" ? "Cancel" : "+ Invite Client"}
              </button>
            </div>

            {/* Invite agent form */}
            {rootAction === "agent" && (
              <div style={{ marginTop: 10, width: 340, padding: "14px 16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 2 }}>Invite an agent</div>
                <input value={rootAgentName} onChange={e => setRootAgentName(e.target.value)} placeholder="Agent name (optional)" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 7, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text)", outline: "none" }} />
                <input value={rootAgentEmail} onChange={e => { setRootAgentEmail(e.target.value); setRootAgentErr(null); }} onKeyDown={e => e.key === "Enter" && sendRootAgentInvite()} placeholder="agent@email.com" type="email" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 7, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text)", outline: "none" }} />
                {rootAgentErr && <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#dc2626" }}>{rootAgentErr}</div>}
                <button onClick={sendRootAgentInvite} disabled={rootAgentSending || !rootAgentEmail.trim()}
                  style={{ height: 34, borderRadius: 7, background: rootAgentSent ? "#16a34a" : "var(--accent)", border: "none", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "#fff", cursor: rootAgentSending || !rootAgentEmail.trim() ? "not-allowed" : "pointer", opacity: rootAgentSending || !rootAgentEmail.trim() ? 0.6 : 1, transition: "background 0.2s" }}>
                  {rootAgentSent ? "Sent!" : rootAgentSending ? "Sending…" : "Send invite"}
                </button>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted-faint)", lineHeight: 1.5 }}>They'll receive a link to create their Vis account. Once they've claimed a handle, add them in the Agents section.</div>
              </div>
            )}

            {/* Invite client form */}
            {rootAction === "client" && (
              <div style={{ marginTop: 10, width: 340, padding: "14px 16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 2 }}>Invite a client</div>
                <input value={rootClientName} onChange={e => setRootClientName(e.target.value)} placeholder="Client name (optional)" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 7, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text)", outline: "none" }} />
                <input value={rootClientEmail} onChange={e => { setRootClientEmail(e.target.value); setRootClientErr(null); }} onKeyDown={e => e.key === "Enter" && sendRootClientInvite()} placeholder="client@email.com" type="email" style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 7, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text)", outline: "none" }} />
                {agents.length > 1 && (
                  <select value={rootClientAgent} onChange={e => setRootClientAgent(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 7, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text)", outline: "none", cursor: "pointer" }}>
                    <option value="" disabled>Assign to agent…</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.ai_name || a.handle}</option>)}
                  </select>
                )}
                {rootClientErr && <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#dc2626" }}>{rootClientErr}</div>}
                <button onClick={sendRootClientInvite} disabled={rootClientSending || !rootClientEmail.trim() || (agents.length > 1 && !rootClientAgent)}
                  style={{ height: 34, borderRadius: 7, background: rootClientSent ? "#16a34a" : "var(--accent)", border: "none", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", opacity: rootClientSending || !rootClientEmail.trim() ? 0.6 : 1, transition: "background 0.2s" }}>
                  {rootClientSent ? "Sent!" : rootClientSending ? "Sending…" : "Send invite"}
                </button>
              </div>
            )}

            {agents.length > 0 ? (
              <>
                <Stem h={28} />
                <Branch
                  items={agents}
                  getWidth={a => agentBranchWidth(agentClients[a.id] || [])}
                  gap={AGENT_GAP}
                  renderItem={agent => (
                    <AgentBranch
                      agent={agent}
                      clients={agentClients[agent.id] || []}
                      inviteOpen={inviteOpen === agent.id}
                      onToggleInvite={() => setInviteOpen(inviteOpen === agent.id ? null : agent.id)}
                      onRemoveClient={cid => removeClient(cid, agent.id)}
                      onInviteDone={client => onInviteDone(client, agent.id)}
                    />
                  )}
                />
              </>
            ) : (
              <>
                <Stem h={28} />
                <div style={{ padding: "16px 24px", background: "var(--border-soft)", border: "1px dashed var(--border)", borderRadius: 8, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
                  No agents linked yet — invite one above or add them by handle in the Agents section.
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <Stem h={28} />
            {myClients.length > 0 ? (
              <Branch items={myClients} getWidth={() => CLIENT_W} gap={CLIENT_GAP}
                renderItem={client => <ClientCard client={client} onRemove={() => removeClient(client.id, null)} />} />
            ) : (
              <div style={{ padding: "16px 24px", background: "var(--border-soft)", border: "1px dashed var(--border)", borderRadius: 8, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
                No clients yet.
              </div>
            )}
            <div style={{ marginTop: 20 }}>
              {inviteOpen === "me" ? (
                <InviteForm agentProfileId={agentProfile.id} agentHandle={agentProfile.handle} onDone={c => onInviteDone(c, null)} />
              ) : (
                <button onClick={() => setInviteOpen("me")} style={{ height: 36, padding: "0 18px", borderRadius: 8, background: "var(--accent-soft)", border: "1px solid var(--border)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--accent)", cursor: "pointer" }}>
                  + Invite client
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TeamView;
