// Session 8: ring + score + label + reason, accent color always.
// Session 11 wires color logic (great/good = accent, fair = warning,
// overpriced/avoid = muted-red).

const SIZE = 140;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function VisScore({ score = 0, label = "", reason = "" }) {
  const clamped = Math.max(0, Math.min(100, score));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <section
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--muted)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        Vis Property Score
      </span>

      <div
        style={{
          position: "relative",
          width: SIZE,
          height: SIZE,
        }}
      >
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="var(--border)"
            strokeWidth={STROKE}
            fill="none"
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="var(--accent)"
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 40,
            fontWeight: 800,
            color: "var(--white)",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {clamped}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--accent)",
            letterSpacing: "-0.01em",
            lineHeight: 1,
          }}
        >
          {label}
        </span>
        {reason && (
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              color: "var(--muted)",
              maxWidth: 480,
              lineHeight: 1.5,
            }}
          >
            {reason}
          </p>
        )}
      </div>
    </section>
  );
}

export default VisScore;
