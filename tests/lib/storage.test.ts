import { beforeEach, describe, expect, it } from "vitest";
import { readJSON, removeKey, writeJSON } from "@/lib/storage";

describe("storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips JSON values", () => {
    writeJSON("weather:test", { a: 1 });
    expect(readJSON("weather:test", {})).toEqual({ a: 1 });
  });

  it("returns the fallback for missing keys", () => {
    expect(readJSON("weather:missing", "fallback")).toBe("fallback");
  });

  it("returns the fallback for corrupt JSON instead of throwing", () => {
    window.localStorage.setItem("weather:corrupt", "{nope");
    expect(readJSON("weather:corrupt", [])).toEqual([]);
  });

  it("removes keys", () => {
    writeJSON("weather:temp", 1);
    removeKey("weather:temp");
    expect(readJSON("weather:temp", null)).toBeNull();
  });
});
