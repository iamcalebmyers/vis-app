import { useState } from "react";
import AgentSettings from "./AgentSettings.jsx";
import TeamView from "./TeamView.jsx";
import { hasFeature, usagePct, USAGE_LABELS } from "../utils/tier.js";
import { getStoredTheme, setTheme } from "../theme.js";

const TIER_PRICES = { solo: 19, investor: 49, agent: 99, brokerage: 249 };
const TIER_NAMES  = { solo: "Solo", investor: "Investor", agent: "Agent", brokerage: "Brokerage" };

const THEMES = [
  { id: "charcoal", label: "Charcoal", bg: "#111111", card: "#3D3D3D" },
  { id: "black",    label: "Black",    bg: "#000000", card: "#1a1a1a" },
  { id: "light",    label: "Light",    bg: "#f7f6f3", card: "#ffffff" },
];

const PROFILE_ITEMS = [
  { id: "profile",  label: "Profile"  },
  { id: "branding", label: "Branding" },
  { id: "contact",  label: "Contact"  },
  { id: "train",    label: "Train AI" },
];

/* ─── Primitives ─── */
function SectionHead({ title, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18, color: "var(--white)" }}>{title}</div>
      {sub && <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{value}</span>
    </div>
  );
}

/* ─── Content sections ─── */
function AccountSection({ user, userRow, onSignOut }) {
  const tier = userRow?.tier || "solo";
  const joinDate = userRow?.created_at
    ? new Date(userRow.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";
  return (
    <div style={{ maxWidth: 520, padding: "40px 48px" }}>
      <SectionHead title="Account" sub="Your profile and account details." />
      <div style={{ marginBottom: 32 }}>
        <InfoRow label="Email" value={user?.email || "—"} />
        <InfoRow label="Plan" value={TIER_NAMES[tier] || tier} />
        <InfoRow label="Member since" value={joinDate} />
      </div>
      <button onClick={onSignOut}
        style={{ height: 40, padding: "0 20px", borderRadius: 8, background: "var(--border-soft)", border: "1px solid var(--border)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--muted)", cursor: "pointer", transition: "color 0.15s, border-color 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "#dc2626"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
        Sign out
      </button>
    </div>
  );
}

function AppearanceSection() {
  const [current, setCurrent] = useState(getStoredTheme());
  function pick(id) { setTheme(id); setCurrent(id); }
  return (
    <div style={{ maxWidth: 520, padding: "40px 48px" }}>
      <SectionHead title="Appearance" sub="Choose how Vis looks on your device." />
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {THEMES.map(t => {
          const active = current === t.id;
          return (
            <button key={t.id} onClick={() => pick(t.id)}
              style={{ width: 120, padding: 0, border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`, borderRadius: 10, overflow: "hidden", cursor: "pointer", background: "none", transition: "border-color 0.15s", outline: "none" }}>
              <div style={{ height: 72, background: t.bg, display: "flex", alignItems: "flex-end", padding: "8px 8px 10px", gap: 6 }}>
                <div style={{ flex: 1, height: 28, background: t.card, borderRadius: 4 }} />
                <div style={{ width: 24, height: 24, borderRadius: 4, background: "#DA6B3A" }} />
              </div>
              <div style={{ padding: "8px 10px", background: "var(--card)", textAlign: "left" }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: active ? 700 : 500, color: active ? "var(--accent)" : "var(--muted)" }}>{t.label}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BillingSection({ user, userRow }) {
  const tier = userRow?.tier || "solo";
  const pct = usagePct(userRow?.usage_current, userRow?.usage_limit);
  const color = pct >= 100 ? "#dc2626" : pct >= 80 ? "#f59e0b" : "var(--accent)";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function openPortal() {
    if (!user?.id) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/billing-portal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not open billing portal.");
      window.location.href = json.url;
    } catch (e) { setError(e.message); setLoading(false); }
  }

  return (
    <div style={{ maxWidth: 520, padding: "40px 48px" }}>
      <SectionHead title="Billing" sub="Manage your subscription and usage." />
      <div style={{ background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, color: "var(--white)" }}>{TIER_NAMES[tier]} plan</span>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 15, color: "var(--accent)" }}>${TIER_PRICES[tier] ?? "—"}<span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>/mo</span></span>
        </div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)" }}>{USAGE_LABELS[tier] || "Standard"} usage · billed monthly</div>
      </div>
      {userRow?.usage_limit > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)" }}>Usage this period</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: pct >= 80 ? color : "var(--muted)" }}>{pct}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 3, transition: "width 0.3s" }} />
          </div>
          {pct >= 80 && <div style={{ marginTop: 8, fontFamily: "var(--font-sans)", fontSize: 12, color }}>{pct >= 100 ? "Usage limit reached — overage rates apply." : "Approaching your usage limit."}</div>}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={openPortal} disabled={loading}
          style={{ height: 42, borderRadius: 8, background: "var(--border-soft)", border: "1px solid var(--border)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1, transition: "background 0.15s" }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "var(--card)"; }}
          onMouseLeave={e => e.currentTarget.style.background = "var(--border-soft)"}>
          {loading ? "Opening…" : "Manage billing →"}
        </button>
        {tier !== "brokerage" && (
          <button style={{ height: 42, borderRadius: 8, background: "var(--accent)", border: "none", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", transition: "opacity 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            Upgrade plan →
          </button>
        )}
        {error && <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#dc2626" }}>{error}</div>}
      </div>
    </div>
  );
}

/* ─── Sidebar ─── */
function SidebarItem({ label, active, onClick, children, indent }) {
  return (
    <button onClick={onClick}
      style={{ display: "block", width: "100%", textAlign: "left", padding: indent ? "8px 20px 8px 32px" : "10px 20px", background: active ? "var(--card)" : "none", border: "none", borderLeft: `2px solid ${active ? "var(--accent)" : "transparent"}`, fontFamily: "var(--font-sans)", fontSize: indent ? 12 : 13, fontWeight: active ? 600 : 400, color: active ? "var(--white)" : "var(--muted)", cursor: "pointer", transition: "color 0.15s, background 0.15s" }}>
      {children || label}
    </button>
  );
}

/* ─── Main ─── */
function Settings({ user, userRow, onSignOut }) {
  const [section, setSection] = useState("account");
  const [profileOpen, setProfileOpen] = useState(false);
  const isAgent = hasFeature(userRow?.tier, "agent");

  const AGENT_SECTIONS = new Set(["profile", "branding", "contact", "train", "team"]);
  const activeIsAgent = AGENT_SECTIONS.has(section);

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

      {/* Sidebar */}
      <div style={{ width: 200, flexShrink: 0, background: "var(--border-soft)", borderRight: "1px solid var(--border)", padding: "24px 0", display: "flex", flexDirection: "column", overflow: "auto" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 20px", marginBottom: 10 }}>Settings</div>

        <SidebarItem label="Account"    active={section === "account"}    onClick={() => setSection("account")} />
        <SidebarItem label="Appearance" active={section === "appearance"} onClick={() => setSection("appearance")} />
        <SidebarItem label="Billing"    active={section === "billing"}    onClick={() => setSection("billing")} />

        {isAgent && (
          <>
            <div style={{ margin: "12px 20px 8px", height: 1, background: "var(--border)" }} />

            {/* Profile dropdown toggle */}
            <button onClick={() => setProfileOpen(o => !o)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", textAlign: "left", padding: "10px 20px", background: "none", border: "none", borderLeft: "2px solid transparent", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: activeIsAgent && section !== "team" ? 600 : 400, color: activeIsAgent && section !== "team" ? "var(--white)" : "var(--muted)", cursor: "pointer", transition: "color 0.15s" }}>
              <span>Profile</span>
              <span style={{ fontSize: 10, transition: "transform 0.15s", display: "inline-block", transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
            </button>

            {/* Sub-items */}
            {profileOpen && PROFILE_ITEMS.map(item => (
              <SidebarItem key={item.id} label={item.label} active={section === item.id} onClick={() => setSection(item.id)} indent />
            ))}

            {/* Manage Users standalone button */}
            <div style={{ margin: "12px 20px 8px", height: 1, background: "var(--border)" }} />
            <SidebarItem label="Manage Users" active={section === "team"} onClick={() => setSection("team")} />
          </>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {section === "account"    && <AccountSection user={user} userRow={userRow} onSignOut={onSignOut} />}
        {section === "appearance" && <AppearanceSection />}
        {section === "billing"    && <BillingSection user={user} userRow={userRow} />}
        {section === "team"       && <TeamView user={user} userRow={userRow} />}
        {PROFILE_ITEMS.some(i => i.id === section) && (
          <AgentSettings key={section} hideSidebar defaultSection={section} user={user} userRow={userRow} />
        )}
      </div>
    </div>
  );
}

export default Settings;
