import { useState, useEffect, useRef } from "react";
import { supabase } from "../utils/supabase.js";
import { hasFeature } from "../utils/tier.js";
import { loadAgentInfo, saveAgentInfo } from "../utils/useAgentInfo.js";

const WHEEL = 220;
const DEFAULT_COLOR = "#DA6B3A";

function getContrastColor(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return "#fff";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const toLinear = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return L > 0.179 ? "#000" : "#fff";
}

function hsvToRgb(h, s, v) {
  s /= 100; v /= 100;
  const k = n => (n + h / 60) % 6;
  const f = n => v * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
  return [Math.round(f(5) * 255), Math.round(f(3) * 255), Math.round(f(1) * 255)];
}

function hsvToHex(h, s, v) {
  const [r, g, b] = hsvToRgb(h, s, v);
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

function hexToHsv(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return [0, 0, 100];
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d % 6) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    if (h < 0) h += 1;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
}

function ColorWheel({ color, onChange }) {
  const canvasRef = useRef(null);
  const dragging = useRef(false);
  const [hsv, setHsv] = useState(() => hexToHsv(color));
  const R = WHEEL / 2;

  // Sync wheel when hex is typed manually
  const lastColor = useRef(color);
  useEffect(() => {
    if (color !== lastColor.current) {
      lastColor.current = color;
      setHsv(hexToHsv(color));
    }
  }, [color]);

  // Draw hue/sat wheel at current brightness
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const size = WHEEL * dpr;
    canvas.width = size;
    canvas.height = size;
    const r = size / 2;

    // Render full square of color data into an offscreen canvas
    const off = document.createElement("canvas");
    off.width = size; off.height = size;
    const offCtx = off.getContext("2d");
    const img = offCtx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - r, dy = y - r;
        const h = ((Math.atan2(dy, dx) * 180 / Math.PI) + 360) % 360;
        const s = Math.min((Math.sqrt(dx * dx + dy * dy) / r) * 100, 100);
        const [rv, g, b] = hsvToRgb(h, s, hsv[2]);
        const i = (y * size + x) * 4;
        img.data[i] = rv; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
      }
    }
    offCtx.putImageData(img, 0, 0);

    // Clip to circle on the main canvas — browser handles anti-aliasing
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath();
    ctx.arc(r, r, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(off, 0, 0);
    ctx.restore();
  }, [hsv[2]]);

  function pick(clientX, clientY) {
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = ((clientX - rect.left) / rect.width) * WHEEL;
    const cy = ((clientY - rect.top) / rect.height) * WHEEL;
    const dx = cx - R, dy = cy - R;
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), R - 1);
    const h = Math.round(((Math.atan2(dy, dx) * 180 / Math.PI) + 360) % 360);
    const s = Math.round((dist / R) * 100);
    const next = [h, s, hsv[2]];
    setHsv(next);
    lastColor.current = hsvToHex(h, s, hsv[2]);
    onChange(lastColor.current);
  }

  function onBrightness(v) {
    const next = [hsv[0], hsv[1], v];
    setHsv(next);
    lastColor.current = hsvToHex(hsv[0], hsv[1], v);
    onChange(lastColor.current);
  }

  const angle = hsv[0] * Math.PI / 180;
  const idist = (hsv[1] / 100) * (R - 2);
  const ix = R + idist * Math.cos(angle);
  const iy = R + idist * Math.sin(angle);
  const pureColor = hsvToHex(hsv[0], hsv[1], 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      {/* Wheel */}
      <div style={{ position: "relative", width: WHEEL, height: WHEEL }}>
        <div
          style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", cursor: "crosshair", boxShadow: "0 2px 12px rgba(0,0,0,0.25)" }}
          onMouseDown={e => { dragging.current = true; pick(e.clientX, e.clientY); }}
          onMouseMove={e => { if (dragging.current) pick(e.clientX, e.clientY); }}
          onMouseUp={() => { dragging.current = false; }}
          onMouseLeave={() => { dragging.current = false; }}
          onTouchStart={e => { e.preventDefault(); pick(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchMove={e => { e.preventDefault(); pick(e.touches[0].clientX, e.touches[0].clientY); }}
        >
          <canvas ref={canvasRef} width={WHEEL} height={WHEEL} style={{ display: "block", width: "100%", height: "100%" }} />
        </div>
        {/* Indicator — outside the clipped div so it's never cut off */}
        <div style={{ position: "absolute", left: ix, top: iy, width: 18, height: 18, borderRadius: "50%", border: "3px solid #fff", boxShadow: "0 1px 5px rgba(0,0,0,0.45)", transform: "translate(-50%,-50%)", pointerEvents: "none", background: color }} />
      </div>

      {/* Brightness slider */}
      <style>{`
        .brt-slider{-webkit-appearance:none;appearance:none;width:100%;height:18px;border-radius:9px;outline:none;cursor:pointer;border:1px solid var(--border);background:linear-gradient(to right,#000,${pureColor})}
        .brt-slider::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,0.35);cursor:pointer}
        .brt-slider::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,0.35);cursor:pointer}
      `}</style>
      <div style={{ width: "100%" }}>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>Brightness</div>
        <input type="range" min={0} max={100} value={hsv[2]} onChange={e => onBrightness(parseInt(e.target.value))} className="brt-slider" />
      </div>
    </div>
  );
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
    document.documentElement.style.setProperty("--accent-text", getContrastColor(brandColor));
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
          <ColorWheel color={brandColor} onChange={setBrandColor} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <input
              value={brandColor}
              onChange={e => setBrandColor(e.target.value)}
              placeholder="#DA6B3A"
              maxLength={7}
              style={{ ...INPUT, width: 120, fontFamily: "var(--font-mono)", fontSize: 13 }}
            />
            <div style={{ width: 40, height: 40, borderRadius: 8, background: brandColor, border: "1px solid var(--border)", flexShrink: 0 }} />
            {brandColor.toLowerCase() !== DEFAULT_COLOR.toLowerCase() && (
              <button onClick={() => setBrandColor(DEFAULT_COLOR)}
                style={{ height: 36, padding: "0 12px", borderRadius: 7, background: "transparent", border: "1px solid var(--border)", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", cursor: "pointer", whiteSpace: "nowrap" }}>
                Reset
              </button>
            )}
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
          style={{ height: 42, borderRadius: 8, background: saved ? "#16a34a" : "var(--accent)", border: "none", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: saved ? "#fff" : "var(--accent-text)", cursor: saving || uploading ? "not-allowed" : "pointer", opacity: saving || uploading ? 0.7 : 1, transition: "background 0.2s ease, color 0.2s ease" }}>
          {saving ? "Saving…" : saved ? "Saved!" : "Save settings"}
        </button>
      </div>
    </div>
  );
}

export default AgentSettings;
