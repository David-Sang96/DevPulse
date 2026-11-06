import { describe, expect, it } from "vitest";
import { metadata } from "@/app/layout";

describe("Vitest setup", () => {
  it("resolves the @/ alias to src/", () => {
    expect(typeof metadata.title).toBe("string");
    expect(metadata.title).not.toBe("");
  });
});
