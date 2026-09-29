"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Typography, Box, Fade } from "@mui/material";
import { Hero } from "../components/Hero";
import SearchBar from "../components/SearchBar";
import CurrentWeather from "../components/CurrentWeather";
import DailyForecast from "../components/DailyForecast";
import HourlyForecast from "../components/HourlyForecast";
import { UnitsToggle } from "../components/UnitsToggle";
import { RecentSearches } from "../components/RecentSearches";
import { GeolocateButton } from "../components/GeolocateButton";
import { OfflineBanner } from "../components/OfflineBanner";
import { EmptyState, ErrorState, ResultsSkeleton } from "../components/states";
import { useSearch } from "../hooks/useSearch";
import { useWeather } from "../hooks/useWeather";
import { useUnits } from "../hooks/useUnits";
import { useRecentSearches } from "../hooks/useRecentSearches";
import {
  cityFromParams,
  decodeCityParams,
  encodeCityParams,
} from "@/lib/params";
import { locationNowIso } from "@/lib/forecast";
import type { CityData } from "@/types/weather";

export default function Home() {
  const router = useRouter();
  const {
    cityOptions,
    searching,
    selectedCity,
    handleSearchInputChange,
    handleCitySelect,
  } = useSearch();
  const { weatherData, loading, error, retry } = useWeather(selectedCity);
  const { tempUnit, speedUnit, toggleTemp, toggleSpeed } = useUnits();
  const { recents, addRecent, clearRecents } = useRecentSearches();
  // Deep-link (?name=&lat=&lon=) is applied after mount so the static
  // prerender stays complete (no useSearchParams bailout). The stale-response
  // guard drops the superseded default-city fetch.
  const [paramsApplied, setParamsApplied] = useState(false);

  useEffect(() => {
    const decoded = decodeCityParams(
      new URLSearchParams(window.location.search),
    );
    if (decoded) handleCitySelect(cityFromParams(decoded));
    setParamsApplied(true);
    // Run once on mount — selections afterwards are user-driven.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectCity = (city: CityData | null) => {
    handleCitySelect(city);
    if (city) {
      addRecent(city);
      router.replace(`?${encodeCityParams(city)}`, { scroll: false });
    }
  };

  const handleGeolocation = (lat: number, lon: number) => {
    selectCity(cityFromParams({ name: "Current location", lat, lon }));
  };

  const showSkeleton = (loading || !paramsApplied) && !weatherData && !error;
  const showResults = weatherData && !loading && !error;

  return (
    <>
      <Hero />

      <div className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-6">
        <OfflineBanner />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 2,
            width: "100%",
            maxWidth: 600,
            margin: "0 auto",
          }}
        >
          <SearchBar
            selected={selectedCity}
            searching={searching}
            onSearchInputChange={handleSearchInputChange}
            options={cityOptions}
            onCitySelect={selectCity}
          />
        </Box>

        <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
          <GeolocateButton onLocation={handleGeolocation} />
          <UnitsToggle
            tempUnit={tempUnit}
            speedUnit={speedUnit}
            onToggleTemp={toggleTemp}
            onToggleSpeed={toggleSpeed}
          />
        </div>

        <div className="mb-6">
          <RecentSearches
            recents={recents}
            onSelect={selectCity}
            onClear={clearRecents}
          />
        </div>

        <div aria-live="polite">
          {showSkeleton && <ResultsSkeleton />}

          {error && !loading && <ErrorState message={error} onRetry={retry} />}

          {!loading && !error && !weatherData && paramsApplied && (
            <EmptyState />
          )}

          {showResults && (
            <Fade in timeout={1000}>
              <Box sx={{ width: "100%" }}>
                <Typography
                  variant="h4"
                  component="h2"
                  gutterBottom
                  align="center"
                >
                  {selectedCity?.label}
                </Typography>
                <CurrentWeather
                  current={weatherData.current}
                  sunrise={weatherData.daily.sunrise[0]}
                  sunset={weatherData.daily.sunset[0]}
                  tempUnit={tempUnit}
                  speedUnit={speedUnit}
                />
              </Box>
            </Fade>
          )}

          {showResults && (
            <Fade in timeout={1000}>
              <Box sx={{ width: "100%", mt: 4 }}>
                <DailyForecast data={weatherData.daily} tempUnit={tempUnit} />
              </Box>
            </Fade>
          )}

          {showResults && (
            <Fade in timeout={1000}>
              <Box sx={{ width: "100%", mt: 4 }}>
                <HourlyForecast
                  data={weatherData.hourly}
                  // Location-local "now" from utc_offset_seconds (current.time is
                  // not requestable — Open-Meteo 400s it as an explicit variable).
                  currentTime={locationNowIso(weatherData.utc_offset_seconds)}
                  tempUnit={tempUnit}
                />
              </Box>
            </Fade>
          )}
        </div>
      </div>
    </>
  );
}
