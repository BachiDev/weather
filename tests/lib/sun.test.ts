import { describe, expect, it } from "vitest";
import { sunDot, sunPosition } from "@/lib/sun";

const RISE = "2026-09-29T07:00";
const SET = "2026-09-29T19:00";

describe("sunPosition", () => {
  it("tracks progress through the day", () => {
    expect(sunPosition(RISE, SET, "2026-09-29T07:00")).toEqual({
      state: "day",
      progress: 0,
    });
    expect(sunPosition(RISE, SET, "2026-09-29T13:00")).toEqual({
      state: "day",
      progress: 0.5,
    });
    const end = sunPosition(RISE, SET, "2026-09-29T18:59");
    expect(end.state).toBe("day");
    expect(end.progress).toBeGreaterThan(0.99);
  });

  it("reports night outside the arc", () => {
    expect(sunPosition(RISE, SET, "2026-09-29T06:59")).toEqual({
      state: "night",
      progress: 0,
    });
    expect(sunPosition(RISE, SET, "2026-09-29T19:00")).toEqual({
      state: "night",
      progress: 1,
    });
    expect(sunPosition(RISE, SET, "2026-09-29T23:00")).toEqual({
      state: "night",
      progress: 1,
    });
  });

  it("degrades to unknown for polar days or garbage", () => {
    expect(sunPosition("", SET, "2026-09-29T12:00").state).toBe("unknown");
    expect(sunPosition(RISE, "", "2026-09-29T12:00").state).toBe("unknown");
    expect(sunPosition(SET, RISE, "2026-09-29T12:00").state).toBe("unknown");
    expect(sunPosition("nope", SET, "2026-09-29T12:00").state).toBe("unknown");
  });
});

describe("sunDot", () => {
  it("travels left sunrise → top noon → right sunset", () => {
    expect(sunDot(0)).toEqual({ x: 10, y: 100 });
    const noon = sunDot(0.5);
    expect(noon.x).toBe(100);
    expect(noon.y).toBeCloseTo(10, 10);
    const set = sunDot(1);
    expect(set.x).toBe(190);
    expect(set.y).toBeCloseTo(100, 10);
  });

  it("clamps out-of-range progress", () => {
    expect(sunDot(-2)).toEqual(sunDot(0));
    expect(sunDot(42)).toEqual(sunDot(1));
  });
});
