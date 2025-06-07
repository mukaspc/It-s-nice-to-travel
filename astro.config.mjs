// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  integrations: [
    react(),
    sitemap(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  server: {
    port: 3000,
    host: true,
  },
  vite: {
    css: {
      preprocessorOptions: {
        css: {
          additionalData: `@import "tw-animate-css/dist/tw-animate.css";`,
        },
      },
    },
  },
});
