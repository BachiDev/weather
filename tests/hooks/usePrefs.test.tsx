import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useUnits } from "@/hooks/useUnits";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { DEFAULT_CITY } from "@/lib/defaultCity";

describe("useUnits", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to metric and toggles with persistence", async () => {
    const { result, unmount } = renderHook(() => useUnits());
    expect(result.current.tempUnit).toBe("c");
    expect(result.current.speedUnit).toBe("kmh");
    expect(result.current.hourFormat).toBe("24h");

    act(() => {
      result.current.toggleTemp();
      result.current.toggleSpeed();
      result.current.toggleHour();
    });
    expect(result.current.tempUnit).toBe("f");
    expect(result.current.speedUnit).toBe("mph");
    expect(result.current.hourFormat).toBe("12h");
    unmount();

    // A fresh mount reads the stored prefs (after the mount effect).
    const second = renderHook(() => useUnits());
    await waitFor(() => expect(second.result.current.tempUnit).toBe("f"));
    expect(second.result.current.speedUnit).toBe("mph");
    expect(second.result.current.hourFormat).toBe("12h");
  });
});

describe("useRecentSearches", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds, dedupes, caps at five, and clears", () => {
    const { result } = renderHook(() => useRecentSearches());
    expect(result.current.recents).toEqual([]);

    const city = (id: number) => ({ ...DEFAULT_CITY, id, name: `City ${id}` });
    act(() => {
      for (let id = 1; id <= 6; id++) result.current.addRecent(city(id));
    });
    expect(result.current.recents.map((c) => c.id)).toEqual([6, 5, 4, 3, 2]);

    act(() => {
      result.current.addRecent(city(4)); // re-add moves to front, no duplicate
    });
    expect(result.current.recents.map((c) => c.id)).toEqual([4, 6, 5, 3, 2]);

    act(() => {
      result.current.clearRecents();
    });
    expect(result.current.recents).toEqual([]);
  });
});
