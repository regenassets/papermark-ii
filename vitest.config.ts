import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/**",
        ".next/**",
        "out/**",
        "coverage/**",
        "**/*.config.{js,ts,mjs}",
        "**/*.d.ts",
        "**/types.ts",
        "prisma/**",
        "public/**",
        "docker/**",
        "nginx/**",
        "components/emails/**", // Email templates are visual
        "trigger/**", // Background jobs tested separately
        "**/__tests__/**",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
      ],
      include: ["lib/**", "pages/api/**", "app/api/**", "components/**"],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
    // Increase timeout for integration tests
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/components": path.resolve(__dirname, "./components"),
      "@/ee": path.resolve(__dirname, "./ee"),
      "@/prisma": path.resolve(__dirname, "./prisma"),
    },
  },
});
