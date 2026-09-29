import { describe, expect, it } from "vitest";
import { getWeatherDescription } from "@/lib/weatherCodes";

describe("getWeatherDescription", () => {
  it("labels the clear/cloud bands", () => {
    expect(getWeatherDescription(0)).toBe("Clear sky");
    expect(getWeatherDescription(1)).toBe("Mainly clear");
    expect(getWeatherDescription(2)).toBe("Partly cloudy");
    expect(getWeatherDescription(3)).toBe("Overcast");
  });

  it("labels fog, drizzle, rain, snow, showers and thunderstorms", () => {
    expect(getWeatherDescription(45)).toBe("Fog");
    expect(getWeatherDescription(51)).toBe("Light drizzle");
    expect(getWeatherDescription(61)).toBe("Slight rain");
    expect(getWeatherDescription(71)).toBe("Slight snow");
    expect(getWeatherDescription(80)).toBe("Slight rain showers");
    expect(getWeatherDescription(85)).toBe("Slight snow showers");
    expect(getWeatherDescription(95)).toBe("Thunderstorm");
    expect(getWeatherDescription(96)).toBe("Thunderstorm with slight hail");
    expect(getWeatherDescription(99)).toBe("Thunderstorm with heavy hail");
  });

  it("falls back gracefully for unknown codes instead of crashing", () => {
    expect(getWeatherDescription(999)).toBe("Unknown conditions");
    expect(getWeatherDescription(-1)).toBe("Unknown conditions");
  });
});
