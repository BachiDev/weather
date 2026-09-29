"use client";

import dynamic from "next/dynamic";
import { Card } from "./ui/Card";
import { SectionHeading } from "./ui/SectionHeading";
import { sliceDayHours, sliceNext24Hours } from "@/lib/forecast";
import { formatHourLabel, type HourFormat } from "@/lib/units";
import type { WeatherData } from "@/types/weather";

const PrecipChart = dynamic(
  () => import("./PrecipChart").then((m) => m.PrecipChart),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[260px] w-full animate-pulse rounded-xl bg-white/[0.02] ring-1 ring-white/5"
        role="status"
        aria-label="Loading precipitation chart"
      />
    ),
  },
);

type PrecipForecastProps = {
  data: WeatherData["hourly"];
  currentTime: string;
  hourFormat: HourFormat;
  /** Drill-down: show this daily index instead of the next 24h. */
  dayIndex?: number | null;
  dayLabel?: string | null;
};

/** Rain probability + humidity — next 24h, or one drilled-down day (lazy chart). */
export function PrecipForecast({
  data,
  currentTime,
  hourFormat,
  dayIndex = null,
  dayLabel = null,
}: PrecipForecastProps) {
  const drilled = dayIndex !== null;
  const points = drilled
    ? sliceDayHours(data, dayIndex)
    : sliceNext24Hours(data, currentTime);

  return (
    <Card>
      <SectionHeading
        level={3}
        eyebrow={drilled && dayLabel ? dayLabel : "Precipitation"}
        title="Rain & humidity"
      />
      <PrecipChart
        hours={points.map((p) => formatHourLabel(p.time, hourFormat))}
        precip={points.map((p) => p.precip)}
        humidity={points.map((p) => p.humidity)}
      />
    </Card>
  );
}
