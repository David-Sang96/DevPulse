import { defineConfig, devices } from "@playwright/test";

// Not 3000, so a running `yarn dev` never clashes with the E2E server.
const E2E_PORT = 3100;
const E2E_BASE_URL = `http://127.0.0.1:${E2E_PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  reporter: "list",
  use: { baseURL: E2E_BASE_URL },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  webServer: {
    command: `yarn build && yarn start --port ${E2E_PORT}`,
    url: E2E_BASE_URL,
    // Fail loudly if the port is busy, rather than testing an unknown server.
    reuseExistingServer: false,
    // A cold production build can take a while.
    timeout: 180_000,
  },
});
