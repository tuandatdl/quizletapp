import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { cloudflare } from "@cloudflare/vite-plugin";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, "");
  const proxyTarget = env.VITE_DEV_PROXY_TARGET || "http://127.0.0.1:3000";
  const staticMode = env.VITE_RUNTIME_MODE === "static" || mode === "pages";
  const pagesBase = (env.VITE_PAGES_BASE_PATH || "/quizletapp/").replace(/^([^/])/u, "/$1").replace(/([^/])$/u, "$1/");
  return {
    base: staticMode ? pagesBase : "/",
    plugins: [react(), cloudflare()],
    resolve: {
      alias: {
        "@": path.resolve(rootDir, "./src/frontend"),
        "@shared": path.resolve(rootDir, "./src/shared"),
      },
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/health": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/ready": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: "dist/client",
      emptyOutDir: true,
      sourcemap: false,
    },
  };
});