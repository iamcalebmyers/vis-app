import { useState, useEffect, useRef } from "react";
import Chat from "./pages/Chat.jsx";
import Auth from "./pages/Auth.jsx";
import Onboarding, { HandleStep } from "./pages/Onboarding.jsx";
import SharedReport from "./pages/SharedReport.jsx";
import Admin from "./pages/Admin.jsx";
import { supabase } from "./utils/supabase.js";
import { signOut } from "./utils/auth.js";
import { hasFeature } from "./utils/tier.js";
import { loadAgentInfo, saveAgentInfo } from "./utils/useAgentInfo.js";

function App() {
  // Admin panel — separate auth, no Supabase session required
  const path = window.location.pathname;
  if (path === "/admin" || path.startsWith("/admin/")) return <Admin />;

  // Public report view — no auth required
  if (path.startsWith("/report/")) {
    const token = path.slice("/report/".length).split("/")[0];
    if (token) return <SharedReport token={token} />;
  }

  const [session, setSession] = useState(undefined);
  const [userRow, setUserRow] = useState(undefined);
  const [userLoading, setUserLoading] = useState(true);
  const userRowRef = useRef(undefined); // current loaded row, for stale-free reads
  const [clientProfile, setClientProfile] = useState(undefined);
  const [checkoutState, setCheckoutState] = useState(null); // null | "verifying" | "handle" | "done"
  const [verifiedTier, setVerifiedTier] = useState(null);
  const [agentLogo, setAgentLogo] = useState(() => loadAgentInfo().logoUrl || null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const sessionId = params.get("session_id");
    const topup = params.get("topup");

    // Returning from a usage top-up purchase. The Stripe webhook credits the
    // balance; refresh the user row shortly after so the new balance shows.
    if (topup) {
      window.history.replaceState({}, "", "/");
      if (topup === "success") {
        setTimeout(() => {
          supabase.auth.getSession().then(({ data }) => {
            if (data.session) fetchUserRow(data.session.user.id);
          });
        }, 3000);
      }
    }

    if (checkout === "success" && sessionId) {
      setCheckoutState("verifying");
      fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", sessionId }),
      })
        .then(r => r.json())
        .then(async data => {
          if (data.tier) {
            // Write tier to DB using the authenticated client session (bypasses service role key issues)
            const { data: sessionData } = await supabase.auth.getSession();
            const uid = sessionData?.session?.user?.id;
            if (uid) {
              const { error: saveErr } = await supabase.from("users").upsert({
                id: uid,
                tier: data.tier,
                stripe_customer_id: data.stripeCustomerId,
                stripe_subscription_id: data.stripeSubscriptionId,
                onboarding_complete: !data.needsHandle,
              });
              if (saveErr) console.error("Client-side tier save failed:", saveErr.message);
            }
            setVerifiedTier(data.tier);
            setCheckoutState(data.needsHandle ? "handle" : "done");
          } else {
            setCheckoutState(null);
          }
          window.history.replaceState({}, "", "/");
        })
        .catch(() => {
          setCheckoutState(null);
          window.history.replaceState({}, "", "/");
        });
    } else if (checkout === "cancel") {
      window.history.replaceState({}, "", "/");
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        try { localStorage.setItem("vis-uid", data.session.user.id); } catch { /* ignore */ }
        fetchUserRow(data.session.user.id);
      } else {
        setUserLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess) {
        try { localStorage.setItem("vis-uid", sess.user.id); } catch { /* ignore */ }
        fetchUserRow(sess.user.id);
      } else {
        try { localStorage.removeItem("vis-uid"); } catch { /* ignore */ }
        userRowRef.current = null;
        setUserRow(null);
        setUserLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserRow(userId) {
    // Only drive the full-screen loading state on the *initial* load (before we
    // have a real account row). Background refreshes (chat, top-up) update in place.
    const firstLoad = !userRowRef.current?.id;
    if (firstLoad) setUserLoading(true);

    const { data: cp } = await supabase.from("client_profiles").select("*").eq("user_id", userId).maybeSingle();
    if (cp) {
      setClientProfile(cp);
      userRowRef.current = null;
      setUserRow(null);
      if (firstLoad) setUserLoading(false);
      return;
    }
    setClientProfile(null);

    let { data } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
    // Right after login the auth session is still settling, so the first read can
    // come back empty for an existing user. Retry once before concluding no row.
    if (!data) {
      await new Promise((r) => setTimeout(r, 500));
      ({ data } = await supabase.from("users").select("*").eq("id", userId).maybeSingle());
    }
    // Never let a racing/empty read overwrite an already-loaded account row.
    const next = data || (userRowRef.current?.id ? userRowRef.current : null);
    userRowRef.current = next;
    setUserRow(next);
    if (firstLoad) setUserLoading(false);
    if (data && hasFeature(data.tier, "agent")) fetchAgentLogo(userId, data.tier);
  }

  // Pull the agent/brokerage logo from Supabase so the nav logo is consistent across devices.
  async function fetchAgentLogo(userId, tier) {
    try {
      let logo = null;
      if (tier === "brokerage") {
        const { data: bp } = await supabase.from("brokerage_profiles").select("logo_url").eq("user_id", userId).maybeSingle();
        logo = bp?.logo_url || null;
      }
      if (!logo) {
        const { data: ap } = await supabase.from("agent_profiles").select("logo_url").eq("user_id", userId).maybeSingle();
        logo = ap?.logo_url || null;
      }
      setAgentLogo(logo);
      if (logo) saveAgentInfo({ ...loadAgentInfo(), logoUrl: logo });
    } catch {}
  }

  // Loading
  if (session === undefined || (session && userLoading) || checkoutState === "verifying") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {checkoutState === "verifying" ? "Verifying payment…" : "Loading…"}
        </span>
      </div>
    );
  }

  if (!session) return <Auth />;

  // Client account — skip onboarding, show stripped-down chat
  if (clientProfile) {
    return <Chat user={session.user} clientProfile={clientProfile} isClient onSignOut={signOut} />;
  }

  // Returning from Stripe — handle claim step for Agent/Brokerage
  if (checkoutState === "handle") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
        <div style={{ width: "100%", maxWidth: 480, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 32 }}>
          <HandleStep
            user={session.user}
            tier={verifiedTier}
            onDone={() => {
              setCheckoutState("done");
              fetchUserRow(session.user.id);
            }}
          />
        </div>
      </div>
    );
  }

  // Onboarding not complete
  if (!userRow?.onboarding_complete && checkoutState !== "done") {
    return <Onboarding user={session.user} onComplete={() => fetchUserRow(session.user.id)} />;
  }

  return <Chat user={session.user} userRow={userRow} agentLogo={agentLogo} onSignOut={signOut} onRefreshUser={() => fetchUserRow(session.user.id)} />;
}

export default App;
