import { describe, expect, it } from "vitest";
import { moonPhase, SYNODIC_MONTH_DAYS } from "@/lib/moon";

const DAY_MS = 86_400_000;
const REF = Date.UTC(2000, 0, 6, 18, 14, 0);

describe("moonPhase", () => {
  it("is a new moon at the reference epoch", () => {
    const phase = moonPhase(REF);
    expect(phase.age).toBeCloseTo(0, 6);
    expect(phase.illumination).toBeCloseTo(0, 6);
    expect(phase.name).toBe("New Moon");
  });

  it("is full halfway through the cycle", () => {
    const phase = moonPhase(REF + (SYNODIC_MONTH_DAYS / 2) * DAY_MS);
    expect(phase.illumination).toBeCloseTo(1, 6);
    expect(phase.name).toBe("Full Moon");
  });

  it("walks the eight names in order across one cycle", () => {
    const names = Array.from(
      { length: 8 },
      (_, i) => moonPhase(REF + i * (SYNODIC_MONTH_DAYS / 8) * DAY_MS).name,
    );
    expect(names).toEqual([
      "New Moon",
      "Waxing Crescent",
      "First Quarter",
      "Waxing Gibbous",
      "Full Moon",
      "Waning Gibbous",
      "Last Quarter",
      "Waning Crescent",
    ]);
  });

  it("wraps cleanly (periodicity + bounds)", () => {
    const a = moonPhase(REF + 1234 * DAY_MS);
    const b = moonPhase(REF + 1234 * DAY_MS + SYNODIC_MONTH_DAYS * DAY_MS);
    expect(a.name).toBe(b.name);
    expect(a.illumination).toBeCloseTo(b.illumination, 10);
    expect(a.age).toBeGreaterThanOrEqual(0);
    expect(a.age).toBeLessThan(SYNODIC_MONTH_DAYS);
    expect(a.illumination).toBeGreaterThanOrEqual(0);
    expect(a.illumination).toBeLessThanOrEqual(1);
  });
});
