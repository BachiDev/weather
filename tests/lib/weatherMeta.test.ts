import { describe, expect, it } from "vitest";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Cloudy,
  Moon,
  Snowflake,
  Sun,
} from "lucide-react";
import { getWeatherMeta } from "@/lib/weatherCodes";

describe("getWeatherMeta", () => {
  it("returns day/night variants for clear and partly cloudy", () => {
    expect(getWeatherMeta(0, true).Icon).toBe(Sun);
    expect(getWeatherMeta(0, false).Icon).toBe(Moon);
    expect(getWeatherMeta(2, true).Icon).toBe(CloudSun);
    expect(getWeatherMeta(2, false).Icon).toBe(CloudMoon);
    expect(getWeatherMeta(3).Icon).toBe(Cloudy);
  });

  it("covers every documented WMO band", () => {
    const cases: Array<[number, unknown]> = [
      [45, CloudFog],
      [51, CloudDrizzle],
      [57, CloudDrizzle],
      [61, CloudRain],
      [65, CloudRain],
      [80, CloudRain],
      [66, CloudHail],
      [96, CloudHail],
      [99, CloudHail],
      [71, CloudSnow],
      [77, Snowflake],
      [85, CloudSnow],
      [95, CloudLightning],
    ];
    for (const [code, Icon] of cases) {
      expect(getWeatherMeta(code).Icon, `code ${code}`).toBe(Icon);
    }
  });

  it("falls back to Cloud with a label for unknown codes", () => {
    const meta = getWeatherMeta(999);
    expect(meta.Icon).toBe(Cloud);
    expect(meta.label).toBe("Unknown conditions");
  });
});
