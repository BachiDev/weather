"use client";

import { Search, TriangleAlert } from "lucide-react";
import { Card } from "./ui/Card";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card className="items-center py-10 text-center">
      <TriangleAlert className="h-10 w-10 text-red-400" aria-hidden="true" />
      <p className="mt-3 text-lg font-semibold text-zinc-100">
        Something went wrong
      </p>
      <p className="mt-1 max-w-md text-sm text-zinc-400" role="alert">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-400"
      >
        Try again
      </button>
    </Card>
  );
}

export function EmptyState() {
  return (
    <Card className="items-center py-10 text-center">
      <Search className="h-10 w-10 text-brand-300" aria-hidden="true" />
      <p className="mt-3 text-lg font-semibold text-zinc-100">
        No city selected
      </p>
      <p className="mt-1 max-w-md text-sm text-zinc-400">
        Search for a city above — or pick one from your recent searches.
      </p>
    </Card>
  );
}

/** Reserved-height skeleton — no layout shift while the first payload loads. */
export function ResultsSkeleton() {
  return (
    <div
      className="mt-4 flex flex-col gap-4"
      role="status"
      aria-label="Loading weather data"
    >
      <div
        className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/[0.02]"
        aria-hidden="true"
      />
      <div
        className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/[0.02]"
        aria-hidden="true"
      />
      <div
        className="h-48 animate-pulse rounded-2xl border border-white/10 bg-white/[0.02]"
        aria-hidden="true"
      />
    </div>
  );
}
