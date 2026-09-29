"use client";

import { LineChart } from "@mui/x-charts/LineChart";

type DailyChartProps = {
  days: string[];
  maxTemps: number[];
  minTemps: number[];
  unitSuffix: string;
};

/** Min/max temperature chart — dynamically imported (never blocks first paint). */
export function DailyChart({
  days,
  maxTemps,
  minTemps,
  unitSuffix,
}: DailyChartProps) {
  return (
    <LineChart
      series={[
        {
          data: maxTemps,
          label: `Max Temp (${unitSuffix})`,
          color: "#e879f9",
        },
        {
          data: minTemps,
          label: `Min Temp (${unitSuffix})`,
          color: "#a78bfa",
        },
      ]}
      xAxis={[{ scaleType: "band", data: days }]}
      yAxis={[{ label: `Temperature (${unitSuffix})` }]}
      margin={{ left: 10, right: 10, top: 30, bottom: 30 }}
      grid={{ vertical: true, horizontal: true }}
      slotProps={{
        legend: {
          position: { vertical: "top", horizontal: "center" },
        },
      }}
    />
  );
}
