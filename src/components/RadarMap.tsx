"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Pause, Play, Plus, Radar } from "lucide-react";
import { Card } from "./ui/Card";
import { SectionHeading } from "./ui/SectionHeading";
import {
  clampZoom,
  fetchRadarFrames,
  formatFrameTime,
  osmTileUrl,
  radarTileUrl,
  tileGrid,
  type RadarFrame,
} from "@/lib/tiles";
import type { HourFormat } from "@/lib/units";

type RadarMapProps = {
  lat: number;
  lon: number;
  utcOffsetSeconds: number;
  hourFormat: HourFormat;
};

/**
 * Rain radar on a hand-rolled 3×3 tile grid (OSM base + RainViewer overlay).
 * No map library, no autoplay — the user steps or plays frames deliberately.
 */
export function RadarMap({
  lat,
  lon,
  utcOffsetSeconds,
  hourFormat,
}: RadarMapProps) {
  const [host, setHost] = useState<string | null>(null);
  const [frames, setFrames] = useState<RadarFrame[]>([]);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(7);
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchRadarFrames(controller.signal)
      .then((manifest) => {
        setHost(manifest.host);
        setFrames(manifest.frames);
        setFrameIdx(manifest.frames.length - 1); // latest by default
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!playing || frames.length === 0) return;
    const timer = setInterval(() => {
      setFrameIdx((i) => (i + 1) % frames.length);
    }, 1200);
    return () => clearInterval(timer);
  }, [playing, frames.length]);

  const tiles = useMemo(
    () => tileGrid(lat, lon, clampZoom(zoom)),
    [lat, lon, zoom],
  );
  const frame = frames[frameIdx];

  return (
    <Card>
      <SectionHeading level={3} eyebrow="Live radar" title="Rain radar" />
      {!host && !failed && (
        <div
          className="mx-auto aspect-square w-full max-w-[560px] animate-pulse rounded-xl bg-white/[0.02] ring-1 ring-white/5"
          role="status"
          aria-label="Loading rain radar"
        />
      )}
      {failed && (
        <p className="py-8 text-center text-sm text-zinc-500">
          Radar is currently unavailable — the forecasts above are unaffected.
        </p>
      )}
      {host && frame && (
        <>
          {/* Square box: cells match the square tiles exactly, so nothing is
              cropped and seams stay continuous. (A 16:9 box cropped ~44% off
              every tile — that was the "misordered" look.) */}
          <div className="relative mx-auto aspect-square w-full max-w-[560px] overflow-hidden rounded-xl ring-1 ring-white/10">
            <div
              className="absolute inset-0 grid grid-cols-3 grid-rows-3"
              aria-hidden="true"
            >
              {tiles.map((t, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`base-${i}-${t.x}-${t.y}`}
                  src={osmTileUrl(t.x, t.y, zoom)}
                  alt=""
                  loading="lazy"
                  draggable={false}
                  className="h-full w-full object-cover grayscale-[35%] invert-[92%] hue-rotate-180 contrast-[85%]"
                />
              ))}
            </div>
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {tiles.map((t, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`radar-${frame.time}-${i}-${t.x}-${t.y}`}
                  src={radarTileUrl(host, frame.path, t.x, t.y, zoom)}
                  alt=""
                  loading="lazy"
                  draggable={false}
                  className="h-full w-full object-cover opacity-80"
                />
              ))}
            </div>
            <div className="absolute right-2 top-2 flex gap-1">
              {[
                { label: "Zoom out", Icon: Minus, delta: -1 },
                { label: "Zoom in", Icon: Plus, delta: 1 },
              ].map(({ label, Icon, delta }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setZoom((z) => clampZoom(z + delta))}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950/70 text-zinc-200 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:text-white"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </button>
              ))}
            </div>
            <p className="absolute bottom-1.5 right-2 rounded bg-zinc-950/70 px-1.5 py-0.5 text-[10px] text-zinc-400">
              © OpenStreetMap · Radar: RainViewer
            </p>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={
                playing ? "Pause radar animation" : "Play radar animation"
              }
              aria-pressed={playing}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10 transition-colors hover:text-white hover:ring-brand-500/50"
            >
              {playing ? (
                <Pause className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={frames.length - 1}
              value={frameIdx}
              onChange={(e) => {
                setPlaying(false);
                setFrameIdx(Number(e.target.value));
              }}
              aria-label="Radar time frame"
              className="w-full accent-violet-400"
            />
            <span className="w-16 shrink-0 text-right font-mono text-xs text-zinc-300">
              {formatFrameTime(frame.time, utcOffsetSeconds, hourFormat)}
            </span>
          </div>
        </>
      )}
      {!host && !failed && (
        <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
          <Radar className="h-3.5 w-3.5" aria-hidden="true" />
          Fetching the latest radar sweep…
        </p>
      )}
    </Card>
  );
}
