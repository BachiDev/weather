"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  Command,
  CornerDownLeft,
  MapPin,
  Search,
  X,
} from "lucide-react";
import type { CityData } from "@/types/weather";

type CommandPaletteProps = {
  open: boolean;
  current: CityData | null;
  recents: CityData[];
  onSelect: (city: CityData) => void;
  onClose: () => void;
};

/**
 * ⌘K/Ctrl+K quick-switch over the current city + recents. Native buttons keep
 * full keyboard support (Tab/Enter/Escape) with zero roving-tabindex code.
 */
export function CommandPalette({
  open,
  current,
  recents,
  onSelect,
  onClose,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const items = useMemo(() => {
    const seen = new Set<number>();
    const all: Array<{ city: CityData; kind: "current" | "recent" }> = [];
    if (current) {
      all.push({ city: current, kind: "current" });
      seen.add(current.id);
    }
    for (const city of recents) {
      if (seen.has(city.id)) continue;
      seen.add(city.id);
      all.push({ city, kind: "recent" });
    }
    const q = query.trim().toLowerCase();
    return q
      ? all.filter(({ city }) => city.label.toLowerCase().includes(q))
      : all;
  }, [current, recents, query]);

  if (!open) return null;

  const pick = (city: CityData) => {
    onSelect(city);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[15vh]">
      <button
        type="button"
        aria-label="Dismiss dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-zinc-950/70 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quick switch city"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-4">
          <Search
            className="h-4 w-4 shrink-0 text-zinc-400"
            aria-hidden="true"
          />
          <input
            // Autofocus is correct here: a modal dialog must move focus inside on open.
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a city…"
            aria-label="Filter cities"
            className="w-full bg-transparent py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quick switch"
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 transition-colors hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {items.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-zinc-500">
            No saved city matches — search above to add one.
          </p>
        ) : (
          <ul className="max-h-64 overflow-y-auto p-2">
            {items.map(({ city, kind }) => (
              <li key={`${kind}-${city.id}`}>
                <button
                  type="button"
                  onClick={() => pick(city)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                >
                  {kind === "current" ? (
                    <MapPin
                      className="h-4 w-4 shrink-0 text-brand-300"
                      aria-hidden="true"
                    />
                  ) : (
                    <Clock
                      className="h-4 w-4 shrink-0 text-zinc-500"
                      aria-hidden="true"
                    />
                  )}
                  <span className="flex-1 truncate text-sm text-zinc-100">
                    {city.label}
                  </span>
                  {kind === "current" ? (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-brand-300">
                      current
                    </span>
                  ) : (
                    <CornerDownLeft
                      className="h-3.5 w-3.5 shrink-0 text-zinc-600"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="flex items-center justify-center gap-1.5 border-t border-white/10 px-4 py-2 text-[11px] text-zinc-500">
          <Command className="h-3 w-3" aria-hidden="true" />K to toggle · Esc to
          close
        </p>
      </div>
    </div>
  );
}
