import { describe, expect, it } from "vitest";

const MALAYSIA_TIME_ZONE = "Asia/Kuala_Lumpur";
// Date.getTimezoneOffset() counts minutes behind UTC, so UTC+8 is negative.
const MALAYSIA_OFFSET_MINUTES = -8 * 60;

describe("Vitest time-zone project", () => {
  it("runs with the TZ set by its Vitest project", () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(
      MALAYSIA_TIME_ZONE,
    );
    expect(new Date("2026-01-05T00:00:00Z").getTimezoneOffset()).toBe(
      MALAYSIA_OFFSET_MINUTES,
    );
  });
});
