"use client";

import { RotateCw, X } from "lucide-react";
import { WeatherIcon } from "./WeatherIcon";
import { Card } from "./ui/Card";
import { SectionHeading } from "./ui/SectionHeading";
import { useCompareWeather } from "@/hooks/useCompareWeather";
import { formatTemp, type TempUnit } from "@/lib/units";
import { getWeatherDescription } from "@/lib/weatherCodes";
import type { CityData } from "@/types/weather";

type CompareSectionProps = {
  cities: CityData[];
  tempUnit: TempUnit;
  onRemove: (id: number) => void;
};

/** Side-by-side current conditions for the compare list (max 3). */
export function CompareSection({
  cities,
  tempUnit,
  onRemove,
}: CompareSectionProps) {
  const { entries, loading, retry } = useCompareWeather(cities);

  if (cities.length === 0) return null;

  return (
    <section aria-label="City comparison">
      <SectionHeading level={3} eyebrow="Side by side" title="Compare cities" />
      {entries.some((e) => e.error) && !loading && (
        <div className="mb-3 text-center">
          <button
            type="button"
            onClick={retry}
            className="flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-1.5 text-xs text-zinc-300 ring-1 ring-white/10 transition-colors hover:text-white hover:ring-brand-500/50"
          >
            <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
            Retry unavailable cities
          </button>
        </div>
      )}
      <ul
        className={`grid gap-3 sm:grid-cols-2 ${entries.length > 2 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}
      >
        {entries.map(({ city, data, error }) => (
          <li key={city.id} className="h-full">
            <Card className="p-5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <p
                  className="truncate text-sm font-semibold text-zinc-100"
                  title={city.label}
                >
                  {city.label}
                </p>
                <button
                  type="button"
                  onClick={() => onRemove(city.id)}
                  aria-label={`Remove ${city.label} from comparison`}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:text-zinc-100"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
              {loading && !data ? (
                <div
                  className="h-24 animate-pulse rounded-xl bg-white/[0.02]"
                  role="status"
                  aria-label={`Loading ${city.label}`}
                />
              ) : error || !data ? (
                <p className="py-6 text-center text-sm text-zinc-500">
                  Unavailable
                </p>
              ) : (
                <div className="flex items-center gap-3">
                  <WeatherIcon
                    code={data.current.weather_code}
                    isDay={data.current.is_day === 1}
                    size={48}
                    className="shrink-0 text-brand-300"
                  />
                  <div>
                    <p className="text-3xl font-bold tracking-tight text-zinc-50">
                      {formatTemp(data.current.temperature_2m, tempUnit)}
                    </p>
                    <p className="text-sm text-zinc-300">
                      {getWeatherDescription(data.current.weather_code)}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                      H {formatTemp(data.daily.temperature_2m_max[0], tempUnit)}{" "}
                      · L{" "}
                      {formatTemp(data.daily.temperature_2m_min[0], tempUnit)}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
