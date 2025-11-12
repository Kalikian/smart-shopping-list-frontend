import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Prod: GitHub Pages unter /smart-shopping-list-frontend/
  // Dev: /
  base: process.env.NODE_ENV === "production"
    ? "/smart-shopping-list-frontend/"
    : "/",
});
