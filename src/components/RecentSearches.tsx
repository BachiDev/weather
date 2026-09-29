"use client";

import { History, X } from "lucide-react";
import type { CityData } from "@/types/weather";

type RecentSearchesProps = {
  recents: CityData[];
  onSelect: (city: CityData) => void;
  onClear: () => void;
};

/** Last searched cities — click to reload without retyping. */
export function RecentSearches({
  recents,
  onSelect,
  onClear,
}: RecentSearchesProps) {
  if (recents.length === 0) return null;

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2"
      aria-label="Recent searches"
    >
      <History className="h-4 w-4 text-zinc-500" aria-hidden="true" />
      {recents.map((city) => (
        <button
          key={city.id}
          type="button"
          onClick={() => onSelect(city)}
          className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300 ring-1 ring-white/10 transition-colors hover:text-white hover:ring-brand-500/50"
        >
          {city.label}
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear recent searches"
        className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-500 transition-colors hover:text-zinc-100"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
