// Shared weather-domain types. Single source of truth — import from here,
// never re-declare these interfaces in components (see SearchBar fix, Phase 0).

export interface WeatherData {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    is_day: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    relative_humidity_2m: number;
    surface_pressure: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    precipitation_probability_max: Array<number | null>;
    wind_speed_10m_max: number[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  latitude: number;
  longitude: number;
  utc_offset_seconds: number;
  timezone: string;
}

export interface CityData {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  label: string;
}

export interface GeoResult {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  admin1?: string;
  postcode?: string[];
}
