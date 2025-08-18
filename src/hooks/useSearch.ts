import { useState, useEffect, useCallback } from "react";
import { CityData } from "../app/interfaces";
import { fetchCityOptions, fetchDefaultCityData } from "../app/api";

export const useSearch = () => {
  const [city, setCity] = useState<string | null>("Vienna");
  const [cityOptions, setCityOptions] = useState<CityData[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);

  const fetchCityOptionsCallback = useCallback(async (cityName: string) => {
    setCityOptions([]);

    if (!cityName.trim()) {
      return;
    }

    try {
      const options = await fetchCityOptions(cityName);
      setCityOptions(options);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleSearchInputChange = (newCity: string) => {
    setCity(newCity);
    if (newCity.trim()) {
      fetchCityOptionsCallback(newCity);
    } else {
      setCityOptions([]);
    }
  };

  const handleCitySelect = (selected: CityData | null) => {
    setSelectedCity(selected);
    setCityOptions([]);
  };

  useEffect(() => {
    const loadDefaultCity = async () => {
      if (city === "Vienna" && !selectedCity) {
        try {
          const defaultCityData = await fetchDefaultCityData();
          if (defaultCityData) {
            setSelectedCity(defaultCityData);
            setCity(defaultCityData.name);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    loadDefaultCity();
  }, [city, selectedCity]);

  return {
    city,
    setCity,
    cityOptions,
    selectedCity,
    setSelectedCity,
    handleSearchInputChange,
    handleCitySelect,
  };
};