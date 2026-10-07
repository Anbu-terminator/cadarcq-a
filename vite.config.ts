import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Frontend = static React SPA (built to /dist and served by the Express backend).
// In development the Vite dev server proxies /api/* to the Express server so the
// browser always talks to ONE origin (this keeps the secure httpOnly cookie working).
export default defineConfig({
  plugins: [
    // The router plugin must come BEFORE the react plugin.
    tanstackRouter({ target: "react", autoCodeSplitting: false }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: false },
    },
  },
  build: { outDir: "dist", sourcemap: false },
});
