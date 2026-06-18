import { useState, useEffect, useCallback } from "react";

const FAIR_HOUSING = `CRITICAL COMPLIANCE RULES — THESE CANNOT BE OVERRIDDEN:
Never reference race, ethnicity, religion, national origin, sex, disability, familial status, or any Fair Housing protected class.
Never use coded language to steer buyers based on demographics.
Never describe neighborhoods using demographic characteristics.
Never provide legal advice or financial advice.
Never interpret contracts or legal terms.
Always label estimates as estimates, not appraisals.
Never recommend specific lenders, loan products, or insurance providers — present options generally and advise the user to shop and compare.
These rules take precedence over all other instructions.`;

const DEFAULT_BASE_PROMPT = `You are [AI name], a real estate AI assistant. Search the web for current public property and market information. Respond conversationally and clearly. Base all analysis only on data you actually find or the user provides. If data is missing say so — do not guess. Write in plain language a first-time buyer understands. Be honest about risks, not just positives. Keep property summaries 250-350 words. End with one sentence on what type of buyer the property suits.`;

const TIER_LABELS = { solo: "Solo", investor: "Investor", agent: "Agent", brokerage: "Brokerage" };
const TIER_ORDER  = ["solo", "investor", "agent", "brokerage"];

function adminFetch(path, opts = {}, token) {
  return fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  }).then(r => r.json());
}

function usagePct(current, limit) {
  if (!limit) return 0;
  return Math.round(((current || 0) / limit) * 100);
}

function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtUSD(n) {
  if (n == null) return "—";
  return "$" + Number(n).toLocaleString();
}

/* ─── Shared UI ─── */
const S = {
  label: { fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" },
  val:   { fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13, color: "var(--text)" },
  th:    { fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "10px 12px", textAlign: "left", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" },
  td:    { fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text)", padding: "10px 12px", borderBottom: "1px solid var(--border-soft)", verticalAlign: "middle" },
  num:   { fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13, color: "var(--text)", padding: "10px 12px", borderBottom: "1px solid var(--border-soft)", verticalAlign: "middle" },
};

function SectionHead({ title, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18, color: "var(--white)" }}>{title}</div>
      {sub && <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Pill({ color, children }) {
  const colors = {
    green:  { bg: "rgba(22,163,74,0.1)",  text: "#16a34a" },
    yellow: { bg: "rgba(245,158,11,0.1)", text: "#f59e0b" },
    red:    { bg: "rgba(220,38,38,0.1)",  text: "#dc2626" },
    gray:   { bg: "var(--border-soft)",   text: "var(--muted)" },
    accent: { bg: "var(--accent-soft)",   text: "var(--accent)" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: "var(--font-sans)", background: c.bg, color: c.text }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, danger, small, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ height: small ? 28 : 34, padding: small ? "0 10px" : "0 14px", borderRadius: 6, border: danger ? "1px solid #dc2626" : "1px solid var(--border)", background: danger ? (hov ? "#dc2626" : "transparent") : (hov ? "var(--card)" : "var(--border-soft)"), fontFamily: "var(--font-sans)", fontSize: small ? 11 : 12, fontWeight: 600, color: danger ? (hov ? "#fff" : "#dc2626") : "var(--text)", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1, transition: "all 0.15s", whiteSpace: "nowrap" }}>
      {children}
    </button>
  );
}

function Input({ value, onChange, type = "text", style }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      style={{ height: 32, padding: "0 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", fontFamily: type === "number" ? "var(--font-mono)" : "var(--font-sans)", fontWeight: type === "number" ? 600 : 400, fontSize: 13, color: "var(--text)", outline: "none", width: "100%", boxSizing: "border-box", ...style }} />
  );
}

/* ─── Users section ─── */
function UsersSection({ token }) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [editing, setEditing] = useState(null); // { userId, field, value }
  const [busy, setBusy]       = useState(false);
  const [err, setErr]         = useState(null);

  async function load() {
    setLoading(true);
    const data = await adminFetch("/api/admin?resource=users", { method: "GET" }, token);
    setUsers(data.users || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function doAction(userId, action, value) {
    setBusy(true); setErr(null);
    const res = await adminFetch("/api/admin?resource=users", { method: "PATCH", body: { userId, action, value } }, token);
    if (res.error) setErr(res.error);
    setBusy(false);
    setEditing(null);
    load();
  }

  const filtered = users.filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.tier?.includes(search)
  );

  return (
    <div style={{ padding: "40px 40px" }}>
      <SectionHead title="User Management" sub="View, edit, and manage all Vis accounts." />
      <div style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <Input value={search} onChange={setSearch} style={{ maxWidth: 280 }} />
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)" }}>{filtered.length} users</span>
      </div>
      {err && <div style={{ marginBottom: 12, fontFamily: "var(--font-sans)", fontSize: 12, color: "#dc2626" }}>{err}</div>}
      {loading ? (
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)" }}>Loading…</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            <thead>
              <tr>
                {["Email", "Tier", "Usage", "Overage $", "Joined", "Last Active", "Status", "Actions"].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const pct = usagePct(u.usage_current, u.usage_limit);
                const usageColor = pct >= 100 ? "red" : pct >= 80 ? "yellow" : "green";
                return (
                  <tr key={u.id} style={{ background: u.suspended ? "rgba(220,38,38,0.04)" : "transparent" }}>
                    <td style={S.td}>{u.email || "—"}</td>
                    <td style={S.td}>
                      {editing?.userId === u.id && editing.field === "tier" ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <select value={editing.value} onChange={e => setEditing(ed => ({ ...ed, value: e.target.value }))}
                            style={{ height: 28, padding: "0 6px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text)" }}>
                            {TIER_ORDER.map(t => <option key={t} value={t}>{TIER_LABELS[t]}</option>)}
                          </select>
                          <Btn small onClick={() => doAction(u.id, "tier", editing.value)} disabled={busy}>Save</Btn>
                          <Btn small onClick={() => setEditing(null)}>✕</Btn>
                        </div>
                      ) : (
                        <span onClick={() => setEditing({ userId: u.id, field: "tier", value: u.tier })} style={{ cursor: "pointer" }}>
                          <Pill color={u.comped ? "accent" : "gray"}>{TIER_LABELS[u.tier] || u.tier}{u.comped ? " ★" : ""}</Pill>
                        </span>
                      )}
                    </td>
                    <td style={S.num}>
                      <Pill color={usageColor}>{pct}%</Pill>
                      <span style={{ marginLeft: 6, fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)" }}>{u.usage_current || 0}/{u.usage_limit || "—"}</span>
                    </td>
                    <td style={S.num}>{u.overage_accrued ? fmtUSD(u.overage_accrued) : "—"}</td>
                    <td style={{ ...S.td, whiteSpace: "nowrap" }}>{fmtDate(u.created_at)}</td>
                    <td style={{ ...S.td, whiteSpace: "nowrap" }}>{fmtDate(u.last_active_at)}</td>
                    <td style={S.td}><Pill color={u.suspended ? "red" : "green"}>{u.suspended ? "Suspended" : "Active"}</Pill></td>
                    <td style={S.td}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <Btn small onClick={() => doAction(u.id, "reset_usage")} disabled={busy}>Reset Usage</Btn>
                        {u.suspended
                          ? <Btn small onClick={() => doAction(u.id, "reactivate")} disabled={busy}>Reactivate</Btn>
                          : <Btn small danger onClick={() => doAction(u.id, "suspend")} disabled={busy}>Suspend</Btn>}
                        {u.comped
                          ? <Btn small onClick={() => doAction(u.id, "uncomp")} disabled={busy}>Remove Comp</Btn>
                          : <Btn small onClick={() => { const exp = prompt("Comp expires (YYYY-MM-DD):"); if (exp) doAction(u.id, "comp", exp); }} disabled={busy}>Comp</Btn>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Usage section ─── */
function UsageSection({ token }) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/api/admin?resource=users", { method: "GET" }, token).then(d => {
      const sorted = [...(d.users || [])].sort((a, b) => usagePct(b.usage_current, b.usage_limit) - usagePct(a.usage_current, a.usage_limit));
      setUsers(sorted);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ padding: "40px 40px" }}>
      <SectionHead title="Usage & Limits" sub="All users sorted by usage percentage. Yellow = 80%+, red = 100%+." />
      {loading ? (
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)" }}>Loading…</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            <thead>
              <tr>
                {["Email", "Tier", "Used", "Limit", "Usage %", "Overage $"].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const pct = usagePct(u.usage_current, u.usage_limit);
                const usageColor = pct >= 100 ? "red" : pct >= 80 ? "yellow" : "green";
                return (
                  <tr key={u.id}>
                    <td style={S.td}>{u.email || "—"}</td>
                    <td style={S.td}><Pill color="gray">{TIER_LABELS[u.tier] || u.tier}</Pill></td>
                    <td style={S.num}>{u.usage_current || 0}</td>
                    <td style={S.num}>{u.usage_limit || "—"}</td>
                    <td style={S.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 80, height: 5, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: pct >= 100 ? "#dc2626" : pct >= 80 ? "#f59e0b" : "var(--accent)", borderRadius: 3 }} />
                        </div>
                        <Pill color={usageColor}>{pct}%</Pill>
                      </div>
                    </td>
                    <td style={S.num}>{u.overage_accrued ? fmtUSD(u.overage_accrued) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Tier Config section ─── */
function TierConfigSection({ token }) {
  const [tiers, setTiers]     = useState([]);
  const [counts, setCounts]   = useState({});
  const [loading, setLoading] = useState(true);
  const [edits, setEdits]     = useState({});
  const [saving, setSaving]   = useState(null);
  const [err, setErr]         = useState(null);

  async function load() {
    const data = await adminFetch("/api/admin?resource=tier", { method: "GET" }, token);
    setTiers(data.tiers || []);
    setCounts(data.counts || {});
    const init = {};
    (data.tiers || []).forEach(t => { init[t.tier] = { monthly_price: t.monthly_price, usage_limit: t.usage_limit, overage_rate: t.overage_rate }; });
    setEdits(init);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save(tier) {
    setSaving(tier); setErr(null);
    const e = edits[tier];
    const res = await adminFetch("/api/admin?resource=tier", { method: "PATCH", body: { tier, ...e } }, token);
    if (res.error) setErr(res.error);
    setSaving(null);
    load();
  }

  if (loading) return <div style={{ padding: 40, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)" }}>Loading…</div>;

  return (
    <div style={{ padding: "40px 40px" }}>
      <SectionHead title="Tier & Pricing Config" sub="Changes apply to new subscribers immediately." />
      {err && <div style={{ marginBottom: 16, fontFamily: "var(--font-sans)", fontSize: 12, color: "#dc2626" }}>{err}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {TIER_ORDER.map(tierKey => {
          const t = tiers.find(x => x.tier === tierKey);
          if (!t) return null;
          const e = edits[tierKey] || {};
          return (
            <div key={tierKey} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, color: "var(--white)" }}>{TIER_LABELS[tierKey]}</span>
                <Pill color="gray">{counts[tierKey] || 0} users</Pill>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                <div>
                  <div style={{ ...S.label, marginBottom: 4 }}>Monthly Price ($)</div>
                  <Input type="number" value={e.monthly_price ?? ""} onChange={v => setEdits(ed => ({ ...ed, [tierKey]: { ...ed[tierKey], monthly_price: v } }))} />
                </div>
                <div>
                  <div style={{ ...S.label, marginBottom: 4 }}>Usage Limit</div>
                  <Input type="number" value={e.usage_limit ?? ""} onChange={v => setEdits(ed => ({ ...ed, [tierKey]: { ...ed[tierKey], usage_limit: v } }))} />
                </div>
                <div>
                  <div style={{ ...S.label, marginBottom: 4 }}>Overage Rate ($/unit)</div>
                  <Input type="number" value={e.overage_rate ?? ""} onChange={v => setEdits(ed => ({ ...ed, [tierKey]: { ...ed[tierKey], overage_rate: v } }))} />
                </div>
              </div>
              <Btn onClick={() => save(tierKey)} disabled={saving === tierKey}>{saving === tierKey ? "Saving…" : "Save changes"}</Btn>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Agents section ─── */
function AgentsSection({ token }) {
  const [brokerages, setBrokerages] = useState([]);
  const [agents, setAgents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState(null);

  useEffect(() => {
    adminFetch("/api/admin?resource=agents", { method: "GET" }, token).then(d => {
      setBrokerages(d.brokerages || []);
      setAgents(d.agents || []);
      setLoading(false);
    });
  }, []);

  const standalone = agents.filter(a => !a.brokerage_id);

  return (
    <div style={{ padding: "40px 40px" }}>
      <SectionHead title="Agent & Brokerage Management" sub="View accounts, linked agents, and training content." />
      {loading ? (
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)" }}>Loading…</div>
      ) : (
        <>
          {brokerages.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, color: "var(--white)", marginBottom: 12 }}>Brokerages</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {brokerages.map(b => {
                  const linked = agents.filter(a => a.brokerage_id === b.id);
                  const open = expanded === b.id;
                  return (
                    <div key={b.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                      <div onClick={() => setExpanded(open ? null : b.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", cursor: "pointer" }}>
                        <div>
                          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, color: "var(--white)" }}>{b.ai_name || b.handle}</span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginLeft: 10 }}>{b.handle}.vis.realestate</span>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <Pill color="accent">{linked.length} agents</Pill>
                          <span style={{ color: "var(--muted)", fontSize: 12 }}>{open ? "▲" : "▼"}</span>
                        </div>
                      </div>
                      {open && (
                        <div style={{ borderTop: "1px solid var(--border)", padding: "14px 18px" }}>
                          {b.training_baseline && (
                            <div style={{ marginBottom: 14 }}>
                              <div style={{ ...S.label, marginBottom: 6 }}>Brokerage Training (Layer 2)</div>
                              <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted-soft)", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 12px", whiteSpace: "pre-wrap", maxHeight: 120, overflow: "auto" }}>{b.training_baseline}</div>
                            </div>
                          )}
                          {linked.length > 0 ? (
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead><tr>
                                {["Agent", "Handle", "Training"].map(h => <th key={h} style={{ ...S.th, paddingLeft: 0 }}>{h}</th>)}
                              </tr></thead>
                              <tbody>
                                {linked.map(a => (
                                  <tr key={a.id}>
                                    <td style={{ ...S.td, paddingLeft: 0 }}>{a.ai_name || "—"}</td>
                                    <td style={{ ...S.td }}><span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{a.handle}.vis.realestate</span></td>
                                    <td style={{ ...S.td, maxWidth: 280 }}><div style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.training_text || "—"}</div></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)" }}>No linked agents.</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {standalone.length > 0 && (
            <div>
              <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, color: "var(--white)", marginBottom: 12 }}>Independent Agents</div>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                <thead><tr>
                  {["AI Name", "Handle", "Joined", "Training"].map(h => <th key={h} style={S.th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {standalone.map(a => (
                    <tr key={a.id}>
                      <td style={S.td}>{a.ai_name || "—"}</td>
                      <td style={S.td}><span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{a.handle}.vis.realestate</span></td>
                      <td style={{ ...S.td, whiteSpace: "nowrap" }}>{fmtDate(a.created_at)}</td>
                      <td style={{ ...S.td, maxWidth: 300 }}><div style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.training_text || "—"}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Revenue section ─── */
function RevenueSection({ token }) {
  const [users, setUsers] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminFetch("/api/admin?resource=users", { method: "GET" }, token),
      adminFetch("/api/admin?resource=tier", { method: "GET" }, token),
    ]).then(([u, t]) => {
      setUsers(u.users || []);
      setTiers(t.tiers || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: 40, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)" }}>Loading…</div>;

  const tierMap = {};
  tiers.forEach(t => { tierMap[t.tier] = t; });

  const mrr = users.reduce((sum, u) => sum + (Number(tierMap[u.tier]?.monthly_price) || 0), 0);
  const overageTotal = users.reduce((sum, u) => sum + (Number(u.overage_accrued) || 0), 0);
  const countByTier = {};
  users.forEach(u => { countByTier[u.tier] = (countByTier[u.tier] || 0) + 1; });
  const suspended = users.filter(u => u.suspended).length;
  const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0);
  const newThisMonth = users.filter(u => new Date(u.created_at) >= thisMonth).length;

  const statCard = (label, value, sub) => (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 22px", flex: 1, minWidth: 160 }}>
      <div style={{ ...S.label, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 26, color: "var(--accent)", letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ padding: "40px 40px" }}>
      <SectionHead title="Revenue Overview" sub="Live data from all active accounts." />
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
        {statCard("Total MRR", fmtUSD(mrr), `${users.length} total subscribers`)}
        {statCard("Overage (this period)", fmtUSD(overageTotal), "across all accounts")}
        {statCard("New This Month", newThisMonth, "new signups")}
        {statCard("Suspended", suspended, "accounts")}
      </div>
      <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, color: "var(--white)", marginBottom: 12 }}>Subscribers by Tier</div>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", maxWidth: 600 }}>
        <thead><tr>
          {["Tier", "Price/mo", "Subscribers", "MRR"].map(h => <th key={h} style={S.th}>{h}</th>)}
        </tr></thead>
        <tbody>
          {TIER_ORDER.map(tierKey => {
            const tc = tierMap[tierKey];
            const cnt = countByTier[tierKey] || 0;
            const tierMrr = cnt * (Number(tc?.monthly_price) || 0);
            return (
              <tr key={tierKey}>
                <td style={S.td}><Pill color="gray">{TIER_LABELS[tierKey]}</Pill></td>
                <td style={S.num}>{tc ? fmtUSD(tc.monthly_price) : "—"}</td>
                <td style={S.num}>{cnt}</td>
                <td style={S.num}>{fmtUSD(tierMrr)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── System Config section ─── */
function SystemSection() {
  const [maintenance, setMaintenance] = useState(() => localStorage.getItem("vis-maintenance") === "true");
  const [basePrompt, setBasePrompt]   = useState(() => localStorage.getItem("vis-base-prompt") || DEFAULT_BASE_PROMPT);
  const [saved, setSaved]             = useState(false);

  function toggleMaintenance() {
    const next = !maintenance;
    setMaintenance(next);
    localStorage.setItem("vis-maintenance", String(next));
  }

  function savePrompt() {
    localStorage.setItem("vis-base-prompt", basePrompt);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ padding: "40px 40px", maxWidth: 700 }}>
      <SectionHead title="System Config" sub="Global Vis settings." />

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 22px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, color: "var(--white)", marginBottom: 4 }}>Maintenance Mode</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)" }}>Blocks all non-admin access with a maintenance message.</div>
          </div>
          <button onClick={toggleMaintenance}
            style={{ width: 44, height: 24, borderRadius: 12, border: "none", background: maintenance ? "var(--accent)" : "var(--border)", cursor: "pointer", transition: "background 0.2s", position: "relative" }}>
            <span style={{ position: "absolute", top: 3, left: maintenance ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
          </button>
        </div>
        {maintenance && <div style={{ marginTop: 12, fontFamily: "var(--font-sans)", fontSize: 12, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "8px 12px", borderRadius: 6 }}>⚠ Maintenance mode is ON. Users will see a maintenance page.</div>}
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 22px", marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, color: "var(--white)", marginBottom: 6 }}>Fair Housing Guardrail (Layer 1)</div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>Read-only — hardcoded in api/chat.js. Cannot be changed here.</div>
        <pre style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted-soft)", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 6, padding: "12px 14px", whiteSpace: "pre-wrap", margin: 0, lineHeight: 1.7 }}>{FAIR_HOUSING}</pre>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 22px" }}>
        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, color: "var(--white)", marginBottom: 4 }}>Vis Base Instructions (Layer 4)</div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>Editable. Applies to all AI responses. Saved to localStorage — sync to api/chat.js manually for production.</div>
        <textarea value={basePrompt} onChange={e => setBasePrompt(e.target.value)} rows={6}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text)", resize: "vertical", boxSizing: "border-box", outline: "none", marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Btn onClick={savePrompt}>Save</Btn>
          {saved && <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--accent)" }}>Saved ✓</span>}
          <Btn onClick={() => setBasePrompt(DEFAULT_BASE_PROMPT)}>Reset to default</Btn>
        </div>
      </div>
    </div>
  );
}

/* ─── Admin login ─── */
function AdminLogin({ onAuth }) {
  const [pw, setPw]   = useState("");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const res = await fetch("/api/admin?resource=auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    const data = await res.json();
    if (!res.ok) { setErr(data.error || "Invalid password."); setBusy(false); return; }
    sessionStorage.setItem("vis-admin-token", data.token);
    onAuth(data.token);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "36px 40px", width: "100%", maxWidth: 360 }}>
        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 22, color: "var(--white)", marginBottom: 4 }}>Admin</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginBottom: 24 }}>vis.realestate</div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Admin password" autoFocus
            style={{ height: 42, padding: "0 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text)", outline: "none", boxSizing: "border-box" }} />
          {err && <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#dc2626" }}>{err}</div>}
          <button type="submit" disabled={busy || !pw}
            style={{ height: 42, borderRadius: 8, background: "var(--accent)", border: "none", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, color: "#fff", cursor: busy ? "default" : "pointer", opacity: !pw ? 0.5 : 1 }}>
            {busy ? "Verifying…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Sidebar ─── */
const NAV_ITEMS = [
  { id: "users",   label: "User Management" },
  { id: "usage",   label: "Usage & Limits" },
  { id: "tiers",   label: "Tier Config" },
  { id: "agents",  label: "Agents" },
  { id: "revenue", label: "Revenue" },
  { id: "system",  label: "System" },
];

function SidebarItem({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 20px", background: active ? "var(--card)" : "none", border: "none", borderLeft: `2px solid ${active ? "var(--accent)" : "transparent"}`, fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "var(--white)" : "var(--muted)", cursor: "pointer", transition: "color 0.15s, background 0.15s" }}>
      {label}
    </button>
  );
}

/* ─── Main admin shell ─── */
function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem("vis-admin-token") || null);
  const [section, setSection] = useState("users");

  if (!token) return <AdminLogin onAuth={setToken} />;

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: 200, flexShrink: 0, background: "var(--border-soft)", borderRight: "1px solid var(--border)", padding: "24px 0", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 20px", marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 16, color: "var(--white)" }}>Admin</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>vis.realestate</div>
        </div>
        <div style={{ flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <SidebarItem key={item.id} label={item.label} active={section === item.id} onClick={() => setSection(item.id)} />
          ))}
        </div>
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
          <button onClick={() => { sessionStorage.removeItem("vis-admin-token"); setToken(null); }}
            style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            Sign out
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {section === "users"   && <UsersSection token={token} />}
        {section === "usage"   && <UsageSection token={token} />}
        {section === "tiers"   && <TierConfigSection token={token} />}
        {section === "agents"  && <AgentsSection token={token} />}
        {section === "revenue" && <RevenueSection token={token} />}
        {section === "system"  && <SystemSection />}
      </div>
    </div>
  );
}

export default Admin;
