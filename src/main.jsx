import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { applyTheme } from "./theme.js";
import "./index.css";
import App from "./App.jsx";
import { AgentProvider } from "./utils/AgentContext.jsx";

applyTheme();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AgentProvider>
      <App />
    </AgentProvider>
  </StrictMode>,
);
