const ENDPOINT = "/api/chat";
const SUMMARY_ENDPOINT = "/api/summary";
const TEMPLATE_ENDPOINT = "/api/generate-template";
const GRAPH_ENDPOINT = "/api/graph";
const COMPARE_ENDPOINT = "/api/compare";

// Current signed-in user id, stashed by App.jsx — lets the report/graph/compare
// calls meter usage without threading userId through every component.
function uid() {
  try { return localStorage.getItem("vis-uid") || null; } catch { return null; }
}

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
    if (response.status === 402 && data?.error === "needs_topup") {
      const e = new Error("needs_topup");
      e.code = "needs_topup";
      e.available = data.available;
      throw e;
    }
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
      body: JSON.stringify({ property, market, userId: uid() }),
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
      body: JSON.stringify({ description, reportType, userId: uid() }),
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

export async function fetchGraphData({ metric, metricLabel, location, dateRange, chartType, unit, companion, companionLabel }) {
  let response;
  try {
    response = await fetch(GRAPH_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metric, metricLabel, location, dateRange, chartType, unit, companion, companionLabel, userId: uid() }),
    });
  } catch {
    throw new Error("Network error reaching the graph server. Check your connection.");
  }

  let data;
  try { data = await response.json(); } catch { /* fall through */ }

  if (!response.ok) throw new Error(data?.error || `Graph server returned ${response.status}`);
  if (!data?.points?.length) throw new Error("No data points returned. Try a different date range or location.");
  return data;
}

// Fetch raw web-sourced facts for a single property (used by the Compare area).
// Returns only raw numbers; derived metrics are computed client-side.
export async function fetchComparisonProperty(address) {
  let response;
  try {
    response = await fetch(COMPARE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, userId: uid() }),
    });
  } catch {
    throw new Error("Network error reaching the compare server. Check your connection.");
  }

  let data;
  try { data = await response.json(); } catch { /* fall through */ }

  if (!response.ok) throw new Error(data?.error || `Compare server returned ${response.status}`);
  if (!data?.address) throw new Error("Could not find facts for that address.");
  return data;
}

// Start a Stripe Checkout for a prepaid usage top-up ($10/$25/$50/$100).
// Returns the Checkout URL to redirect to.
export async function createTopupSession({ amount, userId, email }) {
  let response;
  try {
    response = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "topup", amount, userId, email }),
    });
  } catch {
    throw new Error("Network error starting checkout. Check your connection.");
  }

  let data;
  try { data = await response.json(); } catch { /* fall through */ }

  if (!response.ok) throw new Error(data?.error || `Checkout server returned ${response.status}`);
  if (!data?.url) throw new Error("Checkout could not be started.");
  return data.url;
}
