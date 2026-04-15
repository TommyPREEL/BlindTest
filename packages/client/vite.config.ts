import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@blindtest/shared": path.resolve(__dirname, "../shared/src/index.ts"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/socket.io": {
        target: "http://localhost:3950",
        ws: true,
      },
      "/genres": { target: "http://localhost:3950" },
      "/health": { target: "http://localhost:3950" },
    },
  },
});
