import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

const shim = (p: string) => path.resolve("src/demo/shims", p);

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => ({
  plugins: [react()],

  // `--mode demo` builds the real app as a standalone web demo: the Tauri modules
  // are aliased to in-browser shims (src/demo/shims) backed by an in-memory store,
  // and the output is served from /demo/. See src/demo/runtime.ts.
  base: mode === "demo" ? "/demo/" : "/",
  resolve: mode === "demo" ? {
    alias: {
      "@tauri-apps/api/core": shim("core.ts"),
      "@tauri-apps/api/event": shim("event.ts"),
      "@tauri-apps/api/window": shim("window.ts"),
      "@tauri-apps/plugin-dialog": shim("dialog.ts"),
      "@tauri-apps/plugin-opener": shim("opener.ts"),
    },
  } : undefined,

  // Split the big vendors into their own chunks so the main app bundle stays small
  // (was a single ~650 kB chunk). dagre + html-to-image are dynamically imported, so
  // they auto-split into on-demand chunks; the rest are vendor chunks here.
  build: {
    // `website/` is a workspace-level sibling of this app dir, hence `../website/demo`.
    outDir: mode === "demo" ? "../website/demo" : "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@xyflow")) return "vendor-reactflow";
          if (id.includes("react-dom") || id.includes("/scheduler/") || /[\\/]react[\\/]/.test(id))
            return "vendor-react";
          // dagre + html-to-image are dynamic imports → leave them as on-demand chunks.
        },
      },
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
