"use client";

import { cn } from "@/lib/cn";
import type { HourFormat, SpeedUnit, TempUnit } from "@/lib/units";

type UnitsToggleProps = {
  tempUnit: TempUnit;
  speedUnit: SpeedUnit;
  hourFormat: HourFormat;
  onToggleTemp: () => void;
  onToggleSpeed: () => void;
  onToggleHour: () => void;
};

function Segment({
  active,
  onClick,
  label,
  pressedLabel,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  pressedLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={pressedLabel}
      className={cn(
        "rounded-full px-3 py-1 font-mono text-xs transition-colors",
        active
          ? "bg-brand-500/30 text-brand-300"
          : "text-zinc-400 hover:text-zinc-100",
      )}
    >
      {label}
    </button>
  );
}

/** Persisted °C/°F + km/h/mph + 12h/24h toggles. Conversions need no refetch. */
export function UnitsToggle({
  tempUnit,
  speedUnit,
  hourFormat,
  onToggleTemp,
  onToggleSpeed,
  onToggleHour,
}: UnitsToggleProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2"
      role="group"
      aria-label="Units"
    >
      <div className="flex items-center gap-0.5 rounded-full bg-white/5 p-0.5 ring-1 ring-white/10">
        <Segment
          active={tempUnit === "c"}
          onClick={onToggleTemp}
          label="°C"
          pressedLabel="Temperature unit °C"
        />
        <Segment
          active={tempUnit === "f"}
          onClick={onToggleTemp}
          label="°F"
          pressedLabel="Temperature unit °F"
        />
      </div>
      <div className="flex items-center gap-0.5 rounded-full bg-white/5 p-0.5 ring-1 ring-white/10">
        <Segment
          active={speedUnit === "kmh"}
          onClick={onToggleSpeed}
          label="km/h"
          pressedLabel="Speed unit km/h"
        />
        <Segment
          active={speedUnit === "mph"}
          onClick={onToggleSpeed}
          label="mph"
          pressedLabel="Speed unit mph"
        />
      </div>
      <div className="flex items-center gap-0.5 rounded-full bg-white/5 p-0.5 ring-1 ring-white/10">
        <Segment
          active={hourFormat === "24h"}
          onClick={onToggleHour}
          label="24h"
          pressedLabel="Time format 24h"
        />
        <Segment
          active={hourFormat === "12h"}
          onClick={onToggleHour}
          label="12h"
          pressedLabel="Time format 12h"
        />
      </div>
    </div>
  );
}
