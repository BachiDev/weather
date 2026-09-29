import { describe, expect, it } from "vitest";
import {
  cityFromParams,
  decodeCityParams,
  encodeCityParams,
} from "@/lib/params";

describe("city deep-link params", () => {
  it("round-trips name and coordinates", () => {
    const encoded = encodeCityParams({
      name: "Graz",
      latitude: 47.07,
      longitude: 15.43,
    });
    const decoded = decodeCityParams(new URLSearchParams(encoded));
    expect(decoded).toEqual({ name: "Graz", lat: 47.07, lon: 15.43 });
  });

  it("rejects missing or out-of-range coordinates", () => {
    expect(decodeCityParams(new URLSearchParams("name=X"))).toBeNull();
    expect(
      decodeCityParams(new URLSearchParams("name=X&lat=999&lon=0")),
    ).toBeNull();
    expect(
      decodeCityParams(new URLSearchParams("name=X&lat=48&lon=500")),
    ).toBeNull();
    expect(decodeCityParams(new URLSearchParams(""))).toBeNull();
  });

  it("builds a deterministic CityData without geocoding", () => {
    const a = cityFromParams({ name: "Linz", lat: 48.3, lon: 14.28 });
    const b = cityFromParams({ name: "Linz", lat: 48.3, lon: 14.28 });
    expect(a.latitude).toBe(48.3);
    expect(a.label).toBe("Linz");
    expect(a.id).toBe(b.id);
    expect(a.id).toBeLessThan(0);
  });
});
