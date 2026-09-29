import { describe, expect, it } from "vitest";
import {
  cityFromParams,
  decodeCityParams,
  decodeCompareParam,
  decodeDayParam,
  encodeCityParams,
  encodeCompare,
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

describe("decodeDayParam", () => {
  it("accepts 0..6 and rejects everything else", () => {
    expect(decodeDayParam(new URLSearchParams("day=0"))).toBe(0);
    expect(decodeDayParam(new URLSearchParams("day=6"))).toBe(6);
    expect(decodeDayParam(new URLSearchParams(""))).toBeNull();
    expect(decodeDayParam(new URLSearchParams("day="))).toBeNull();
    expect(decodeDayParam(new URLSearchParams("day=7"))).toBeNull();
    expect(decodeDayParam(new URLSearchParams("day=-1"))).toBeNull();
    expect(decodeDayParam(new URLSearchParams("day=2.5"))).toBeNull();
    expect(decodeDayParam(new URLSearchParams("day=nope"))).toBeNull();
  });
});

describe("compare params", () => {
  const graz = { name: "Graz", latitude: 47.07, longitude: 15.43 };
  const sao = { name: "São Paulo", latitude: -23.55, longitude: -46.63 };

  it("round-trips names with spaces and umlauts", () => {
    const encoded = encodeCompare([graz, sao]);
    const decoded = decodeCompareParam(
      new URLSearchParams(`compare=${encodeURIComponent(encoded)}`),
    );
    expect(decoded.map((c) => c.name)).toEqual(["Graz", "São Paulo"]);
    expect(decoded[0].latitude).toBe(47.07);
  });

  it("caps at three, dedupes, and rejects garbage", () => {
    const four = [
      graz,
      sao,
      { ...graz, name: "Graz2" },
      { name: "Linz", latitude: 48.3, longitude: 14.28 },
    ];
    const decoded = decodeCompareParam(
      new URLSearchParams(`compare=${encodeURIComponent(encodeCompare(four))}`),
    );
    expect(decoded).toHaveLength(3);
    expect(decodeCompareParam(new URLSearchParams("compare=|||"))).toEqual([]);
    expect(decodeCompareParam(new URLSearchParams("compare=X~999~0"))).toEqual(
      [],
    );
    expect(decodeCompareParam(new URLSearchParams(""))).toEqual([]);
  });
});
