import { useEffect, useState, useRef } from "react";
import Nav from "../components/Nav.jsx";
import ChatThread from "../components/ChatThread.jsx";
import ChatInput from "../components/ChatInput.jsx";
import SessionSidebar from "../components/SessionSidebar.jsx";
import PropertyReport from "./PropertyReport.jsx";
import MarketReport from "./MarketReport.jsx";
import InvestorReport from "./InvestorReport.jsx";
import Settings from "./Settings.jsx";
import ReportTemplates from "./ReportTemplates.jsx";
import OverageModal from "../components/OverageModal.jsx";
import { sendMessage } from "../utils/claudeApi.js";
import { useAgent } from "../utils/AgentContext.jsx";
import { loadAgentInfo } from "../utils/useAgentInfo.js";
import { hasFeature, INVESTOR_CARD_TYPES, usagePct } from "../utils/tier.js";
import {
  loadSessions,
  saveSession,
  makeSessionName,
} from "../utils/sessions.js";
import {
  loadClientSessions,
  loadClientMessages,
  saveClientSession,
  appendClientMessage,
} from "../utils/clientSessions.js";
import { DEMO_MESSAGES } from "../data/demoMessages.js";

const NAV_HEIGHT = 48;

function loadInitialMessages() {
  if (typeof window === "undefined") return [];
  if (window.location.hash === "#demo") {
    return DEMO_MESSAGES.map((m) => ({
      ...m,
      createdAt: m.createdAt ?? Date.now(),
    }));
  }
  return [];
}

function Hero({ isAgentDomain, aiName, logoUrl, greeting, localLogoUrl }) {
  // On agent subdomain: use subdomain branding. On vis.realestate: use locally saved logo/greeting if set.
  const effectiveLogo = isAgentDomain ? logoUrl : localLogoUrl;
  const effectiveGreeting = isAgentDomain ? null : greeting; // subdomains handle greeting separately

  const logo = isAgentDomain ? (
    effectiveLogo
      ? <img src={effectiveLogo} alt={aiName} style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover" }} />
      : <span aria-hidden="true" style={{ width: 40, height: 40, borderRadius: 10, background: "var(--accent)", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 18, lineHeight: 1 }}>{aiName[0]?.toUpperCase() || "A"}</span>
  ) : (
    <img src={effectiveLogo || "/vis-logo.png"} alt="Vis" style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover" }} />
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {logo}
        <span style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 36, color: "var(--white)", letterSpacing: "-0.02em", lineHeight: 1 }}>
          {isAgentDomain ? aiName : (
            <>vis<span style={{ fontFamily: "var(--font-mono)", fontWeight: 400, fontSize: 12, color: "var(--muted-faint)", marginLeft: 2, letterSpacing: 0 }}>.realestate</span></>
          )}
        </span>
      </div>
      {(effectiveGreeting || (!isAgentDomain && !effectiveGreeting)) && (
        <p style={{ color: "var(--muted)", fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: 16 }}>
          {effectiveGreeting || "See the market clearly"}
        </p>
      )}
    </div>
  );
}

function toApiMessages(messages) {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}

function Chat({ user, userRow, onSignOut, onRefreshUser, isClient, clientProfile }) {
  const agentCtx = useAgent();
  const [sessions, setSessions] = useState(() => isClient ? [] : loadSessions());
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState(loadInitialMessages);
  const [typing, setTyping] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [showOverageModal, setShowOverageModal] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const pendingMessageRef = useRef(null);

  // Load client sessions from Supabase
  useEffect(() => {
    if (!isClient || !clientProfile?.id) return;
    loadClientSessions(clientProfile.id).then(setSessions);
  }, [isClient, clientProfile?.id]);

  const tier = userRow?.tier || "solo";
  const pct = usagePct(userRow?.usage_current, userRow?.usage_limit);
  const atLimit = userRow?.usage_limit && (userRow?.usage_current || 0) >= userRow.usage_limit;

  const hasContent = messages.length > 0 || typing;

  useEffect(() => {
    if (!activeSession || messages.length === 0 || isClient) return;
    const updated = { ...activeSession, messages, updatedAt: Date.now() };
    saveSession(updated);
    setSessions(loadSessions());
  }, [activeSession, messages, isClient]);

  function handleNewChat() {
    setActiveSession(null);
    setMessages([]);
    setTyping(false);
    setActiveReport(null);
  }

  async function handleSelectSession(id) {
    if (isClient) {
      const msgs = await loadClientMessages(id);
      setMessages(msgs.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        cardType: m.card_type || null,
        cardData: m.card_data || null,
        showButton: m.card_type === "property" || m.card_type === "market" || m.card_type === "deal",
        createdAt: new Date(m.created_at).getTime(),
      })));
      setActiveSession({ id, name: sessions.find(s => s.id === id)?.name || "Chat", createdAt: Date.now() });
      setTyping(false);
      setActiveReport(null);
      return;
    }
    const found = sessions.find((s) => s.id === id);
    if (!found) return;
    setActiveSession({ id: found.id, name: found.name, createdAt: found.createdAt });
    setMessages(found.messages || []);
    setTyping(false);
    setActiveReport(null);
  }

  function handleGenerateReport(type, data) {
    setActiveReport({ type, data });
  }

  function handleCloseReport() {
    setActiveReport(null);
  }

  async function doSend(text) {
    let session = activeSession;
    if (!session) {
      session = {
        id: crypto.randomUUID(),
        name: makeSessionName(text),
        createdAt: Date.now(),
      };
      setActiveSession(session);
    }

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setTyping(true);

    // For clients: create session in Supabase on first message
    if (isClient && clientProfile && !activeSession) {
      await saveClientSession(session, clientProfile.id, clientProfile.agent_id);
    }

    try {
      const agentTraining = [agentCtx.trainingText, agentCtx.trainingDocText].filter(Boolean).join("\n\n") || null;
      const { reply, card } = await sendMessage(toApiMessages(next), {
        userId: user?.id,
        aiName: agentCtx.aiName,
        agentTraining,
        brokerageTraining: agentCtx.brokerageTraining,
      });

      // Feature gate: investor cards require investor+ tier
      const isInvestorCard = card?.type && INVESTOR_CARD_TYPES.has(card.type);
      const canSeeCard = !isClient && (!isInvestorCard || hasFeature(tier, "investor"));

      const aiMsg = {
        id: crypto.randomUUID(),
        role: "ai",
        content: reply,
        cardType: canSeeCard ? (card?.type || null) : null,
        cardData: canSeeCard ? (card?.data || null) : null,
        showButton: canSeeCard && (card?.type === "property" || card?.type === "market" || card?.type === "deal"),
        upgradeRequired: !canSeeCard && isInvestorCard ? "investor" : null,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Save to Supabase for clients
      if (isClient && clientProfile) {
        await appendClientMessage(userMsg, session.id);
        await appendClientMessage(aiMsg, session.id);
        await saveClientSession(session, clientProfile.id, clientProfile.agent_id);
        loadClientSessions(clientProfile.id).then(setSessions);
      }

      if (onRefreshUser) onRefreshUser();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "ai",
          content: `Sorry — something went wrong reaching the server.\n\n${err?.message || "Unknown error"}`,
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  function handleSend(text) {
    if (atLimit) {
      pendingMessageRef.current = text;
      setShowOverageModal(true);
      return;
    }
    doSend(text);
  }

  function handleOverageConfirm() {
    setShowOverageModal(false);
    const text = pendingMessageRef.current;
    pendingMessageRef.current = null;
    if (text) doSend(text);
  }

  function handleOverageCancel() {
    setShowOverageModal(false);
    pendingMessageRef.current = null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--bg)",
      }}
    >
      {showOverageModal && (
        <OverageModal
          overageRate={userRow?.overage_rate}
          onConfirm={handleOverageConfirm}
          onCancel={handleOverageCancel}
        />
      )}
      <Nav active={activeTab} onTabChange={setActiveTab} userEmail={user?.email} onSignOut={onSignOut} userRow={userRow} isClient={isClient} />
      {pct >= 80 && pct < 100 && (
        <div style={{ background: "rgba(245,158,11,0.1)", borderBottom: "1px solid rgba(245,158,11,0.3)", padding: "7px 24px", fontFamily: "var(--font-sans)", fontSize: 12, color: "#f59e0b", display: "flex", alignItems: "center", gap: 8 }}>
          <span>You've used {pct}% of your monthly AI queries.</span>
          <span style={{ color: "var(--muted)" }}>Upgrade your plan for a higher limit.</span>
        </div>
      )}
      {pct >= 100 && (
        <div style={{ background: "rgba(220,38,38,0.1)", borderBottom: "1px solid rgba(220,38,38,0.3)", padding: "7px 24px", fontFamily: "var(--font-sans)", fontSize: 12, color: "#dc2626", display: "flex", alignItems: "center", gap: 8 }}>
          <span>Monthly query limit reached. Additional queries will be billed as overage.</span>
        </div>
      )}

      {activeTab === "settings" && (
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Settings user={user} userRow={userRow} onSignOut={onSignOut} />
        </div>
      )}

      {activeTab === "reports" && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <ReportTemplates user={user} userRow={userRow} />
        </div>
      )}

      {activeTab === "chat" && <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <SessionSidebar
          sessions={sessions}
          activeId={activeSession?.id || null}
          onSelect={handleSelectSession}
          onNew={handleNewChat}
        />

        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {activeReport ? (
            activeReport.type === "property" ? (
              <PropertyReport
                data={activeReport.data}
                onBack={handleCloseReport}
                user={user}
                userRow={userRow}
              />
            ) : activeReport.type === "market" ? (
              <MarketReport
                data={activeReport.data}
                onBack={handleCloseReport}
                user={user}
                userRow={userRow}
              />
            ) : activeReport.type === "deal" ? (
              <InvestorReport
                data={activeReport.data}
                onBack={handleCloseReport}
                user={user}
                userRow={userRow}
              />
            ) : null
          ) : hasContent ? (
            <>
              <ChatThread
                messages={messages}
                typing={typing}
                session={activeSession}
                onGenerateReport={handleGenerateReport}
              />
              <div
                style={{
                  padding: "12px 32px 20px",
                  background: "var(--bg)",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <ChatInput
                  onSend={handleSend}
                  disabled={typing}
                  autoFocus={false}
                />
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 32,
                padding: "40px 32px",
              }}
            >
              {(() => { const ai = loadAgentInfo(); return (
                <Hero
                  isAgentDomain={agentCtx.isAgentDomain}
                  aiName={agentCtx.aiName}
                  logoUrl={agentCtx.logoUrl}
                  greeting={ai.greeting}
                  localLogoUrl={ai.logoUrl}
                />
              ); })()}
              <div style={{ width: "100%", maxWidth: 760 }}>
                <ChatInput onSend={handleSend} disabled={false} autoFocus />
              </div>
              <button
                onClick={() => setMessages(DEMO_MESSAGES.map(m => ({ ...m, createdAt: m.createdAt ?? Date.now() })))}
                style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted-faint)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", textDecoration: "underline" }}
              >
                Load test cards
              </button>
            </div>
          )}
        </div>
      </div>}
    </div>
  );
}

export default Chat;
