// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Minimal service worker registration for PWA installability
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const base = import.meta.env.BASE_URL; // e.g. "/smart-shopping-list/"
    navigator.serviceWorker
      .register(`${base}sw.js`, { scope: base })
      .catch((err) => console.error("SW registration failed:", err));
  });
}
