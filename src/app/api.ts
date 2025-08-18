import axios from "axios";
import { WeatherData, CityData, GeoResult } from "./interfaces";

const WEATHER_API_BASE_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_API_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

const mapGeoResultToCityData = (result: GeoResult): CityData => {
  const state = result.admin1 ? `, ${result.admin1}` : "";
  const postal = result.postcode && result.postcode.length > 0 ? ` (${result.postcode[0]})` : "";

  return {
    id: result.id,
    latitude: result.latitude,
    longitude: result.longitude,
    name: result.name,
    country: result.country,
    label: `${result.name}${state}, ${result.country}${postal}`,
  };
};

export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  const response = await axios.get(
    `${WEATHER_API_BASE_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,wind_speed_10m,relative_humidity_2m,surface_pressure,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&hourly=temperature_2m,weather_code&timezone=auto&forecast_days=7`
  );
  return response.data;
};

export const fetchCityOptions = async (cityName: string): Promise<CityData[]> => {
  const response = await axios.get(
    `${GEOCODING_API_BASE_URL}?name=${cityName}&count=10&language=en&format=json`
  );

  if (response.data.results && response.data.results.length > 0) {
    const options: CityData[] = response.data.results.map(mapGeoResultToCityData);
    return options;
  }
  return [];
};

export const fetchDefaultCityData = async (): Promise<CityData | null> => {
  const response = await axios.get(
    `${GEOCODING_API_BASE_URL}?name=Vienna&count=1&language=en&format=json`
  );
  if (response.data.results && response.data.results.length > 0) {
    const result = response.data.results[0];
    return mapGeoResultToCityData(result);
  }
  return null;
};