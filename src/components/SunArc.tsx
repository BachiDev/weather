import { Sunrise, Sunset } from "lucide-react";
import { Card } from "./ui/Card";
import { formatTimeOfDay, type HourFormat } from "@/lib/units";
import { sunDot, sunPosition } from "@/lib/sun";

type SunArcProps = {
  sunrise: string;
  sunset: string;
  nowIso: string;
  hourFormat: HourFormat;
  /** Drilled-down day label: shows that day's times without a live dot. */
  dayLabel?: string | null;
};

/** Sunrise→sunset arc with a live sun dot. Degrades to times-only when unknown. */
export function SunArc({
  sunrise,
  sunset,
  nowIso,
  hourFormat,
  dayLabel = null,
}: SunArcProps) {
  const { state, progress } = sunPosition(sunrise, sunset, nowIso);
  const dot = sunDot(progress);
  const drilled = dayLabel !== null;
  const showDot = !drilled && state === "day";
  const label = drilled
    ? `Sun path · ${dayLabel}`
    : state === "day"
      ? `Sun is ${Math.round(progress * 100)} percent across the sky`
      : state === "night"
        ? "Sun is below the horizon"
        : "Sunrise and sunset unavailable";

  return (
    <Card className="p-5" aria-label="Sun path today">
      <p className="mb-1 text-center font-mono text-xs font-medium uppercase tracking-[0.2em] text-brand-400">
        Sun path
      </p>
      <svg
        viewBox="0 0 200 110"
        className="mx-auto w-full max-w-[280px]"
        role="img"
        aria-label={label}
      >
        <line
          x1="0"
          y1="100"
          x2="200"
          y2="100"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
        />
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke="rgba(167,139,250,0.4)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        {showDot && (
          <>
            <circle cx={dot.x} cy={dot.y} r="10" fill="rgba(251,191,36,0.25)" />
            <circle cx={dot.x} cy={dot.y} r="5" fill="#fbbf24" />
          </>
        )}
      </svg>
      <div className="mt-1 flex items-center justify-between text-xs text-zinc-400">
        <span className="flex items-center gap-1">
          <Sunrise className="h-3.5 w-3.5" aria-hidden="true" />
          {sunrise ? formatTimeOfDay(sunrise, hourFormat) : "—"}
        </span>
        <span className="flex items-center gap-1">
          {sunset ? formatTimeOfDay(sunset, hourFormat) : "—"}
          <Sunset className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </Card>
  );
}
