import { useState } from "react";
import { signIn, signUp } from "../utils/auth.js";
import { supabase } from "../utils/supabase.js";
import "./glass.css";

/* ── Inline icons (no extra deps) ─────────────────────────────── */
const ico = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
const Mail = () => (<svg {...ico}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>);
const Lock = () => (<svg {...ico}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
const Eye = () => (<svg {...ico}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>);
const EyeOff = () => (<svg {...ico}><path d="M9.9 4.2A10.6 10.6 0 0 1 12 4c6.5 0 10 7 10 7a18 18 0 0 1-2.2 3M6.6 6.6A18 18 0 0 0 2 11s3.5 7 10 7a10.6 10.6 0 0 0 4-.8" /><path d="m3 3 18 18" /><path d="M9.5 9.5a3 3 0 0 0 4.2 4.2" /></svg>);
const GoogleMark = () => (
  <svg width="17" height="17" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 7.1 29.5 5 24 5 16.3 5 9.7 9.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.5-5.2l-6.2-5.2C29.2 36 26.7 37 24 37c-5.3 0-9.7-2.6-11.3-7l-6.5 5C9.5 40.6 16.2 45 24 45z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4 5.6l6.2 5.2C40.9 36.6 45 31 45 24c0-1.2-.1-2.3-.4-3.5z" />
  </svg>
);
const AppleMark = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M16.4 12.8c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1 2.8-2.1c.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.4-1-2.2-3.9zM14.3 5.4c.6-.8 1.1-1.9.9-3-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.3-.6 3-1.4z" /></svg>);

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ink = (o) => `rgba(255,255,255,${o})`;

export default function LoginPage() {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(null); // "google" | "apple" | null
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const isSignUp = mode === "signup";
  const emailInvalid = email.length > 0 && !RE_EMAIL.test(email);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null); setNotice(null);
    if (!RE_EMAIL.test(email)) { setError("Enter a valid email address."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (isSignUp && password !== confirm) { setError("Passwords don't match."); return; }

    setLoading(true);
    try {
      if (isSignUp) {
        const data = await signUp(email, password);
        if (!data.session) setEmailSent(true);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function oauth(provider) {
    setError(null); setNotice(null); setBusy(provider);
    try {
      const { error: e } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
      if (e) throw e;
    } catch (err) {
      setError(err.message || `Couldn't continue with ${provider}.`);
      setBusy(null);
    }
  }

  async function forgotPassword() {
    setError(null); setNotice(null);
    if (!RE_EMAIL.test(email)) { setError("Enter your email above first, then tap Forgot password."); return; }
    try {
      const { error: e } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
      if (e) throw e;
      setNotice("Password reset link sent — check your email.");
    } catch (err) {
      setError(err.message || "Couldn't send reset email.");
    }
  }

  function switchMode(next) {
    setMode(next); setError(null); setNotice(null); setEmailSent(false); setPassword(""); setConfirm("");
  }

  const labelStyle = { fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: ink(0.7), marginBottom: 8, display: "block" };

  return (
    <div className="lg-root lg-page">
      {/* Animated backdrop */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="glass-card">
        {/* Logo chip */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <span style={{ width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontWeight: 800, fontSize: 17, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)" }}>V</span>
          <span style={{ fontWeight: 800, fontSize: 17, color: "#fff", letterSpacing: "-0.02em" }}>
            vis<span style={{ fontSize: 11, fontWeight: 400, color: ink(0.5), marginLeft: 2 }}>.realestate</span>
          </span>
        </div>

        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", color: "#fff" }}>
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>
        <p style={{ margin: "6px 0 26px", fontSize: 15, fontWeight: 400, color: ink(0.6) }}>
          {isSignUp ? "Start seeing the market clearly" : "Sign in to continue"}
        </p>

        {emailSent ? (
          <div style={{ textAlign: "center", padding: "6px 0 4px" }}>
            <div style={{ fontSize: 30, marginBottom: 12 }}>📬</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Check your email</div>
            <div style={{ fontSize: 14, color: ink(0.6), lineHeight: 1.6 }}>
              We sent a confirmation link to <strong style={{ color: ink(0.9) }}>{email}</strong>. Click it to activate your account, then come back to sign in.
            </div>
            <button type="button" className="lg-link lg-focusable" onClick={() => switchMode("signin")} style={{ marginTop: 20, fontSize: 14 }}>
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email */}
            <div>
              <label htmlFor="lg-email" style={labelStyle}>Email</label>
              <div className={`glass-field${emailInvalid ? " has-error" : ""}`}>
                <span className="lg-prefix"><Mail /></span>
                <input id="lg-email" className="glass-input" type="email" autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="lg-password" style={labelStyle}>Password</label>
              <div className="glass-field">
                <span className="lg-prefix"><Lock /></span>
                <input id="lg-password" className="glass-input" type={showPw ? "text" : "password"}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                <button type="button" className="lg-suffix lg-focusable" onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  style={{ background: "none", border: "none", cursor: "pointer", color: ink(0.6), padding: 8, display: "flex" }}>
                  {showPw ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Confirm (sign up) */}
            {isSignUp && (
              <div>
                <label htmlFor="lg-confirm" style={labelStyle}>Confirm password</label>
                <div className={`glass-field${confirm.length > 0 && confirm !== password ? " has-error" : ""}`}>
                  <span className="lg-prefix"><Lock /></span>
                  <input id="lg-confirm" className="glass-input" type={showPw ? "text" : "password"} autoComplete="new-password"
                    value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
                </div>
              </div>
            )}

            {/* Remember / forgot (sign in) */}
            {!isSignUp && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: ink(0.7), cursor: "pointer" }}>
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                    style={{ width: 15, height: 15, accentColor: "var(--lg-accent)", cursor: "pointer" }} />
                  Remember me
                </label>
                <button type="button" className="lg-link lg-focusable" onClick={forgotPassword} style={{ fontSize: 13 }}>
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div role="alert" style={{ fontSize: 13, color: "var(--lg-danger)", background: "rgba(220,38,38,0.12)", border: "1px solid rgba(240,146,142,0.4)", borderRadius: 10, padding: "9px 12px" }}>
                {error}
              </div>
            )}
            {notice && !error && (
              <div style={{ fontSize: 13, color: ink(0.85), background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 10, padding: "9px 12px" }}>
                {notice}
              </div>
            )}

            <button type="submit" className="lg-cta lg-focusable" disabled={loading || !email || !password}>
              {loading ? (isSignUp ? "Creating account…" : "Signing in…") : (isSignUp ? "Create account" : "Sign in")}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "2px 0" }}>
              <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.12)" }} />
              <span style={{ fontSize: 12, color: ink(0.5) }}>or continue with</span>
              <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.12)" }} />
            </div>

            {/* Social */}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="lg-chip lg-focusable" onClick={() => oauth("google")} disabled={!!busy} aria-label="Continue with Google">
                <GoogleMark /> Google
              </button>
              <button type="button" className="lg-chip lg-focusable" onClick={() => oauth("apple")} disabled={!!busy} aria-label="Continue with Apple">
                <AppleMark /> Apple
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        {!emailSent && (
          <p style={{ textAlign: "center", margin: "22px 0 0", fontSize: 14, color: ink(0.6) }}>
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button type="button" className="lg-link lg-focusable" onClick={() => switchMode(isSignUp ? "signin" : "signup")} style={{ fontSize: 14 }}>
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
