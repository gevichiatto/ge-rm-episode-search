import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname),
    },
  },
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["lib/**", "config/**", "components/**"],
      // Medido em 99% (linhas), 91% (branches) e 97% (funções); pisos abaixo disso para pegar regressões, sem travar mudanças pequenas.
      thresholds: { statements: 95, lines: 95, functions: 90, branches: 85 },
      reporter: [["text", { skipFull: false }], "html"],
    },
  },
});
