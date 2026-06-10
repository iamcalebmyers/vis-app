import { createContext, useContext, useState, useEffect } from "react";
import { detectSubdomain, loadAgentConfig } from "./subdomainLoader.js";

const DEFAULT = {
  isAgentDomain: false,
  handle: null,
  aiName: "Vis",
  logoUrl: "/vis-logo.png",
  brandColor: "#DA6B3A",
  trainingText: null,
  trainingDocText: null,
  brokerageTraining: null,
  contactName: null,
  contactBrokerage: null,
  contactLicense: null,
  contactPhone: null,
  contactEmail: null,
  loading: true,
};

const AgentContext = createContext(DEFAULT);

export function useAgent() {
  return useContext(AgentContext);
}

export function AgentProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT);

  useEffect(() => {
    const handle = detectSubdomain();
    if (!handle) {
      setConfig({ ...DEFAULT, loading: false });
      return;
    }
    loadAgentConfig(handle).then((agentConfig) => {
      if (agentConfig) {
        document.documentElement.style.setProperty("--accent", agentConfig.brandColor);
        setConfig({ ...agentConfig, loading: false });
      } else {
        setConfig({ ...DEFAULT, loading: false });
      }
    });
  }, []);

  return (
    <AgentContext.Provider value={config}>
      {children}
    </AgentContext.Provider>
  );
}
