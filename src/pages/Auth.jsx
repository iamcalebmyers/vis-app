import { useState } from "react";
import { signIn, signUp } from "../utils/auth.js";

const INPUT = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 14px",
  background: "var(--border-soft)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontFamily: "var(--font-sans)",
  fontSize: 14,
  color: "var(--text)",
  outline: "none",
  transition: "border-color 0.15s ease",
};

function Field({ label, type, value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...INPUT, borderColor: focused ? "var(--accent)" : "var(--border)" }}
        autoComplete={type === "password" ? "current-password" : "email"}
      />
    </div>
  );
}

function Auth() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const isSignUp = mode === "signup";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (isSignUp && password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const data = await signUp(email, password);
        if (!data.session) {
          setEmailSent(true);
        }
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(next) {
    setMode(next);
    setError(null);
    setEmailSent(false);
    setPassword("");
    setConfirm("");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 32 }}>
          <span style={{ width: 36, height: 36, borderRadius: 9, background: "var(--accent)", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 15 }}>
            V
          </span>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 24, color: "var(--white)", letterSpacing: "-0.02em" }}>
            vis
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted-faint)", fontWeight: 400, marginLeft: 2 }}>.realestate</span>
          </span>
        </div>

        {/* Card */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "28px 28px 24px" }}>

          {/* Mode tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
            {[["signin", "Sign in"], ["signup", "Sign up"]].map(([id, label]) => (
              <button key={id} type="button" onClick={() => switchMode(id)}
                style={{ flex: 1, padding: "8px 0", background: "none", border: "none", borderBottom: mode === id ? "2px solid var(--accent)" : "2px solid transparent", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: mode === id ? 700 : 400, color: mode === id ? "var(--white)" : "var(--muted)", cursor: "pointer", transition: "color 0.15s ease, border-color 0.15s ease", marginBottom: -1 }}>
                {label}
              </button>
            ))}
          </div>

          {emailSent ? (
            <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>📬</div>
              <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, color: "var(--white)", marginBottom: 8 }}>Check your email</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
                We sent a confirmation link to <strong style={{ color: "var(--text)" }}>{email}</strong>. Click it to activate your account, then come back to sign in.
              </div>
              <button type="button" onClick={() => switchMode("signin")}
                style={{ marginTop: 20, fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>
                Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
              <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
              {isSignUp && (
                <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" />
              )}

              {error && (
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#dc2626", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 6, padding: "8px 12px" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !email || !password}
                style={{ marginTop: 4, height: 42, borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, cursor: loading || !email || !password ? "not-allowed" : "pointer", opacity: loading || !email || !password ? 0.6 : 1, transition: "opacity 0.15s ease" }}>
                {loading ? (isSignUp ? "Creating account…" : "Signing in…") : (isSignUp ? "Create account" : "Sign in")}
              </button>
            </form>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)" }}>
          For informational use only · Not financial or legal advice
        </div>
      </div>
    </div>
  );
}

export default Auth;
