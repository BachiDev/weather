import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useSearch } from "@/hooks/useSearch";
import { DEFAULT_CITY } from "@/lib/defaultCity";

const graz = {
  id: 2778067,
  latitude: 47.07,
  longitude: 15.43,
  name: "Graz",
  country: "Austria",
  admin1: "Styria",
};

describe("useSearch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts with the Vienna default selected", () => {
    const { result } = renderHook(() => useSearch());
    expect(result.current.selectedCity).toEqual(DEFAULT_CITY);
    expect(result.current.cityOptions).toEqual([]);
    expect(result.current.searching).toBe(false);
  });

  it("fetches suggestions on input and selects a city", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          ({
            ok: true,
            status: 200,
            json: async () => ({ results: [graz] }),
          }) as Response,
      ),
    );
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.handleSearchInputChange("Graz");
    });
    expect(result.current.searching).toBe(true);

    await waitFor(() => expect(result.current.searching).toBe(false));
    expect(result.current.cityOptions).toHaveLength(1);
    expect(result.current.cityOptions[0].label).toContain("Graz");

    act(() => {
      result.current.handleCitySelect(result.current.cityOptions[0]);
    });
    expect(result.current.selectedCity?.name).toBe("Graz");
    expect(result.current.cityOptions).toEqual([]);
  });

  it("clears suggestions on empty input without fetching", async () => {
    const fetchMock = vi.fn(
      async () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({ results: [graz] }),
        }) as Response,
    );
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.handleSearchInputChange("Graz");
    });
    await waitFor(() => expect(result.current.searching).toBe(false));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.handleSearchInputChange("   ");
    });
    expect(result.current.cityOptions).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
