"use client";

import { WeatherIcon } from "./WeatherIcon";
import { Card } from "./ui/Card";
import { SectionHeading } from "./ui/SectionHeading";
import { sliceNext24Hours } from "@/lib/forecast";
import { formatHourLabel, formatTemp, type TempUnit } from "@/lib/units";
import { getWeatherDescription } from "@/lib/weatherCodes";
import type { WeatherData } from "@/types/weather";

type HourlyForecastProps = {
  data: WeatherData["hourly"];
  /** Location-local `current.time` — anchors the 24h window without TZ math. */
  currentTime: string;
  tempUnit: TempUnit;
};

/**
 * Next-24-hours as a scroll-snap strip: readable on mobile, no chart weight,
 * every hour carries icon + temperature + screen-reader description.
 */
const HourlyForecast: React.FC<HourlyForecastProps> = ({
  data,
  currentTime,
  tempUnit,
}) => {
  const points = sliceNext24Hours(data, currentTime);

  return (
    <Card>
      <SectionHeading
        level={3}
        eyebrow="Next 24 hours"
        title="Hourly forecast"
      />
      <ol
        className="custom-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2"
        aria-label="Hourly temperature for the next 24 hours"
      >
        {points.map((point) => {
          const description = getWeatherDescription(point.code);
          return (
            <li
              key={point.time}
              className="flex w-16 shrink-0 snap-start flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/[0.02] px-2 py-3 text-center"
              aria-label={`${formatHourLabel(point.time)}: ${formatTemp(point.temp, tempUnit)}, ${description}`}
            >
              <span
                className="font-mono text-[11px] uppercase text-zinc-400"
                aria-hidden="true"
              >
                {formatHourLabel(point.time)}
              </span>
              <WeatherIcon
                code={point.code}
                size={24}
                className="text-brand-300"
              />
              <span
                className="text-sm font-semibold text-zinc-100"
                aria-hidden="true"
              >
                {formatTemp(point.temp, tempUnit)}
              </span>
              <span className="sr-only">{description}</span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
};

export default HourlyForecast;
