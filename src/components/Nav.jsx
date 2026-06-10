import { useState } from "react";
import TierBadge from "./TierBadge.jsx";
import ThemeSwitcher from "./ThemeSwitcher.jsx";
import UsageBar from "./UsageBar.jsx";
import { useAgent } from "../utils/AgentContext.jsx";

const TABS = [
  { id: "chat", label: "Chat" },
  { id: "reports", label: "Reports" },
  { id: "saved", label: "Saved" },
  { id: "settings", label: "Settings" },
];

function LiveIndicator() {
  return (
    <div
      title="Live"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "var(--accent)",
          boxShadow: "0 0 0 3px var(--accent-soft)",
        }}
      />
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 700,
          color: "var(--accent)",
          letterSpacing: "0.1em",
        }}
      >
        LIVE
      </span>
    </div>
  );
}

function Tab({ tab, isActive, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "transparent",
        border: "none",
        padding: "6px 14px",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: isActive ? 600 : 400,
        color: isActive
          ? "var(--white)"
          : hover
            ? "var(--white)"
            : "var(--muted)",
        borderBottom: isActive
          ? "2px solid var(--accent)"
          : "2px solid transparent",
        cursor: isActive ? "default" : "pointer",
        transition: "color 0.15s ease",
      }}
    >
      {tab.label}
    </button>
  );
}

function SignOutButton({ email, onSignOut }) {
  const [hover, setHover] = useState(false);
  if (!onSignOut) return null;
  return (
    <button type="button" onClick={onSignOut}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={email ? `Signed in as ${email}` : "Sign out"}
      style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: hover ? "var(--white)" : "var(--muted)", transition: "color 0.15s ease", padding: "4px 8px" }}>
      Sign out
    </button>
  );
}

function Nav({ active = "chat", onTabChange, userEmail, onSignOut, userRow, isClient }) {
  const { isAgentDomain, aiName, logoUrl } = useAgent();
  const visibleTabs = isClient ? TABS.filter(t => t.id === "chat") : TABS;

  const logoMark = isAgentDomain ? (
    logoUrl
      ? <img src={logoUrl} alt={aiName} style={{ width: 26, height: 26, borderRadius: 6, objectFit: "cover" }} />
      : <span aria-hidden="true" style={{ width: 26, height: 26, borderRadius: 6, background: "var(--accent)", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 12, lineHeight: 1 }}>{aiName[0]?.toUpperCase() || "A"}</span>
  ) : (
    <img src="/vis-logo.png" alt="Vis" style={{ width: 26, height: 26, borderRadius: 6, objectFit: "cover" }} />
  );

  const wordmark = isAgentDomain ? (
    <span style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 15, color: "var(--white)", letterSpacing: "-0.02em", lineHeight: 1 }}>{aiName}</span>
  ) : (
    <>
      <span style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 15, color: "var(--white)", letterSpacing: "-0.02em", lineHeight: 1 }}>vis</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-faint)", lineHeight: 1 }}>.realestate</span>
    </>
  );

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 48,
        padding: "0 24px",
        background: "var(--nav-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        fontFamily: "var(--font-sans)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {logoMark}
        {wordmark}
      </div>

      <div style={{ display: "flex", gap: 2 }}>
        {visibleTabs.map((tab) => (
          <Tab
            key={tab.id}
            tab={tab}
            isActive={active === tab.id}
            onClick={() => onTabChange && onTabChange(tab.id)}
          />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {!isAgentDomain && !isClient && <UsageBar userRow={userRow} />}
        <ThemeSwitcher />
        {!isAgentDomain && !isClient && <TierBadge tier={userRow?.tier} />}
        <LiveIndicator />
        <SignOutButton email={userEmail} onSignOut={onSignOut} />
      </div>
    </nav>
  );
}

export default Nav;
