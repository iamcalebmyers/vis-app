import { useState, useEffect, useRef, useCallback } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { supabase } from "../utils/supabase.js";
import { hasFeature } from "../utils/tier.js";
import { loadAgentInfo, saveAgentInfo } from "../utils/useAgentInfo.js";
import TrainAI from "./TrainAI.jsx";
import TeamView from "./TeamView.jsx";

/* ─── Logo cropper modal ─── */
function LogoCropper({ src, onDone, onCancel }) {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    const side = Math.round(Math.min(width, height) * 0.8);
    const x = Math.round((width - side) / 2);
    const y = Math.round((height - side) / 2);
    const px = { unit: "px", x, y, width: side, height: side };
    setCrop(px);
    setCompletedCrop(px);
  }

  async function handleApply() {
    const image = imgRef.current;
    const c = completedCrop;
    if (!image || !c?.width || !c?.height) return;
    const canvas = document.createElement("canvas");
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    ctx.drawImage(
      image,
      c.x * scaleX, c.y * scaleY,
      c.width * scaleX, c.height * scaleY,
      0, 0, size, size
    );
    canvas.toBlob(blob => { if (blob) onDone(blob); }, "image/png", 0.95);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "28px 28px 24px", width: 480, maxWidth: "90vw", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16, color: "var(--white)" }}>Crop your logo</div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", marginTop: -12 }}>Drag to reposition. The crop is always square.</div>
        <div style={{ display: "flex", justifyContent: "center", maxHeight: 360, overflow: "auto", background: "var(--border-soft)", borderRadius: 8, padding: 12 }}>
          <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={1} circularCrop style={{ maxWidth: "100%" }}>
            <img ref={imgRef} src={src} onLoad={onImageLoad} style={{ maxWidth: "100%", maxHeight: 320, display: "block" }} alt="crop preview" />
          </ReactCrop>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ height: 38, padding: "0 18px", borderRadius: 8, background: "var(--border-soft)", border: "1px solid var(--border)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--muted)", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleApply} style={{ height: 38, padding: "0 20px", borderRadius: 8, background: "var(--accent)", border: "none", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
            Use this crop
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Color wheel helpers ─── */
const WHEEL = 150;
const DEFAULT_COLOR = "#DA6B3A";

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
  const v = max, s = max === 0 ? 0 : d / max;
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
  const lastColor = useRef(color);

  useEffect(() => {
    if (color !== lastColor.current) { lastColor.current = color; setHsv(hexToHsv(color)); }
  }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3), size = WHEEL * dpr;
    canvas.width = size; canvas.height = size;
    const r = size / 2;
    const off = document.createElement("canvas"); off.width = size; off.height = size;
    const offCtx = off.getContext("2d"), img = offCtx.createImageData(size, size);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const dx = x - r, dy = y - r;
      const h = ((Math.atan2(dy, dx) * 180 / Math.PI) + 360) % 360;
      const s = Math.min((Math.sqrt(dx * dx + dy * dy) / r) * 100, 100);
      const [rv, g, b] = hsvToRgb(h, s, hsv[2]);
      const i = (y * size + x) * 4;
      img.data[i] = rv; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
    }
    offCtx.putImageData(img, 0, 0);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, size, size); ctx.save();
    ctx.beginPath(); ctx.arc(r, r, r, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(off, 0, 0); ctx.restore();
  }, [hsv[2]]);

  function pick(clientX, clientY) {
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = ((clientX - rect.left) / rect.width) * WHEEL;
    const cy = ((clientY - rect.top) / rect.height) * WHEEL;
    const dx = cx - R, dy = cy - R;
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), R - 1);
    const h = Math.round(((Math.atan2(dy, dx) * 180 / Math.PI) + 360) % 360);
    const s = Math.round((dist / R) * 100);
    const next = [h, s, hsv[2]]; setHsv(next);
    lastColor.current = hsvToHex(h, s, hsv[2]); onChange(lastColor.current);
  }
  function onBrightness(v) {
    const next = [hsv[0], hsv[1], v]; setHsv(next);
    lastColor.current = hsvToHex(hsv[0], hsv[1], v); onChange(lastColor.current);
  }

  const angle = hsv[0] * Math.PI / 180, idist = (hsv[1] / 100) * (R - 2);
  const ix = R + idist * Math.cos(angle), iy = R + idist * Math.sin(angle);
  const pureColor = hsvToHex(hsv[0], hsv[1], 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14 }}>
      <div style={{ position: "relative", width: WHEEL, height: WHEEL }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", cursor: "crosshair", boxShadow: "0 2px 12px rgba(0,0,0,0.25)" }}
          onMouseDown={e => { dragging.current = true; pick(e.clientX, e.clientY); }}
          onMouseMove={e => { if (dragging.current) pick(e.clientX, e.clientY); }}
          onMouseUp={() => { dragging.current = false; }} onMouseLeave={() => { dragging.current = false; }}
          onTouchStart={e => { e.preventDefault(); pick(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchMove={e => { e.preventDefault(); pick(e.touches[0].clientX, e.touches[0].clientY); }}>
          <canvas ref={canvasRef} width={WHEEL} height={WHEEL} style={{ display: "block", width: "100%", height: "100%" }} />
        </div>
        <div style={{ position: "absolute", left: ix, top: iy, width: 18, height: 18, borderRadius: "50%", border: "3px solid #fff", boxShadow: "0 1px 5px rgba(0,0,0,0.45)", transform: "translate(-50%,-50%)", pointerEvents: "none", background: color }} />
      </div>
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

/* ─── Shared UI primitives ─── */
const INPUT = {
  width: "100%", boxSizing: "border-box", padding: "10px 14px",
  background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 8,
  fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text)", outline: "none",
};

function Field({ label, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>{label}</label>
      {children}
      {hint && <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted-faint)" }}>{hint}</span>}
    </div>
  );
}

function SaveBtn({ onClick, saving, saved, disabled, label = "Save" }) {
  return (
    <button onClick={onClick} disabled={disabled || saving}
      style={{ height: 42, padding: "0 24px", borderRadius: 8, background: saved ? "#16a34a" : "var(--accent)", border: "none", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "#fff", cursor: disabled || saving ? "not-allowed" : "pointer", opacity: disabled || saving ? 0.7 : 1, transition: "background 0.2s" }}>
      {saving ? "Saving…" : saved ? "Saved!" : label}
    </button>
  );
}

function SectionHead({ title, sub }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 20, color: "var(--white)", marginBottom: 6 }}>{title}</div>
      {sub && <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{sub}</div>}
    </div>
  );
}

function ErrorBox({ children }) {
  return <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#dc2626", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 6, padding: "8px 12px" }}>{children}</div>;
}

/* ─── Sidebar nav definition ─── */
const AGENT_NAV = [
  { id: "profile",  label: "Profile",  tip: "Set your AI's name and the greeting clients see when they open the chat." },
  { id: "branding", label: "Branding", tip: "Choose your brand color and upload a logo for reports and your client-facing experience." },
  { id: "contact",  label: "Contact",  tip: "Your name, brokerage, and contact info — auto-filled in the header of every report." },
  { id: "train",    label: "Train AI", tip: "Write instructions that shape how your AI responds. Upload a doc or type it directly." },
  { id: "clients",  label: "Clients",  tip: "Invite clients to your branded AI chat. They get a private login and can only access the chat." },
  { id: "team",     label: "Manage Users", tip: "Visual overview of your agents and clients as a connected tree." },
];
const BROKERAGE_NAV = [
  { id: "profile",  label: "Profile",  tip: "Set your AI's name and the greeting clients see when they open the chat." },
  { id: "branding", label: "Branding", tip: "Choose your brand color and upload a logo for reports and your client-facing experience." },
  { id: "contact",  label: "Contact",  tip: "Your name, brokerage, and contact info — auto-filled in the header of every report." },
  { id: "train",    label: "Train AI", tip: "Write instructions that shape how your AI responds. Upload a doc or type it directly." },
  { id: "team",     label: "Manage Users", tip: "Visual overview of your agents and clients as a connected tree." },
];

/* ─── Main component ─── */
function AgentSettings({ user, userRow, hideSidebar = false, defaultSection = "profile" }) {
  const tier = userRow?.tier || "solo";
  const canAccess = hasFeature(tier, "agent");
  const isBrokerage = hasFeature(tier, "brokerage");
  const nav = isBrokerage ? BROKERAGE_NAV : AGENT_NAV;

  const [section, setSection] = useState(defaultSection);
  const [tooltip, setTooltip] = useState(null);

  /* Agent profile state */
  const [profile, setProfile] = useState(null);
  const [aiName, setAiName] = useState("");
  const [brandColor, setBrandColor] = useState(DEFAULT_COLOR);
  const [logoUrl, setLogoUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const fileRef = useRef();
  const [reportInfo, setReportInfo] = useState(loadAgentInfo);
  const [greeting, setGreeting] = useState(() => loadAgentInfo().greeting || "");
  const [savedContact, setSavedContact] = useState(false);

  /* Clients state */
  const [clients, setClients] = useState([]);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  /* Brokerage state */
  const [brokerageProfile, setBrokerageProfile] = useState(null);
  const [linkedAgents, setLinkedAgents] = useState([]);
  const [agentClients, setAgentClients] = useState({}); // { agentId: [clients] }
  // invite agent (email)
  const [inviteAgentEmail, setInviteAgentEmail] = useState("");
  const [inviteAgentName, setInviteAgentName] = useState("");
  const [invitingAgent, setInvitingAgent] = useState(false);
  const [inviteAgentError, setInviteAgentError] = useState(null);
  const [inviteAgentSuccess, setInviteAgentSuccess] = useState(false);
  // invite client to specific agent
  const [inviteAgentId, setInviteAgentId] = useState(null);
  const [agentInviteEmail, setAgentInviteEmail] = useState("");
  const [agentInviteName, setAgentInviteName] = useState("");
  const [agentInviting, setAgentInviting] = useState(false);
  const [agentInviteError, setAgentInviteError] = useState(null);
  const [agentInviteSuccess, setAgentInviteSuccess] = useState(false);
  // add by handle
  const [agentHandleInput, setAgentHandleInput] = useState("");
  const [addingAgent, setAddingAgent] = useState(false);
  const [addAgentError, setAddAgentError] = useState(null);

  /* Load agent profile */
  useEffect(() => {
    if (!canAccess || !user?.id) return;
    supabase.from("agent_profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (!data) return;
      setProfile(data);
      setAiName(data.ai_name || "");
      setBrandColor(data.brand_color || DEFAULT_COLOR);
      setLogoUrl(data.logo_url || null);
      if (data.contact_name || data.contact_phone || data.contact_email) {
        setReportInfo(prev => ({
          ...prev,
          name: data.contact_name || prev.name,
          brokerage: data.contact_brokerage || prev.brokerage,
          license: data.contact_license || prev.license,
          phone: data.contact_phone || prev.phone,
          email: data.contact_email || prev.email,
        }));
      }
    });
  }, [user?.id, canAccess]);

  /* Load clients when on clients section */
  useEffect(() => {
    if (section !== "clients" || !profile?.id) return;
    supabase.from("client_profiles").select("*").eq("agent_id", profile.id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setClients(data); });
  }, [section, profile?.id]);

  /* Load brokerage profile + linked agents + their clients */
  useEffect(() => {
    if (!isBrokerage || !user?.id) return;
    supabase.from("brokerage_profiles").select("*").eq("user_id", user.id).maybeSingle().then(async ({ data }) => {
      if (!data) return;
      setBrokerageProfile(data);
      if (data.logo_url) setLogoUrl(data.logo_url);
      if (data.ai_name) setAiName(data.ai_name);
      if (data.brand_color) setBrandColor(data.brand_color);
      const { data: agents } = await supabase.from("agent_profiles")
        .select("id, handle, ai_name, user_id").eq("brokerage_id", data.id);
      const list = agents || [];
      setLinkedAgents(list);
      const map = {};
      await Promise.all(list.map(async a => {
        const { data: cls } = await supabase.from("client_profiles").select("*").eq("agent_id", a.id);
        map[a.id] = cls || [];
      }));
      setAgentClients(map);
    });
  }, [user?.id, isBrokerage]);

  /* Apply brand color live */
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", brandColor);
    document.documentElement.style.setProperty("--accent-text", "#fff");
  }, [brandColor]);

  /* ─── Handlers ─── */
  function handleLogoUpload(e) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Logo must be under 5MB."); return; }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleCropDone(blob) {
    setCropSrc(null);
    setUploading(true); setError(null);
    const path = `${user.id}/logo.png`;
    const { error: upErr } = await supabase.storage.from("logos").upload(path, blob, { upsert: true, contentType: "image/png" });
    if (upErr) { setError("Upload failed: " + upErr.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(path);
    setLogoUrl(publicUrl + "?t=" + Date.now()); setUploading(false);
  }

  async function handleSave() {
    if (!aiName.trim()) { setError("AI name is required."); return; }
    setSaving(true); setError(null);
    const updates = { user_id: user.id, ai_name: aiName.trim(), brand_color: brandColor, logo_url: logoUrl };
    let saveErr;
    if (isBrokerage) {
      const { error } = brokerageProfile
        ? await supabase.from("brokerage_profiles").update(updates).eq("user_id", user.id)
        : await supabase.from("brokerage_profiles").insert(updates);
      saveErr = error;
    } else {
      const { error } = profile
        ? await supabase.from("agent_profiles").update(updates).eq("user_id", user.id)
        : await supabase.from("agent_profiles").insert(updates);
      saveErr = error;
    }
    if (saveErr) { setError("Save failed: " + saveErr.message); }
    else {
      saveAgentInfo({ ...loadAgentInfo(), ...reportInfo, greeting, logoUrl: logoUrl || "" });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  async function handleSaveContact() {
    saveAgentInfo({ ...loadAgentInfo(), ...reportInfo, greeting, logoUrl: logoUrl || "" });
    const contactFields = {
      contact_name: reportInfo.name || null,
      contact_brokerage: reportInfo.brokerage || null,
      contact_license: reportInfo.license || null,
      contact_phone: reportInfo.phone || null,
      contact_email: reportInfo.email || null,
    };
    if (isBrokerage && brokerageProfile) {
      await supabase.from("brokerage_profiles").update(contactFields).eq("user_id", user.id);
    } else if (!isBrokerage && profile) {
      await supabase.from("agent_profiles").update(contactFields).eq("user_id", user.id);
    }
    setSavedContact(true); setTimeout(() => setSavedContact(false), 2000);
  }

  async function handleInviteClient() {
    if (!clientEmail.trim() || !profile?.id) return;
    setInviting(true); setInviteError(null); setInviteSuccess(false);
    const res = await fetch("/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "invite-client", email: clientEmail.trim(), name: clientName.trim(), agentProfileId: profile.id, agentHandle: profile.handle }),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      setInviteError(data.error || "Invite failed.");
    } else {
      setClients(prev => [data.client, ...prev.filter(c => c.id !== data.client.id)]);
      setClientEmail(""); setClientName(""); setInviteSuccess(true);
      setTimeout(() => setInviteSuccess(false), 3000);
    }
    setInviting(false);
  }

  async function handleRemoveClient(clientId) {
    await supabase.from("client_profiles").delete().eq("id", clientId);
    setClients(prev => prev.filter(c => c.id !== clientId));
  }

  async function handleAddAgent() {
    const handle = agentHandleInput.trim().toLowerCase();
    if (!handle || !brokerageProfile) return;
    setAddingAgent(true); setAddAgentError(null);
    const { data, error: err } = await supabase.from("agent_profiles")
      .update({ brokerage_id: brokerageProfile.id })
      .eq("handle", handle)
      .select("id, handle, ai_name, user_id")
      .single();
    if (err || !data) {
      setAddAgentError("No agent found with that handle, or they need to set up their Vis account first.");
    } else {
      setLinkedAgents(prev => [...prev.filter(a => a.id !== data.id), data]);
      setAgentHandleInput("");
    }
    setAddingAgent(false);
  }

  async function handleInviteAgent() {
    if (!inviteAgentEmail.trim()) return;
    setInvitingAgent(true); setInviteAgentError(null); setInviteAgentSuccess(false);
    const res = await fetch("/api/actions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "invite-agent", email: inviteAgentEmail.trim(), name: inviteAgentName.trim(), brokerageProfileId: brokerageProfile?.id }),
    });
    const data = await res.json();
    if (!res.ok || data.error) { setInviteAgentError(data.error || "Invite failed."); }
    else { setInviteAgentSuccess(true); setInviteAgentEmail(""); setInviteAgentName(""); setTimeout(() => setInviteAgentSuccess(false), 3000); }
    setInvitingAgent(false);
  }

  async function handleInviteToAgent(agentId, agentHandle) {
    if (!agentInviteEmail.trim()) return;
    setAgentInviting(true); setAgentInviteError(null); setAgentInviteSuccess(false);
    const res = await fetch("/api/actions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "invite-client", email: agentInviteEmail.trim(), name: agentInviteName.trim(), agentProfileId: agentId, agentHandle }),
    });
    const data = await res.json();
    if (!res.ok || data.error) { setAgentInviteError(data.error || "Invite failed."); }
    else {
      setAgentClients(prev => ({ ...prev, [agentId]: [data.client, ...(prev[agentId] || [])] }));
      setAgentInviteEmail(""); setAgentInviteName("");
      setAgentInviteSuccess(true); setTimeout(() => { setAgentInviteSuccess(false); setInviteAgentId(null); }, 1500);
    }
    setAgentInviting(false);
  }

  async function handleRemoveAgentClient(clientId, agentId) {
    await supabase.from("client_profiles").delete().eq("id", clientId);
    setAgentClients(prev => ({ ...prev, [agentId]: prev[agentId].filter(c => c.id !== clientId) }));
  }

  async function handleRemoveAgent(agentId) {
    await supabase.from("agent_profiles").update({ brokerage_id: null }).eq("id", agentId);
    setLinkedAgents(prev => prev.filter(a => a.id !== agentId));
  }

  /* ─── Access gate ─── */
  if (!canAccess) {
    return (
      <div style={{ maxWidth: 560, margin: "60px auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18, color: "var(--white)", marginBottom: 10 }}>Settings</div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>Custom AI name, logo, brand color, and subdomain are available on the Agent plan and above.</div>
      </div>
    );
  }

  /* ─── Layout ─── */
  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

      {/* Sidebar */}
      {!hideSidebar && (
        <nav style={{ width: 180, flexShrink: 0, borderRight: "1px solid var(--border)", background: "var(--border-soft)", display: "flex", flexDirection: "column", padding: "32px 0" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 20px", marginBottom: 16 }}>Settings</div>
          {nav.map(n => <NavItem key={n.id} n={n} active={section === n.id} onClick={() => { setSection(n.id); setError(null); }} onTip={setTooltip} />)}
        </nav>
      )}

      {/* Hover tooltip */}
      {!hideSidebar && tooltip && (
        <div style={{ position: "fixed", top: tooltip.top, left: tooltip.left, transform: "translateY(-50%)", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", width: 200, zIndex: 1000, pointerEvents: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }}>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>{tooltip.text}</div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* ── Profile ── */}
        {section === "profile" && (
          <div style={{ maxWidth: 480, padding: "40px 48px" }}>
            <SectionHead title="Profile" sub="Your AI's name and how it greets clients." />
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {profile?.handle && (
                <Field label="Your subdomain" hint="This cannot be changed after it's claimed.">
                  <div style={{ ...INPUT, background: "var(--card)", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ color: "var(--white)", fontFamily: "var(--font-mono)", fontSize: 13 }}>{profile.handle}</span>
                    <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 13 }}>.vis.realestate</span>
                  </div>
                </Field>
              )}
              <Field label="AI name" hint="The name your clients see — e.g. 'Alex', 'Max', 'The Jones Team AI'">
                <input value={aiName} onChange={e => setAiName(e.target.value)} placeholder="e.g. Alex" maxLength={40} style={INPUT} />
              </Field>
              <Field label="Chat greeting" hint="Shown above the chat input before any messages. Leave blank to show nothing.">
                <input value={greeting} onChange={e => setGreeting(e.target.value)} placeholder="e.g. Ask me anything about Austin real estate." maxLength={120} style={INPUT} />
              </Field>
              {error && <ErrorBox>{error}</ErrorBox>}
              <SaveBtn onClick={handleSave} saving={saving} saved={saved} disabled={uploading} />
            </div>
          </div>
        )}

        {/* ── Branding ── */}
        {cropSrc && <LogoCropper src={cropSrc} onDone={handleCropDone} onCancel={() => { setCropSrc(null); }} />}

        {section === "branding" && (
          <div style={{ maxWidth: 480, padding: "40px 48px" }}>
            <SectionHead title="Branding" sub="Colors and logo shown on your branded experience." />
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <Field label="Brand color" hint="Used on buttons, highlights, and accents.">
                <ColorWheel color={brandColor} onChange={setBrandColor} />
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                  <input value={brandColor} onChange={e => setBrandColor(e.target.value)} placeholder="#DA6B3A" maxLength={7} style={{ ...INPUT, width: 120, fontFamily: "var(--font-mono)", fontSize: 13 }} />
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: brandColor, border: "1px solid var(--border)", flexShrink: 0 }} />
                  {brandColor.toLowerCase() !== DEFAULT_COLOR.toLowerCase() && (
                    <button onClick={() => setBrandColor(DEFAULT_COLOR)} style={{ height: 36, padding: "0 12px", borderRadius: 7, background: "transparent", border: "1px solid var(--border)", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", cursor: "pointer", whiteSpace: "nowrap" }}>Reset</button>
                  )}
                </div>
              </Field>
              <Field label="Logo" hint="Square image recommended. PNG or JPG, max 5MB.">
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", display: "grid", placeItems: "center", flexShrink: 0, overflow: "hidden" }}>
                    {logoUrl ? <img src={logoUrl} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 20, color: brandColor }}>{aiName ? aiName[0].toUpperCase() : "?"}</span>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button onClick={() => fileRef.current?.click()} disabled={uploading}
                      style={{ height: 36, padding: "0 16px", borderRadius: 7, background: "var(--card)", border: "1px solid var(--border)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--white)", cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.6 : 1 }}>
                      {uploading ? "Uploading…" : logoUrl ? "Replace logo" : "Upload logo"}
                    </button>
                    {logoUrl && <button onClick={() => setLogoUrl(null)} style={{ height: 28, padding: "0 12px", borderRadius: 6, background: "transparent", border: "none", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", cursor: "pointer" }}>Remove</button>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={handleLogoUpload} />
                </div>
              </Field>
              {error && <ErrorBox>{error}</ErrorBox>}
              <SaveBtn onClick={handleSave} saving={saving} saved={saved} disabled={uploading} />
            </div>
          </div>
        )}

        {/* ── Contact ── */}
        {section === "contact" && (
          <div style={{ maxWidth: 480, padding: "40px 48px" }}>
            <SectionHead title="Contact info" sub="Auto-fills the agent header on every report. Still editable per-report." />
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {[
                { key: "name",      label: "Full name",  placeholder: "Your full name" },
                { key: "brokerage", label: "Brokerage",  placeholder: "Brokerage name" },
                { key: "license",   label: "License #",  placeholder: "License number" },
                { key: "phone",     label: "Phone",      placeholder: "(555) 000-0000" },
                { key: "email",     label: "Email",      placeholder: "you@example.com" },
              ].map(({ key, label, placeholder }) => (
                <Field key={key} label={label}>
                  <input value={reportInfo[key]} onChange={e => setReportInfo(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} style={INPUT} />
                </Field>
              ))}
              <SaveBtn onClick={handleSaveContact} saving={false} saved={savedContact} disabled={false} />
            </div>
          </div>
        )}

        {/* ── Train AI ── */}
        {section === "train" && <TrainAI user={user} userRow={userRow} />}

        {/* ── Clients ── */}
        {section === "clients" && (
          <div style={{ maxWidth: 560, padding: "40px 48px" }}>
            <SectionHead title="Clients" sub="Invite clients to your branded AI chat. They receive a private login and see only the chat — no settings or reports tabs." />

            {!canAccess && (
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 18px" }}>
                Client management is available on the Agent plan and above.
              </div>
            )}

            {canAccess && !profile && (
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 18px" }}>
                Complete your Profile setup first so clients can be linked to your account.
              </div>
            )}

            {canAccess && profile && <>
              {/* Client list */}
              {clients.length > 0 && (
                <div style={{ marginBottom: 36 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
                    Active clients ({clients.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {clients.map(client => (
                      <div key={client.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--accent-soft)", border: "1px solid var(--border)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 13, color: "var(--accent)" }}>
                            {(client.name || client.email)[0].toUpperCase()}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {client.name && <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--white)", marginBottom: 1 }}>{client.name}</div>}
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>{client.email}</div>
                        </div>
                        <button onClick={() => handleRemoveClient(client.id)}
                          style={{ background: "none", border: "none", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted)", cursor: "pointer", padding: "4px 8px", borderRadius: 4, flexShrink: 0 }}
                          onMouseEnter={e => e.target.style.color = "#dc2626"}
                          onMouseLeave={e => e.target.style.color = "var(--muted)"}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {clients.length === 0 && (
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", marginBottom: 32 }}>No clients invited yet.</div>
              )}

              {/* Invite form */}
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Invite a client</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="Client name (optional)"
                    style={{ ...INPUT }}
                  />
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      value={clientEmail}
                      onChange={e => { setClientEmail(e.target.value); setInviteError(null); }}
                      onKeyDown={e => e.key === "Enter" && handleInviteClient()}
                      placeholder="client@email.com"
                      type="email"
                      style={{ ...INPUT, flex: 1 }}
                    />
                    <button onClick={handleInviteClient} disabled={inviting || !clientEmail.trim()}
                      style={{ height: 44, padding: "0 20px", borderRadius: 8, background: inviteSuccess ? "#16a34a" : "var(--accent)", border: "none", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "#fff", cursor: inviting || !clientEmail.trim() ? "not-allowed" : "pointer", opacity: inviting || !clientEmail.trim() ? 0.6 : 1, whiteSpace: "nowrap", transition: "background 0.2s" }}>
                      {inviting ? "Sending…" : inviteSuccess ? "Sent!" : "Send invite"}
                    </button>
                  </div>
                  {inviteError && <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#dc2626" }}>{inviteError}</div>}
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--muted-faint)", lineHeight: 1.5 }}>
                    Client receives an email with a link to {profile.handle ? `${profile.handle}.vis.realestate` : "your chat page"}. They can only access the chat — no settings or admin features.
                  </div>
                </div>
              </div>
            </>}
          </div>
        )}

        {/* ── Team ── */}
        {section === "team" && <TeamView user={user} userRow={userRow} />}

        {/* ── Agents + Clients (brokerage only) ── */}

      </div>
    </div>
  );
}

function NavItem({ n, active, onClick, onTip }) {
  return (
    <button onClick={onClick}
      onMouseEnter={e => { const r = e.currentTarget.getBoundingClientRect(); onTip({ text: n.tip, top: r.top + r.height / 2, left: r.right + 12 }); }}
      onMouseLeave={() => onTip(null)}
      style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 20px", background: "transparent", border: "none", borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: active ? 600 : 400, color: active ? "var(--white)" : "var(--muted)", cursor: "pointer", transition: "color 0.15s, border-color 0.15s" }}>
      {n.label}
    </button>
  );
}

export default AgentSettings;
