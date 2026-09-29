import { getWeatherMeta } from "@/lib/weatherCodes";

type WeatherIconProps = {
  code: number;
  /** Night variant for clear/partly-cloudy. Defaults to day. */
  isDay?: boolean;
  size?: number;
  className?: string;
  /**
   * Accessible name — wraps the glyph in role="img" with an aria-label.
   * Pass the weather description when no adjacent visible label exists;
   * otherwise leave it decorative.
   */
  label?: string;
};

/**
 * Lucide weather glyph (decorative — pair with visible label text or sr-only).
 * Replaces the old MUI-icon mapping; consistent with the bachi.dev icon set.
 */
export function WeatherIcon({
  code,
  isDay = true,
  size = 24,
  className,
  label,
}: WeatherIconProps) {
  const { Icon } = getWeatherMeta(code, isDay);
  const glyph = <Icon size={size} className={className} aria-hidden="true" />;
  if (!label) return glyph;
  return (
    <span role="img" aria-label={label}>
      {glyph}
    </span>
  );
}
