// Moon phase from pure astronomy: age into the synodic month (29.530588853 d)
// anchored at the 2000-01-06T18:14Z new moon. No API needed.

export const SYNODIC_MONTH_DAYS = 29.530588853;
const REFERENCE_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

const PHASE_NAMES = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Last Quarter",
  "Waning Crescent",
] as const;

export type MoonPhase = {
  /** Days into the current cycle, 0 → SYNODIC_MONTH_DAYS. */
  age: number;
  /** 0 (new) → 1 (full). */
  illumination: number;
  name: (typeof PHASE_NAMES)[number];
};

export function moonPhase(nowMs = Date.now()): MoonPhase {
  const age =
    ((((nowMs - REFERENCE_NEW_MOON_MS) / 86_400_000) % SYNODIC_MONTH_DAYS) +
      SYNODIC_MONTH_DAYS) %
    SYNODIC_MONTH_DAYS;
  const angle = (age / SYNODIC_MONTH_DAYS) * 2 * Math.PI;
  const illumination = (1 - Math.cos(angle)) / 2;
  const name =
    PHASE_NAMES[Math.floor(((age / SYNODIC_MONTH_DAYS) * 8 + 0.5) % 8)];
  return { age, illumination, name };
}
