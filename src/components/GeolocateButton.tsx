"use client";

import { useState } from "react";
import { Loader2, LocateFixed } from "lucide-react";

type GeolocateButtonProps = {
  onLocation: (lat: number, lon: number) => void;
};

type Status = "idle" | "locating" | "error";

/** "Use my location" — browser geolocation, labelled by coords (no reverse API). */
export function GeolocateButton({ onLocation }: GeolocateButtonProps) {
  const [status, setStatus] = useState<Status>("idle");

  const handleClick = () => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus("idle");
        onLocation(position.coords.latitude, position.coords.longitude);
      },
      () => setStatus("error"),
      { timeout: 10_000 },
    );
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "locating"}
        className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-zinc-300 ring-1 ring-white/10 transition-colors hover:text-white hover:ring-brand-500/50 disabled:opacity-60"
      >
        {status === "locating" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {status === "locating" ? "Locating…" : "Use my location"}
      </button>
      {status === "error" && (
        <p role="alert" className="text-xs text-red-400">
          Location unavailable — search for your city instead.
        </p>
      )}
    </div>
  );
}
