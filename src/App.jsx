import { useState, useEffect } from "react";
import Chat from "./pages/Chat.jsx";
import Auth from "./pages/Auth.jsx";
import Onboarding, { HandleStep } from "./pages/Onboarding.jsx";
import { supabase } from "./utils/supabase.js";
import { signOut } from "./utils/auth.js";

function App() {
  const [session, setSession] = useState(undefined);
  const [userRow, setUserRow] = useState(undefined);
  const [clientProfile, setClientProfile] = useState(undefined);
  const [checkoutState, setCheckoutState] = useState(null); // null | "verifying" | "handle" | "done"
  const [verifiedTier, setVerifiedTier] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const sessionId = params.get("session_id");

    if (checkout === "success" && sessionId) {
      setCheckoutState("verifying");
      fetch("/api/verify-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
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
      if (data.session) fetchUserRow(data.session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess) fetchUserRow(sess.user.id);
      else setUserRow(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserRow(userId) {
    const { data: cp } = await supabase.from("client_profiles").select("*").eq("user_id", userId).maybeSingle();
    if (cp) {
      setClientProfile(cp);
      setUserRow(null);
      return;
    }
    setClientProfile(null);
    const { data } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
    setUserRow(data || null);
  }

  // Loading
  if (session === undefined || (session && userRow === undefined && clientProfile === undefined) || checkoutState === "verifying") {
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

  return <Chat user={session.user} userRow={userRow} onSignOut={signOut} onRefreshUser={() => fetchUserRow(session.user.id)} />;
}

export default App;
