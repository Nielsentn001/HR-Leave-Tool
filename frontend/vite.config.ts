import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite is the dev server / build tool — it serves files as native ES
// modules in development (no bundling needed until production build),
// which is why it starts up and hot-reloads much faster than older
// bundler-based setups. The react() plugin adds JSX transform support
// and fast-refresh (hot reload that preserves component state on edit).
export default defineConfig({
  plugins: [react()],
});
