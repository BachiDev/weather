import { useCallback, useEffect, useState } from "react";
import type { HourFormat, SpeedUnit, TempUnit } from "@/lib/units";
import { readJSON, writeJSON } from "@/lib/storage";

const UNITS_KEY = "weather:units";

type Units = {
  temp: TempUnit;
  speed: SpeedUnit;
  hour: HourFormat;
};

function loadUnits(): Units {
  // Old stored values predate `hour` — missing keys fall back to defaults.
  const stored = readJSON<Partial<Units>>(UNITS_KEY, {});
  return {
    temp: stored.temp === "f" ? "f" : "c",
    speed: stored.speed === "mph" ? "mph" : "kmh",
    hour: stored.hour === "12h" ? "12h" : "24h",
  };
}

/** Persisted °C/°F + km/h/mph + 12h/24h toggles. Conversions are client-side (no refetch). */
export function useUnits() {
  // Defaults first, stored prefs after mount: reading localStorage during
  // render would hydrate differently than the server HTML on repeat visits.
  const [units, setUnits] = useState<Units>({
    temp: "c",
    speed: "kmh",
    hour: "24h",
  });

  useEffect(() => {
    setUnits(loadUnits());
  }, []);

  const toggleTemp = useCallback(() => {
    setUnits((prev) => {
      const next = {
        ...prev,
        temp: (prev.temp === "c" ? "f" : "c") as TempUnit,
      };
      writeJSON(UNITS_KEY, next);
      return next;
    });
  }, []);

  const toggleSpeed = useCallback(() => {
    setUnits((prev) => {
      const next = {
        ...prev,
        speed: (prev.speed === "kmh" ? "mph" : "kmh") as SpeedUnit,
      };
      writeJSON(UNITS_KEY, next);
      return next;
    });
  }, []);

  const toggleHour = useCallback(() => {
    setUnits((prev) => {
      const next = {
        ...prev,
        hour: (prev.hour === "12h" ? "24h" : "12h") as HourFormat,
      };
      writeJSON(UNITS_KEY, next);
      return next;
    });
  }, []);

  return {
    tempUnit: units.temp,
    speedUnit: units.speed,
    hourFormat: units.hour,
    toggleTemp,
    toggleSpeed,
    toggleHour,
  };
}
