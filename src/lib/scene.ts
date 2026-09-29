// Condition-reactive backdrop scenes. Returns plain CSS background strings
// (not Tailwind classes) so every variant always exists — no purge risk.

export type SceneKind =
  | "default"
  | "clear-day"
  | "clear-night"
  | "cloud-day"
  | "cloud-night"
  | "fog"
  | "precip"
  | "snow"
  | "storm";

export function getSceneKind(
  code: number | null | undefined,
  isDay: boolean,
): SceneKind {
  if (code === null || code === undefined) return "default";
  if (code === 0) return isDay ? "clear-day" : "clear-night";
  if (code >= 1 && code <= 3) return isDay ? "cloud-day" : "cloud-night";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "precip";
  if (code === 77 || (code >= 71 && code <= 75) || code === 85 || code === 86)
    return "snow";
  if (code >= 95 && code <= 99) return "storm";
  return "default";
}

/** Subtle top-glow washes — the zinc-950 base always shows through. */
export function sceneBackground(kind: SceneKind): string {
  switch (kind) {
    case "clear-day":
      return (
        "radial-gradient(ellipse 70% 45% at 50% -5%, rgba(251, 191, 36, 0.16), transparent 70%)," +
        "radial-gradient(ellipse 50% 35% at 85% 110%, rgba(56, 189, 248, 0.08), transparent 70%)"
      );
    case "clear-night":
      return "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(76, 29, 149, 0.32), transparent 70%)";
    case "cloud-day":
    case "cloud-night":
      return "radial-gradient(ellipse 70% 45% at 50% -5%, rgba(148, 163, 184, 0.1), transparent 70%)";
    case "fog":
      return "radial-gradient(ellipse 90% 60% at 50% 20%, rgba(161, 161, 170, 0.1), transparent 75%)";
    case "precip":
      return (
        "radial-gradient(ellipse 70% 45% at 50% -5%, rgba(56, 189, 248, 0.14), transparent 70%)," +
        "radial-gradient(ellipse 50% 35% at 15% 110%, rgba(30, 58, 138, 0.25), transparent 70%)"
      );
    case "snow":
      return "radial-gradient(ellipse 70% 45% at 50% -5%, rgba(226, 232, 240, 0.09), transparent 70%)";
    case "storm":
      return (
        "radial-gradient(ellipse 70% 45% at 50% -5%, rgba(139, 92, 246, 0.22), transparent 70%)," +
        "radial-gradient(ellipse 50% 35% at 85% 110%, rgba(30, 27, 75, 0.4), transparent 70%)"
      );
    case "default":
    default:
      return "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(139, 92, 246, 0.12), transparent 70%)";
  }
}
