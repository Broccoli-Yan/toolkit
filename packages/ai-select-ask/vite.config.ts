import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup/index.html"),
        "service-worker": resolve(__dirname, "src/service-worker/index.ts"),
      },
      output: {
        // Service worker must be self-contained — no shared chunks
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "service-worker") return "service-worker.js";
          return "popup/assets/[name]-[hash].js";
        },
        chunkFileNames: "popup/assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "popup/assets/[name]-[hash].css";
          }
          return "popup/assets/[name]-[hash].[ext]";
        },
        // Force service worker to be inlined — no shared chunks
        manualChunks: (id) => {
          if (id.includes("service-worker")) {
            return undefined; // Inline into entry
          }
        },
      },
    },
    modulePreload: false,
  },
});