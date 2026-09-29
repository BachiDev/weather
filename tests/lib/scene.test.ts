import { describe, expect, it } from "vitest";
import { getSceneKind, sceneBackground } from "@/lib/scene";

describe("getSceneKind", () => {
  it("splits clear and cloudy by day/night", () => {
    expect(getSceneKind(0, true)).toBe("clear-day");
    expect(getSceneKind(0, false)).toBe("clear-night");
    expect(getSceneKind(2, true)).toBe("cloud-day");
    expect(getSceneKind(3, false)).toBe("cloud-night");
  });

  it("maps the precipitation bands", () => {
    expect(getSceneKind(45, true)).toBe("fog");
    expect(getSceneKind(55, true)).toBe("precip");
    expect(getSceneKind(65, true)).toBe("precip");
    expect(getSceneKind(81, true)).toBe("precip");
    expect(getSceneKind(73, true)).toBe("snow");
    expect(getSceneKind(77, true)).toBe("snow");
    expect(getSceneKind(95, true)).toBe("storm");
    expect(getSceneKind(99, false)).toBe("storm");
  });

  it("falls back to default for missing or unknown codes", () => {
    expect(getSceneKind(null, true)).toBe("default");
    expect(getSceneKind(undefined, false)).toBe("default");
    expect(getSceneKind(999, true)).toBe("default");
  });
});

describe("sceneBackground", () => {
  it("returns a gradient string for every kind", () => {
    const kinds = [
      "default",
      "clear-day",
      "clear-night",
      "cloud-day",
      "cloud-night",
      "fog",
      "precip",
      "snow",
      "storm",
    ] as const;
    for (const kind of kinds) {
      expect(sceneBackground(kind), kind).toContain("radial-gradient");
    }
  });
});
