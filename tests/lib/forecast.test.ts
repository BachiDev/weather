import { describe, expect, it } from "vitest";
import {
  locationNowIso,
  sliceDayHours,
  sliceNext24Hours,
} from "@/lib/forecast";

function hourlyFixture(): {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
} {
  const time: string[] = [];
  const temperature_2m: number[] = [];
  const weather_code: number[] = [];
  for (let day = 29; day <= 30; day++) {
    for (let h = 0; h < 24; h++) {
      time.push(`2026-09-${day}T${String(h).padStart(2, "0")}:00`);
      temperature_2m.push(h);
      weather_code.push(0);
    }
  }
  return { time, temperature_2m, weather_code };
}

describe("sliceNext24Hours", () => {
  it("starts at the observation hour and returns 24 points", () => {
    const points = sliceNext24Hours(hourlyFixture(), "2026-09-29T14:00");
    expect(points).toHaveLength(24);
    expect(points[0].time).toBe("2026-09-29T14:00");
    expect(points[23].time).toBe("2026-09-30T13:00");
  });

  it("falls back to the first 24 entries instead of slice(-1) garbage", () => {
    const hourly = hourlyFixture();
    expect(sliceNext24Hours(hourly, "")).toHaveLength(24);
    const beyond = sliceNext24Hours(hourly, "2030-01-01T00:00");
    expect(beyond[0].time).toBe(hourly.time[0]);
  });

  it("clamps at the end of the range", () => {
    const points = sliceNext24Hours(hourlyFixture(), "2026-09-30T20:00");
    expect(points[0].time).toBe("2026-09-30T20:00");
    expect(points).toHaveLength(4);
  });
});

describe("locationNowIso", () => {
  it("shifts UTC now by the location offset into a comparable stamp", () => {
    // 2026-09-29T10:00:00Z == 12:00 in Vienna (UTC+2).
    const nowMs = Date.UTC(2026, 8, 29, 10, 0, 0);
    expect(locationNowIso(7200, nowMs)).toBe("2026-09-29T12:00");
    expect(locationNowIso(0, nowMs)).toBe("2026-09-29T10:00");
    expect(locationNowIso(-18000, nowMs)).toBe("2026-09-29T05:00");
  });

  it("lands inside the hourly window it anchors", () => {
    const hourly = hourlyFixture();
    const nowMs = Date.UTC(2026, 8, 29, 12, 30, 0); // 14:30 local, offset +2
    const points = sliceNext24Hours(hourly, locationNowIso(7200, nowMs));
    expect(points[0].time).toBe("2026-09-29T15:00");
  });
});

describe("sliceDayHours", () => {
  it("returns all 24 points of one day", () => {
    const points = sliceDayHours(hourlyFixture(), 1);
    expect(points).toHaveLength(24);
    expect(points[0].time).toBe("2026-09-30T00:00");
    expect(points[23].time).toBe("2026-09-30T23:00");
  });

  it("carries precip and humidity when present", () => {
    const hourly = {
      ...hourlyFixture(),
      precipitation_probability: Array(48).fill(20),
      relative_humidity_2m: Array(48).fill(60),
    };
    const points = sliceDayHours(hourly, 0);
    expect(points[0].precip).toBe(20);
    expect(points[0].humidity).toBe(60);
  });

  it("returns nulls when the extras are missing and [] for bad indices", () => {
    expect(sliceDayHours(hourlyFixture(), 0)[0].precip).toBeNull();
    expect(sliceDayHours(hourlyFixture(), -1)).toEqual([]);
    expect(sliceDayHours(hourlyFixture(), 1.5)).toEqual([]);
    expect(sliceDayHours(hourlyFixture(), 9)).toEqual([]);
  });
});
