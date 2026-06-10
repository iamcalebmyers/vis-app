import DataCard from "./DataCard.jsx";
import SubscriptionGate from "./SubscriptionGate.jsx";
import { relativeTime } from "../utils/formatters.js";
import { useAgent } from "../utils/AgentContext.jsx";

function AiAvatar({ size = 22, logoUrl, aiName = "Vis" }) {
  if (logoUrl) {
    return (
      <img src={logoUrl} alt={aiName} style={{ width: size, height: size, borderRadius: 5, objectFit: "cover", flexShrink: 0 }} />
    );
  }
  return (
    <span aria-hidden="true" style={{ width: size, height: size, borderRadius: 5, background: "var(--accent)", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 10, lineHeight: 1, flexShrink: 0 }}>
      {aiName[0]?.toUpperCase() || "V"}
    </span>
  );
}

function AiHeader({ aiName = "Vis", logoUrl, createdAt }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
      <AiAvatar aiName={aiName} logoUrl={logoUrl} />
      <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--white)" }}>
        {aiName}
      </span>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted-faint)" }}>
        {createdAt ? relativeTime(createdAt) : "just now"}
      </span>
    </div>
  );
}

function ChatMessage({
  role,
  content,
  text,
  cardType,
  cardData,
  showButton,
  upgradeRequired,
  onGenerateReport,
  createdAt,
  user,
  userRow,
}) {
  const { aiName, logoUrl } = useAgent();
  const isUser = role === "user";
  const body = text ?? content ?? "";
  const hasCard = !isUser && Boolean(cardType);
  const hasGate = !isUser && Boolean(upgradeRequired);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        marginBottom: 20,
      }}
    >
      {!isUser && <AiHeader aiName={aiName} logoUrl={logoUrl} createdAt={createdAt} />}
      <div
        style={{
          maxWidth: isUser ? "72%" : (hasCard || hasGate) ? "92%" : "88%",
          padding: isUser ? "9px 14px" : "12px 14px",
          background: isUser ? "var(--accent)" : "var(--card)",
          border: isUser ? "none" : "1px solid var(--border)",
          borderRadius: isUser ? "14px 14px 4px 14px" : "4px 14px 14px 14px",
          color: isUser ? "#ffffff" : "var(--text)",
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          lineHeight: 1.65,
          boxShadow: isUser ? "none" : "var(--shadow-card)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        <p style={{ margin: 0 }}>{body}</p>
        {hasCard && (
          <DataCard
            type={cardType}
            data={cardData}
            showButton={showButton}
            onGenerateReport={onGenerateReport}
          />
        )}
        {hasGate && (
          <SubscriptionGate
            requiredTier={upgradeRequired}
            user={user}
            userRow={userRow}
          />
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
