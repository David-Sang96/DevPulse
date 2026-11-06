import { describe, expect, it } from "vitest";

const UNIT_TEST_TIME_ZONE = "UTC";
const UTC_OFFSET_MINUTES = 0;

describe("Vitest unit project", () => {
  it("runs in UTC, as set by its Vitest project", () => {
    expect(process.env.TZ).toBe(UNIT_TEST_TIME_ZONE);
    expect(new Date().getTimezoneOffset()).toBe(UTC_OFFSET_MINUTES);
  });
});
