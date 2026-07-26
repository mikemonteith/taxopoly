import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  // Only set for the GitHub Pages build, so a project site served from
  // /<repo>/ still resolves its assets. Local dev and `npm start` stay at "/".
  base: process.env.PUBLIC_BASE_PATH || "/",
  plugins: [tailwindcss(), reactRouter(), cloudflare({
    viteEnvironment: {
      name: "ssr"
    }
  })],
  resolve: {
    tsconfigPaths: true,
  },
});