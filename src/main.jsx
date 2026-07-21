import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

const rootElement = document.getElementById("root");
const initialPath = rootElement.dataset.prerenderPath || `${window.location.pathname}${window.location.search}`;
const app = (
  <StrictMode>
    <App initialPath={initialPath} />
  </StrictMode>,
);

if (rootElement.childElementCount > 0) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
