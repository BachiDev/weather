"use client";

import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import { Card } from "./ui/Card";
import { SectionHeading } from "./ui/SectionHeading";
import { DayCard } from "./DayCard";
import {
  formatDayLabel,
  toTemp,
  type HourFormat,
  type SpeedUnit,
  type TempUnit,
} from "@/lib/units";
import type { WeatherData } from "@/types/weather";

const DailyChart = dynamic(
  () => import("./DailyChart").then((m) => m.DailyChart),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[300px] w-full animate-pulse rounded-xl bg-white/[0.02] ring-1 ring-white/5"
        role="status"
        aria-label="Loading temperature chart"
      />
    ),
  },
);

type DailyForecastProps = {
  data: WeatherData["daily"];
  tempUnit: TempUnit;
  speedUnit: SpeedUnit;
  hourFormat: HourFormat;
  selectedDay: number | null;
  onSelectDay: (index: number) => void;
};

const DailyForecast: React.FC<DailyForecastProps> = ({
  data,
  tempUnit,
  speedUnit,
  hourFormat,
  selectedDay,
  onSelectDay,
}) => {
  const unitSuffix = tempUnit === "f" ? "°F" : "°C";
  const days = data.time.map((time) => formatDayLabel(time).weekday);
  const maxTemps = data.temperature_2m_max.map((t) => toTemp(t, tempUnit));
  const minTemps = data.temperature_2m_min.map((t) => toTemp(t, tempUnit));

  return (
    <Card>
      <SectionHeading
        level={3}
        eyebrow="7-day outlook"
        title="Daily forecast"
      />
      <ul
        className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7"
        aria-label="7-day details"
      >
        {data.time.map((time, index) => (
          <DayCard
            key={time}
            date={time}
            code={data.weather_code[index]}
            max={data.temperature_2m_max[index]}
            min={data.temperature_2m_min[index]}
            sunrise={data.sunrise[index]}
            sunset={data.sunset[index]}
            precipProbability={
              data.precipitation_probability_max[index] ?? null
            }
            windMax={data.wind_speed_10m_max[index]}
            tempUnit={tempUnit}
            speedUnit={speedUnit}
            hourFormat={hourFormat}
            selected={selectedDay === index}
            onSelect={() => onSelectDay(index)}
          />
        ))}
      </ul>
      {/* Detail cards above are the text alternative — the chart is progressive enhancement. */}
      <Box sx={{ width: "100%", height: 300 }}>
        <DailyChart
          days={days}
          maxTemps={maxTemps}
          minTemps={minTemps}
          unitSuffix={unitSuffix}
        />
      </Box>
    </Card>
  );
};

export default DailyForecast;
