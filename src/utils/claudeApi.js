const ENDPOINT = "/api/chat";

export async function sendMessage(messages, options = {}) {
  let response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
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

  return data.reply;
}
