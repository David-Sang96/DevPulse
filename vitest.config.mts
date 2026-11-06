import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

// Ordinary unit tests run in UTC, so they never depend on the PC's own zone.
const UNIT_TEST_TIME_ZONE = "UTC";
// Week and schedule rules use Malaysia time; *.tz.test.ts files run in it.
const MALAYSIA_TIME_ZONE = "Asia/Kuala_Lumpur";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          exclude: [...configDefaults.exclude, "**/*.tz.test.ts"],
          env: { TZ: UNIT_TEST_TIME_ZONE },
        },
      },
      {
        extends: true,
        test: {
          name: "tz-kuala-lumpur",
          include: ["src/**/*.tz.test.ts"],
          env: { TZ: MALAYSIA_TIME_ZONE },
        },
      },
    ],
  },
});
