"use client";

import { useEffect, useState } from "react";
import { Moon } from "lucide-react";
import { Card } from "./ui/Card";
import { moonPhase } from "@/lib/moon";

/**
 * Moon phase widget (pure astronomy, no API). With `dateMs` (drilled-down
 * day, deterministic) it renders immediately; otherwise it uses tonight and
 * waits for mount — Date.now() differs between server and client, so computing
 * during render would hydrate differently (same class of bug as §Phase-2 storage).
 */
export function MoonPhase({
  dateMs = null,
  dayLabel = null,
}: {
  dateMs?: number | null;
  dayLabel?: string | null;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const stamp = dateMs ?? now;
  const phase = stamp === null || Number.isNaN(stamp) ? null : moonPhase(stamp);

  return (
    // No aria-label needed: name + illumination are plain text (the icon is decorative).
    <Card className="items-center justify-center p-5 text-center">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-brand-400">
        {dayLabel ? `Moon · ${dayLabel}` : "Moon"}
      </p>
      <Moon className="my-2 h-10 w-10 text-brand-300" aria-hidden="true" />
      {phase ? (
        <>
          <p className="text-lg font-semibold text-zinc-100">{phase.name}</p>
          <p className="mt-0.5 font-mono text-xs uppercase tracking-wider text-zinc-400">
            {Math.round(phase.illumination * 100)}% lit · day{" "}
            {Math.floor(phase.age) + 1}
          </p>
        </>
      ) : (
        <>
          <p
            className="h-7 w-32 animate-pulse rounded bg-white/5"
            aria-hidden="true"
          />
          <p className="sr-only" role="status">
            Loading moon phase
          </p>
        </>
      )}
    </Card>
  );
}
