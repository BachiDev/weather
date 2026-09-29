import { useCallback, useEffect, useState } from "react";
import type { SpeedUnit, TempUnit } from "@/lib/units";
import { readJSON, writeJSON } from "@/lib/storage";

const UNITS_KEY = "weather:units";

type Units = {
  temp: TempUnit;
  speed: SpeedUnit;
};

function loadUnits(): Units {
  const stored = readJSON<Partial<Units>>(UNITS_KEY, {});
  return {
    temp: stored.temp === "f" ? "f" : "c",
    speed: stored.speed === "mph" ? "mph" : "kmh",
  };
}

/** Persisted °C/°F + km/h/mph toggle. Conversions are client-side (no refetch). */
export function useUnits() {
  // Defaults first, stored prefs after mount: reading localStorage during
  // render would hydrate differently than the server HTML on repeat visits.
  const [units, setUnits] = useState<Units>({ temp: "c", speed: "kmh" });

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

  return {
    tempUnit: units.temp,
    speedUnit: units.speed,
    toggleTemp,
    toggleSpeed,
  };
}
