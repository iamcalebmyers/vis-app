import TierBadge from "./TierBadge.jsx";

const TABS = [
  { id: "chat", label: "Chat" },
  { id: "reports", label: "Reports" },
  { id: "saved", label: "Saved" },
  { id: "settings", label: "Settings" },
];

function Nav({ active = "chat" }) {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 48,
        padding: "0 20px",
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
        fontFamily: "var(--font-sans)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          aria-hidden="true"
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: "var(--accent)",
            color: "#ffffff",
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: 11,
            lineHeight: 1,
          }}
        >
          V
        </span>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 800,
            fontSize: 16,
            color: "var(--white)",
            letterSpacing: "-0.01em",
            lineHeight: 1,
          }}
        >
          vis
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 400,
              fontSize: 9,
              color: "var(--muted)",
              marginLeft: 1,
              letterSpacing: 0,
            }}
          >
            .realestate
          </span>
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          height: "100%",
          gap: 24,
        }}
      >
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              style={{
                position: "relative",
                background: "transparent",
                border: "none",
                padding: 0,
                color: isActive ? "var(--white)" : "var(--muted)",
                fontFamily: "var(--font-sans)",
                fontWeight: isActive ? 700 : 400,
                fontSize: 14,
                lineHeight: 1,
                cursor: isActive ? "default" : "pointer",
                transition: "color 0.15s ease",
              }}
            >
              {tab.label}
              {isActive && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: -16,
                    height: 2,
                    background: "var(--accent)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <TierBadge />
    </nav>
  );
}

export default Nav;
