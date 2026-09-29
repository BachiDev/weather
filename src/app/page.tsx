"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Command, Plus } from "lucide-react";
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
import { SceneBackdrop } from "../components/SceneBackdrop";
import { SunArc } from "../components/SunArc";
import { MoonPhase } from "../components/MoonPhase";
import { PrecipForecast } from "../components/PrecipForecast";
import { CompareSection } from "../components/CompareSection";
import { CommandPalette } from "../components/CommandPalette";
import { EmptyState, ErrorState, ResultsSkeleton } from "../components/states";
import { useSearch } from "../hooks/useSearch";
import { useWeather } from "../hooks/useWeather";
import { useAirQuality } from "../hooks/useAirQuality";
import { useUnits } from "../hooks/useUnits";
import { useRecentSearches } from "../hooks/useRecentSearches";
import {
  cityFromParams,
  decodeCityParams,
  decodeCompareParam,
  decodeDayParam,
  encodeCityParams,
  encodeCompare,
} from "@/lib/params";
import { locationNowIso } from "@/lib/forecast";
import { formatDayLabel } from "@/lib/units";
import { readJSON, writeJSON } from "@/lib/storage";
import type { CityData } from "@/types/weather";

const COMPARE_KEY = "weather:compare";
const MAX_COMPARE = 3;

const RadarMap = dynamic(
  () => import("../components/RadarMap").then((m) => m.RadarMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="mx-auto aspect-square w-full max-w-[560px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.02]"
        role="status"
        aria-label="Loading rain radar"
      />
    ),
  },
);

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
  const { data: airQuality } = useAirQuality(selectedCity);
  const {
    tempUnit,
    speedUnit,
    hourFormat,
    toggleTemp,
    toggleSpeed,
    toggleHour,
  } = useUnits();
  const { recents, addRecent, clearRecents } = useRecentSearches();
  // Deep-link (?name=&lat=&lon=&day=&compare=) is applied after mount so the
  // static prerender stays complete (no useSearchParams bailout). The
  // stale-response guard drops the superseded default-city fetch.
  const [paramsApplied, setParamsApplied] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  // Compare list: empty first (matches the prerender), prefs after mount.
  const [compare, setCompare] = useState<CityData[]>([]);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const decoded = decodeCityParams(search);
    if (decoded) handleCitySelect(cityFromParams(decoded));
    setSelectedDay(decodeDayParam(search));
    const urlCompare = decodeCompareParam(search);
    if (urlCompare.length > 0) {
      setCompare(urlCompare);
    } else {
      setCompare(readJSON<CityData[]>(COMPARE_KEY, []));
    }
    setParamsApplied(true);
    // Run once on mount — selections afterwards are user-driven.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global ⌘K / Ctrl+K toggles the quick-switch palette.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const persistCompare = (list: CityData[]) => {
    setCompare(list);
    writeJSON(COMPARE_KEY, list);
  };

  const writeUrl = (
    city: CityData | null,
    day: number | null,
    list: CityData[],
  ) => {
    if (!city) return;
    let qs = encodeCityParams(city);
    if (day !== null) qs += `&day=${day}`;
    if (list.length > 0) qs += `&compare=${encodeCompare(list)}`;
    router.replace(`?${qs}`, { scroll: false });
  };

  const selectCity = (city: CityData | null) => {
    handleCitySelect(city);
    setSelectedDay(null); // new city → back to next-24h
    if (city) {
      addRecent(city);
      writeUrl(city, null, compare);
    }
  };

  const scrollToHourly = () => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document.getElementById("hourly")?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "nearest",
    });
  };

  const handleDaySelect = (index: number) => {
    setSelectedDay(index);
    if (selectedCity) {
      writeUrl(selectedCity, index, compare);
    }
    scrollToHourly();
  };

  const resetDay = () => {
    setSelectedDay(null);
    if (selectedCity) {
      writeUrl(selectedCity, null, compare);
    }
  };

  const addCompare = (city: CityData) => {
    if (compare.some((c) => c.id === city.id) || compare.length >= MAX_COMPARE)
      return;
    const next = [...compare, city];
    persistCompare(next);
    writeUrl(selectedCity, selectedDay, next);
  };

  const removeCompare = (id: number) => {
    const next = compare.filter((c) => c.id !== id);
    persistCompare(next);
    writeUrl(selectedCity, selectedDay, next);
  };

  const handleGeolocation = (lat: number, lon: number) => {
    selectCity(cityFromParams({ name: "Current location", lat, lon }));
  };

  const showSkeleton = (loading || !paramsApplied) && !weatherData && !error;
  const showResults = weatherData && !loading && !error;

  let drillLabel: string | null = null;
  if (weatherData && selectedDay !== null) {
    const { weekday, date } = formatDayLabel(
      weatherData.daily.time[selectedDay],
    );
    drillLabel = `${weekday}, ${date}`;
  }

  return (
    <>
      <SceneBackdrop
        code={weatherData?.current.weather_code}
        isDay={weatherData ? weatherData.current.is_day === 1 : true}
      />
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
            hourFormat={hourFormat}
            onToggleTemp={toggleTemp}
            onToggleSpeed={toggleSpeed}
            onToggleHour={toggleHour}
          />
          {selectedCity && (
            <button
              type="button"
              onClick={() => addCompare(selectedCity)}
              disabled={
                compare.some((c) => c.id === selectedCity.id) ||
                compare.length >= MAX_COMPARE
              }
              title={
                compare.some((c) => c.id === selectedCity.id)
                  ? "Already in comparison"
                  : compare.length >= MAX_COMPARE
                    ? "Comparison holds 3 cities — remove one first"
                    : `Compare ${selectedCity.name} side by side`
              }
              aria-label={
                compare.some((c) => c.id === selectedCity.id)
                  ? "City is already in the comparison"
                  : `Add ${selectedCity.name} to comparison`
              }
              className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-zinc-300 ring-1 ring-white/10 transition-colors hover:text-white hover:ring-brand-500/50 disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              {compare.some((c) => c.id === selectedCity.id)
                ? "Compared"
                : `Compare${compare.length > 0 ? ` (${compare.length})` : ""}`}
            </button>
          )}
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Open quick city switcher"
            title="Quick switch (⌘K)"
            className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 font-mono text-xs text-zinc-300 ring-1 ring-white/10 transition-colors hover:text-white hover:ring-brand-500/50"
          >
            <Command className="h-3.5 w-3.5" aria-hidden="true" />
            ⌘K
          </button>
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
                  tempUnit={tempUnit}
                  speedUnit={speedUnit}
                  aqi={airQuality?.current.us_aqi ?? null}
                  pm25={airQuality?.current.pm2_5 ?? null}
                />
              </Box>
            </Fade>
          )}

          {compare.length > 0 && (
            <Fade in timeout={1000}>
              <Box sx={{ width: "100%", mt: 4 }}>
                <CompareSection
                  cities={compare}
                  tempUnit={tempUnit}
                  onRemove={removeCompare}
                />
              </Box>
            </Fade>
          )}

          {showResults && (
            <Fade in timeout={1000}>
              <Box sx={{ width: "100%", mt: 4 }}>
                <DailyForecast
                  data={weatherData.daily}
                  tempUnit={tempUnit}
                  speedUnit={speedUnit}
                  hourFormat={hourFormat}
                  selectedDay={selectedDay}
                  onSelectDay={handleDaySelect}
                />
              </Box>
            </Fade>
          )}

          {showResults && (
            <Fade in timeout={1000}>
              <Box sx={{ width: "100%", mt: 4 }}>
                <PrecipForecast
                  data={weatherData.hourly}
                  currentTime={locationNowIso(weatherData.utc_offset_seconds)}
                  hourFormat={hourFormat}
                  dayIndex={selectedDay}
                  dayLabel={drillLabel}
                />
              </Box>
            </Fade>
          )}

          {showResults && (
            <Fade in timeout={1000}>
              <Box sx={{ width: "100%", mt: 4 }} id="hourly">
                <div className="grid gap-4 lg:grid-cols-5">
                  <div className="lg:col-span-3">
                    <HourlyForecast
                      data={weatherData.hourly}
                      // Location-local "now" from utc_offset_seconds (current.time is
                      // not requestable — Open-Meteo 400s it as an explicit variable).
                      currentTime={locationNowIso(
                        weatherData.utc_offset_seconds,
                      )}
                      tempUnit={tempUnit}
                      hourFormat={hourFormat}
                      dayIndex={selectedDay}
                      dayLabel={drillLabel}
                      onResetDay={resetDay}
                    />
                  </div>
                  <div className="flex flex-col gap-4 lg:col-span-2">
                    <SunArc
                      sunrise={
                        selectedDay !== null
                          ? weatherData.daily.sunrise[selectedDay]
                          : weatherData.daily.sunrise[0]
                      }
                      sunset={
                        selectedDay !== null
                          ? weatherData.daily.sunset[selectedDay]
                          : weatherData.daily.sunset[0]
                      }
                      nowIso={locationNowIso(weatherData.utc_offset_seconds)}
                      hourFormat={hourFormat}
                      dayLabel={drillLabel}
                    />
                    <MoonPhase
                      dateMs={
                        selectedDay !== null
                          ? Date.parse(
                              `${weatherData.daily.time[selectedDay]}T12:00:00`,
                            )
                          : null
                      }
                      dayLabel={drillLabel}
                    />
                  </div>
                </div>
              </Box>
            </Fade>
          )}

          {showResults && selectedCity && (
            <Fade in timeout={1000}>
              <Box sx={{ width: "100%", mt: 4 }}>
                <RadarMap
                  lat={selectedCity.latitude}
                  lon={selectedCity.longitude}
                  utcOffsetSeconds={weatherData.utc_offset_seconds}
                  hourFormat={hourFormat}
                />
              </Box>
            </Fade>
          )}
        </div>
      </div>
      <CommandPalette
        open={paletteOpen}
        current={selectedCity}
        recents={recents}
        onSelect={selectCity}
        onClose={() => setPaletteOpen(false)}
      />
    </>
  );
}
