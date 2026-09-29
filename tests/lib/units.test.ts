import { describe, expect, it } from "vitest";
import {
  formatHourLabel,
  formatSpeed,
  formatTemp,
  formatTimeOfDay,
  formatWindDirection,
  toSpeed,
  toTemp,
} from "@/lib/units";

describe("temperature", () => {
  it("passes Celsius through and converts to Fahrenheit", () => {
    expect(toTemp(20, "c")).toBe(20);
    expect(toTemp(20, "f")).toBe(68);
    expect(toTemp(0, "f")).toBe(32);
    expect(toTemp(-40, "f")).toBe(-40);
  });

  it("formats with the unit suffix", () => {
    expect(formatTemp(20, "c")).toBe("20°C");
    expect(formatTemp(20, "f")).toBe("68°F");
  });
});

describe("speed", () => {
  it("passes km/h through and converts to mph", () => {
    expect(toSpeed(100, "kmh")).toBe(100);
    expect(toSpeed(100, "mph")).toBe(62);
  });

  it("formats with the unit suffix", () => {
    expect(formatSpeed(10, "kmh")).toBe("10 km/h");
    expect(formatSpeed(10, "mph")).toBe("6 mph");
  });
});

describe("formatWindDirection", () => {
  it("maps degrees to the 16-point compass", () => {
    expect(formatWindDirection(0)).toBe("N");
    expect(formatWindDirection(90)).toBe("E");
    expect(formatWindDirection(180)).toBe("S");
    expect(formatWindDirection(270)).toBe("W");
    expect(formatWindDirection(45)).toBe("NE");
    expect(formatWindDirection(360)).toBe("N");
  });

  it("normalizes out-of-range input", () => {
    expect(formatWindDirection(-45)).toBe("NW");
    expect(formatWindDirection(720)).toBe("N");
  });
});

describe("time formatting", () => {
  it("formats location-local ISO times", () => {
    const time = formatTimeOfDay("2026-09-29T07:12");
    expect(time).toContain(":");
    expect(time).toMatch(/AM|PM/);
  });

  it("formats hour labels compactly", () => {
    expect(formatHourLabel("2026-09-29T14:00")).toBe("2 PM");
  });

  it("falls back gracefully for garbage input", () => {
    expect(formatTimeOfDay("not-a-date")).toBe("—");
    expect(formatHourLabel("")).toBe("—");
  });
});
