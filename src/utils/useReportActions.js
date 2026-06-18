import { useState } from "react";
import { supabase } from "./supabase.js";
import { hasFeature } from "./tier.js";

const SAVE_LIMITS = { solo: 5, investor: 25, agent: Infinity, brokerage: Infinity };

export function useReportActions(reportType, reportData, user, userRow) {
  const [shareLoading, setShareLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  async function handleShare() {
    setShareLoading(true);
    try {
      let agentProfileId = null;
      if (user?.id && hasFeature(userRow?.tier, "agent")) {
        const { data } = await supabase
          .from("agent_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        agentProfileId = data?.id || null;
      }
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-report", reportType, reportData, agentProfileId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate link.");
      setShareUrl(json.url);
      setShowShareModal(true);
    } catch (e) {
      console.error("Share error:", e);
    } finally {
      setShareLoading(false);
    }
  }

  function handleSave(name) {
    setSaveError(null);
    const tier = userRow?.tier || "solo";
    const limit = SAVE_LIMITS[tier] ?? 5;
    const existing = JSON.parse(localStorage.getItem("vis-saved-reports") || "[]");
    if (existing.length >= limit) {
      setSaveError(`Your ${tier} plan allows up to ${limit} saved reports.`);
      return;
    }
    const entry = {
      id: Date.now().toString(),
      type: reportType,
      name: name || reportType + " report",
      savedAt: Date.now(),
      data: reportData,
    };
    localStorage.setItem("vis-saved-reports", JSON.stringify([entry, ...existing]));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return { shareLoading, shareUrl, showShareModal, setShowShareModal, saved, saveError, handleShare, handleSave };
}
