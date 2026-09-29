import { useCallback, useState } from "react";
import type { CityData } from "@/types/weather";
import { searchCities } from "@/lib/openMeteo";
import { DEFAULT_CITY } from "@/lib/defaultCity";

/** City search state. Starts at the Vienna default; deep-links override via `handleCitySelect`. */
export const useSearch = () => {
  const [city, setCity] = useState<string | null>(DEFAULT_CITY.name);
  const [cityOptions, setCityOptions] = useState<CityData[]>([]);
  const [searching, setSearching] = useState(false);
  // Static default — no geocoding round-trip on first visit (Phase 0).
  const [selectedCity, setSelectedCity] = useState<CityData | null>(
    DEFAULT_CITY,
  );

  const fetchCityOptionsCallback = useCallback(async (cityName: string) => {
    setCityOptions([]);

    if (!cityName.trim()) {
      return;
    }

    setSearching(true);
    try {
      const options = await searchCities(cityName);
      setCityOptions(options);
    } catch {
      // Search suggestions are best-effort; the input stays usable.
      setCityOptions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchInputChange = (newCity: string) => {
    setCity(newCity);
    if (newCity.trim()) {
      void fetchCityOptionsCallback(newCity);
    } else {
      setCityOptions([]);
    }
  };

  const handleCitySelect = (selected: CityData | null) => {
    setSelectedCity(selected);
    setCityOptions([]);
  };

  return {
    city,
    setCity,
    cityOptions,
    searching,
    selectedCity,
    setSelectedCity,
    handleSearchInputChange,
    handleCitySelect,
  };
};
