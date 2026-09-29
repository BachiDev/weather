import { getSceneKind, sceneBackground } from "@/lib/scene";

type SceneBackdropProps = {
  code?: number;
  isDay?: boolean;
};

/**
 * Fixed condition-reactive glow behind everything. `key` re-triggers the
 * fade on scene change; static under reduced-motion (see globals.css).
 */
export function SceneBackdrop({ code, isDay = true }: SceneBackdropProps) {
  const kind = getSceneKind(code, isDay);
  return (
    <div
      key={kind}
      aria-hidden="true"
      className="scene-fade pointer-events-none fixed inset-0 -z-10"
      style={{ background: sceneBackground(kind) }}
    />
  );
}
