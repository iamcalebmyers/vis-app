import { useState, useEffect, useRef } from "react";
import { supabase } from "../utils/supabase.js";
import { hasFeature } from "../utils/tier.js";
import { loadAgentInfo, saveAgentInfo } from "../utils/useAgentInfo.js";

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return "#" + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
}

function hexToHue(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return 0;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return Math.round(h * 360);
}

// Slider range: 0-400. 0-359 = hue, 360-380 = grey, 381-400 = dark/black
function sliderToColor(val) {
  const v = parseInt(val);
  if (v <= 359) return hslToHex(v, 72, 48);
  if (v <= 380) return "#888888";
  return "#1a1a1a";
}

function colorToSlider(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return 0;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max - min < 30) {
    const lum = (r + g + b) / 3;
    return lum < 120 ? 395 : 370;
  }
  return hexToHue(hex);
}

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
};

function Field({ label, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
        {label}
      </label>
      {children}
      {hint && <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted-faint)" }}>{hint}</span>}
    </div>
  );
}

function AgentSettings({ user, userRow }) {
  const tier = userRow?.tier || "solo";
  const canAccess = hasFeature(tier, "agent");

  const [profile, setProfile] = useState(null);
  const [aiName, setAiName] = useState("");
  const [brandColor, setBrandColor] = useState("#DA6B3A");
  const [logoUrl, setLogoUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef();
  const [reportInfo, setReportInfo] = useState(loadAgentInfo);

  useEffect(() => {
    if (!canAccess || !user?.id) return;
    supabase.from("agent_profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setProfile(data);
        setAiName(data.ai_name || "");
        setBrandColor(data.brand_color || "#DA6B3A");
        setLogoUrl(data.logo_url || null);
      }
    });
  }, [user?.id, canAccess]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", brandColor);
  }, [brandColor]);

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Logo must be under 5MB."); return; }

    setUploading(true);
    setError(null);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/logo.${ext}`;

    const { error: upErr } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
    if (upErr) { setError("Upload failed: " + upErr.message); setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(path);
    setLogoUrl(publicUrl);
    setUploading(false);
  }

  async function handleSave() {
    if (!aiName.trim()) { setError("AI name is required."); return; }
    setSaving(true);
    setError(null);

    const updates = {
      user_id: user.id,
      ai_name: aiName.trim(),
      brand_color: brandColor,
      logo_url: logoUrl,
    };

    const { error: saveErr } = profile
      ? await supabase.from("agent_profiles").update(updates).eq("user_id", user.id)
      : await supabase.from("agent_profiles").insert(updates);

    if (saveErr) {
      setError("Save failed: " + saveErr.message);
    } else {
      saveAgentInfo(reportInfo);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  if (!canAccess) {
    return (
      <div style={{ maxWidth: 560, margin: "60px auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18, color: "var(--white)", marginBottom: 10 }}>
          Agent settings
        </div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
          Custom AI name, logo, brand color, and subdomain are available on the Agent plan and above.
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 20, color: "var(--white)", marginBottom: 32 }}>
        Settings
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Handle */}
        {profile?.handle && (
          <Field label="Your subdomain" hint="This cannot be changed after it's claimed.">
            <div style={{ ...INPUT, background: "var(--card)", color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: "var(--white)", fontFamily: "var(--font-mono)", fontSize: 13 }}>{profile.handle}</span>
              <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 13 }}>.vis.realestate</span>
            </div>
          </Field>
        )}

        {/* AI Name */}
        <Field label="AI name" hint="The name your clients see — e.g. 'Alex', 'Max', 'The Jones Team AI'">
          <input
            value={aiName}
            onChange={e => setAiName(e.target.value)}
            placeholder="e.g. Alex"
            maxLength={40}
            style={{ ...INPUT, borderColor: "var(--border)" }}
          />
        </Field>

        {/* Brand color */}
        <Field label="Brand color" hint="Used on buttons, highlights, and accents across your branded experience.">
          <style>{`
            .hue-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 28px; border-radius: 14px; outline: none; cursor: pointer; background: linear-gradient(to right, #ff0000 0%, #ffff00 20%, #00ff00 40%, #00ffff 52%, #0000ff 65%, #ff00ff 89%, #888888 91%, #888888 94.5%, #444444 97%, #1a1a1a 100%); border: 1px solid var(--border); }
            .hue-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 26px; height: 26px; border-radius: 50%; background: ${brandColor}; border: 3px solid #fff; box-shadow: 0 1px 6px rgba(0,0,0,0.35); cursor: pointer; }
            .hue-slider::-moz-range-thumb { width: 22px; height: 22px; border-radius: 50%; background: ${brandColor}; border: 3px solid #fff; box-shadow: 0 1px 6px rgba(0,0,0,0.35); cursor: pointer; }
          `}</style>
          <input
            type="range"
            min={0}
            max={400}
            value={colorToSlider(brandColor)}
            onChange={e => setBrandColor(sliderToColor(e.target.value))}
            className="hue-slider"
          />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
            <input
              value={brandColor}
              onChange={e => setBrandColor(e.target.value)}
              placeholder="#DA6B3A"
              maxLength={7}
              style={{ ...INPUT, width: 120, fontFamily: "var(--font-mono)", fontSize: 13 }}
            />
            <div style={{ width: 44, height: 44, borderRadius: 8, background: brandColor, border: "1px solid var(--border)", flexShrink: 0 }} />
          </div>
        </Field>

        {/* Logo */}
        <Field label="Logo" hint="Square image recommended. PNG or JPG, max 5MB.">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", display: "grid", placeItems: "center", flexShrink: 0, overflow: "hidden" }}>
              {logoUrl
                ? <img src={logoUrl} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 20, color: brandColor }}>
                    {aiName ? aiName[0].toUpperCase() : "?"}
                  </span>
              }
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ height: 36, padding: "0 16px", borderRadius: 7, background: "var(--card)", border: "1px solid var(--border)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--white)", cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.6 : 1 }}>
                {uploading ? "Uploading…" : logoUrl ? "Replace logo" : "Upload logo"}
              </button>
              {logoUrl && (
                <button onClick={() => setLogoUrl(null)}
                  style={{ height: 28, padding: "0 12px", borderRadius: 6, background: "transparent", border: "none", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", cursor: "pointer", textAlign: "left" }}>
                  Remove
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={handleLogoUpload} />
          </div>
        </Field>

        {/* Report contact info */}
        <div style={{ paddingTop: 24, borderTop: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, color: "var(--white)", marginBottom: 4 }}>
            Report contact info
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>
            Auto-fills the header on every report. Still editable per-report.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { key: "name", label: "Full name", placeholder: "Your full name" },
              { key: "brokerage", label: "Brokerage", placeholder: "Brokerage name" },
              { key: "license", label: "License #", placeholder: "License number" },
              { key: "phone", label: "Phone", placeholder: "(555) 000-0000" },
              { key: "email", label: "Email", placeholder: "you@example.com" },
            ].map(({ key, label, placeholder }) => (
              <Field key={key} label={label}>
                <input
                  value={reportInfo[key]}
                  onChange={e => setReportInfo(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={{ ...INPUT, borderColor: "var(--border)" }}
                />
              </Field>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#dc2626", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 6, padding: "8px 12px" }}>
            {error}
          </div>
        )}

        <button onClick={handleSave} disabled={saving || uploading}
          style={{ height: 42, borderRadius: 8, background: saved ? "#16a34a" : "var(--accent)", border: "none", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "#fff", cursor: saving || uploading ? "not-allowed" : "pointer", opacity: saving || uploading ? 0.7 : 1, transition: "background 0.2s ease" }}>
          {saving ? "Saving…" : saved ? "Saved!" : "Save settings"}
        </button>
      </div>
    </div>
  );
}

export default AgentSettings;
