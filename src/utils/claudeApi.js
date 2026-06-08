const ENDPOINT = "/api/chat";
const SUMMARY_ENDPOINT = "/api/summary";
const TEMPLATE_ENDPOINT = "/api/generate-template";

export async function sendMessage(messages, options = {}) {
  let response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        userId: options.userId,
        aiName: options.aiName,
        brokerageTraining: options.brokerageTraining,
        agentTraining: options.agentTraining,
      }),
      signal: options.signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new Error(
      "Network error reaching the chat server. Check your connection and try again.",
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // fall through — handled below
  }

  if (!response.ok) {
    const message =
      data?.error ||
      `Chat server returned ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  if (!data?.reply) {
    throw new Error("Chat server returned an empty reply");
  }

  return { reply: data.reply, card: data.card || null };
}

export async function generatePropertySummary(property, market) {
  let response;
  try {
    response = await fetch(SUMMARY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property, market }),
    });
  } catch {
    throw new Error("Network error reaching the summary server.");
  }

  let data;
  try { data = await response.json(); } catch { /* fall through */ }

  if (!response.ok) {
    throw new Error(data?.error || `Summary server returned ${response.status}`);
  }
  if (!data?.aiSummary) {
    throw new Error("Summary server returned incomplete data");
  }

  return data;
}

export async function generateReportTemplate(description, reportType) {
  let response;
  try {
    response = await fetch(TEMPLATE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, reportType }),
    });
  } catch {
    throw new Error("Network error reaching the template server.");
  }

  let data;
  try { data = await response.json(); } catch { /* fall through */ }

  if (!response.ok) throw new Error(data?.error || `Template server returned ${response.status}`);
  if (!data?.template) throw new Error("Template server returned incomplete data");

  return data.template;
}
