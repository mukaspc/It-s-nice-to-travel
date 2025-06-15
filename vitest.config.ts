/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: 'v8',
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}", 
        "src/test/**/*",
        "src/**/*.d.ts",
        "src/env.d.ts",
        "src/types.ts"
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
  },
});
