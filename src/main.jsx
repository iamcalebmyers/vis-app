import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { applyTheme, watchSystemTheme } from "./theme.js";
import "./index.css";
import App from "./App.jsx";
import { AgentProvider } from "./utils/AgentContext.jsx";

applyTheme();
watchSystemTheme();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AgentProvider>
      <App />
    </AgentProvider>
  </StrictMode>,
);
