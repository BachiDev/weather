"use client";

import {
  BarPlot,
  ChartContainer,
  ChartsTooltip,
  ChartsXAxis,
  ChartsYAxis,
  LinePlot,
} from "@mui/x-charts";

type PrecipChartProps = {
  hours: string[];
  precip: Array<number | null>;
  humidity: Array<number | null>;
};

/**
 * 24h precipitation-probability bars + humidity line. Dynamically imported
 * (rides the same lazy chunk as the daily chart — no first-paint cost).
 */
export function PrecipChart({ hours, precip, humidity }: PrecipChartProps) {
  return (
    <div>
      <div
        className="mb-2 flex items-center justify-center gap-4 text-xs text-zinc-400"
        aria-hidden="true"
      >
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-sky-400" />
          Rain probability
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-fuchsia-400" />
          Humidity
        </span>
      </div>
      <ChartContainer
        xAxis={[
          {
            scaleType: "band",
            data: hours,
            tickInterval: (_value, index) => index % 3 === 0,
          },
        ]}
        yAxis={[{ min: 0, max: 100, label: "%" }]}
        series={[
          {
            type: "bar",
            data: precip,
            label: "Rain probability",
            color: "#38bdf8",
          },
          { type: "line", data: humidity, label: "Humidity", color: "#e879f9" },
        ]}
        height={260}
      >
        <BarPlot />
        <LinePlot />
        <ChartsXAxis />
        <ChartsYAxis />
        <ChartsTooltip />
      </ChartContainer>
    </div>
  );
}
