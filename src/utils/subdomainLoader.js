import { supabase } from "./supabase.js";

export function detectSubdomain() {
  const hostname = window.location.hostname;
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "vis.realestate"
  ) {
    return null;
  }
  if (hostname.endsWith(".vis.realestate")) {
    const handle = hostname.replace(".vis.realestate", "");
    if (!handle.includes(".")) return handle;
  }
  return null;
}

export async function loadAgentConfig(handle) {
  const { data } = await supabase
    .from("agent_profiles")
    .select("ai_name, logo_url, brand_color, training_text, training_doc_text, brokerage_id")
    .eq("handle", handle)
    .maybeSingle();

  if (!data) return null;

  let brokerageTraining = null;
  if (data.brokerage_id) {
    const { data: brokerage } = await supabase
      .from("brokerage_profiles")
      .select("training_baseline")
      .eq("id", data.brokerage_id)
      .maybeSingle();
    brokerageTraining = brokerage?.training_baseline || null;
  }

  return {
    isAgentDomain: true,
    handle,
    aiName: data.ai_name || "Vis",
    logoUrl: data.logo_url || null,
    brandColor: data.brand_color || "#DA6B3A",
    trainingText: data.training_text || null,
    trainingDocText: data.training_doc_text || null,
    brokerageTraining,
  };
}
