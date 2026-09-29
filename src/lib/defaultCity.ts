import type { CityData } from "@/types/weather";

// Static default city. Previously resolved via a geocoding round-trip on every
// first visit (`fetchDefaultCityData`) — wasteful for a fixed default.
// Coordinates: Vienna, Austria (Open-Meteo geocoding, 2026-09-29).
export const DEFAULT_CITY: CityData = {
  id: 2761369,
  latitude: 48.2082,
  longitude: 16.3738,
  name: "Vienna",
  country: "Austria",
  label: "Vienna, Wien, Austria",
};
