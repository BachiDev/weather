interface WeatherData {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    wind_speed_10m: number;
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
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  latitude: number;
  longitude: number;
  timezone: string;
}

interface CityData {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  label: string;
}

interface GeoResult {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  admin1?: string;
  postcode?: string[];
}

export type { WeatherData, CityData, GeoResult };
