import { supabase } from "./supabase.js";

export async function loadClientSessions(clientId) {
  const { data } = await supabase
    .from("client_sessions")
    .select("id, name, created_at, updated_at")
    .eq("client_id", clientId)
    .order("updated_at", { ascending: false });
  return data || [];
}

export async function loadClientMessages(sessionId) {
  const { data } = await supabase
    .from("client_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at");
  return data || [];
}

export async function saveClientSession(session, clientId, agentId) {
  const { data } = await supabase
    .from("client_sessions")
    .upsert(
      { id: session.id, client_id: clientId, agent_id: agentId, name: session.name || "New chat", updated_at: new Date().toISOString() },
      { onConflict: "id" }
    )
    .select("id, name")
    .single();
  return data;
}

export async function appendClientMessage(msg, sessionId) {
  await supabase
    .from("client_messages")
    .upsert(
      { id: msg.id, session_id: sessionId, role: msg.role, content: msg.content, card_type: msg.cardType || null, card_data: msg.cardData || null },
      { onConflict: "id" }
    );
}
