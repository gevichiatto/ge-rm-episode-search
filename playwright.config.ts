import { defineConfig, devices } from "@playwright/test";

const APP_PORT = 3100;
const MOCK_PORT = 4010;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false, // o mock tem estado (falha transitória)
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${APP_PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON tests/e2e/mock-api.ts",
      url: `http://localhost:${MOCK_PORT}/__health`,
      env: { MOCK_API_PORT: String(MOCK_PORT) },
      reuseExistingServer: !process.env.CI,
    },
    {
      // `next dev`: em produção o client recusa `http://`, e o mock é http://localhost.
      command: `pnpm exec next dev --port ${APP_PORT}`,
      url: `http://localhost:${APP_PORT}`,
      env: {
        RICK_AND_MORTY_API_BASE_URL: `http://localhost:${MOCK_PORT}`,
        NEXT_DIST_DIR: ".next-e2e",
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
