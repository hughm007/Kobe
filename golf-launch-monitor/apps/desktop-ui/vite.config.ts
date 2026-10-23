import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

/**
 * Production builds get a Content-Security-Policy that forbids any third-party origin: the app
 * is offline-first and must never contact a server (no CDNs, no web fonts, no analytics).
 * Dev builds skip it because the React fast-refresh preamble is an inline script.
 */
function offlineContentSecurityPolicy(): Plugin {
  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    "worker-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join("; ");
  return {
    name: "glm-offline-csp",
    apply: "build",
    transformIndexHtml: () => [
      { tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: policy }, injectTo: "head-prepend" },
    ],
  };
}

/** Desktop range UI. The shot pipeline runs in a module Web Worker (src/worker/pipeline.worker.ts). */
export default defineConfig({
  // Relative asset URLs: the build can be served from any local path or packaged in a desktop shell.
  base: "./",
  plugins: [react(), offlineContentSecurityPolicy()],
  worker: { format: "es" },
  build: {
    target: "es2022",
    sourcemap: true,
    // Main and worker bundles both carry the zod contract schemas and the physics packages.
    chunkSizeWarningLimit: 2000,
  },
  test: {
    name: "desktop-ui",
    environment: "jsdom",
    include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
    setupFiles: ["./test/setup.ts"],
    testTimeout: 60000,
  },
});
