import { useCallback, useEffect, useState } from "react";
import type { CityData } from "@/types/weather";
import { readJSON, writeJSON } from "@/lib/storage";

const RECENTS_KEY = "weather:recent-cities";
const MAX_RECENTS = 5;

/** Last N searched cities, persisted. Click-to-reload, no retyping. */
export function useRecentSearches() {
  // Empty first (matches the server HTML), stored recents after mount —
  // otherwise repeat visits hydrate differently than the prerender.
  const [recents, setRecents] = useState<CityData[]>([]);

  useEffect(() => {
    setRecents(readJSON<CityData[]>(RECENTS_KEY, []));
  }, []);

  const addRecent = useCallback((city: CityData) => {
    setRecents((prev) => {
      const next = [city, ...prev.filter((c) => c.id !== city.id)].slice(
        0,
        MAX_RECENTS,
      );
      writeJSON(RECENTS_KEY, next);
      return next;
    });
  }, []);

  const clearRecents = useCallback(() => {
    setRecents([]);
    writeJSON(RECENTS_KEY, []);
  }, []);

  return { recents, addRecent, clearRecents };
}
