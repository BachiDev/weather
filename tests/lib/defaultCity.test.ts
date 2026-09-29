import { describe, expect, it } from "vitest";
import { DEFAULT_CITY } from "@/lib/defaultCity";

// Phase 0 toolchain smoke test: proves vitest + tsconfig paths (@/*) resolve.
describe("DEFAULT_CITY", () => {
  it("is Vienna with plausible coordinates and a label", () => {
    expect(DEFAULT_CITY.name).toBe("Vienna");
    expect(DEFAULT_CITY.latitude).toBeCloseTo(48.21, 1);
    expect(DEFAULT_CITY.longitude).toBeCloseTo(16.37, 1);
    expect(DEFAULT_CITY.label).toContain("Vienna");
  });
});
