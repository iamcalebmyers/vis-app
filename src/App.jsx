function App() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            aria-hidden="true"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--accent)",
              color: "#ffffff",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: 13,
              lineHeight: 1,
            }}
          >
            V
          </span>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 800,
              fontSize: 28,
              color: "var(--white)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            vis
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 400,
                fontSize: 10,
                color: "var(--muted)",
                marginLeft: 2,
                letterSpacing: 0,
              }}
            >
              .realestate
            </span>
          </span>
        </div>

        <p
          style={{
            color: "var(--muted)",
            fontFamily: "var(--font-sans)",
            fontWeight: 400,
            fontSize: 14,
          }}
        >
          See the market clearly
        </p>
      </div>
    </main>
  );
}

export default App;
