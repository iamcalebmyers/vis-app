import { useState } from "react";

const KEY = "vis-agent-info";

const DEFAULTS = { name: "", brokerage: "", license: "", phone: "", email: "", greeting: "", logoUrl: "" };

export function loadAgentInfo() {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) return { ...DEFAULTS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULTS;
}

export function saveAgentInfo(info) {
  try { localStorage.setItem(KEY, JSON.stringify(info)); } catch {}
}

export function useAgentInfo() {
  const [info, setInfo] = useState(loadAgentInfo);

  function update(newInfo) {
    setInfo(newInfo);
    saveAgentInfo(newInfo);
  }

  return [info, update];
}
