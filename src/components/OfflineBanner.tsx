"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/** Friendly banner when the browser goes offline (cached data may be stale). */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const onDown = () => setOffline(true);
    const onUp = () => setOffline(false);
    window.addEventListener("offline", onDown);
    window.addEventListener("online", onUp);
    return () => {
      window.removeEventListener("offline", onDown);
      window.removeEventListener("online", onUp);
    };
  }, []);

  if (!offline) return null;

  return (
    <p
      role="alert"
      className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-xs text-amber-300 ring-1 ring-amber-500/30"
    >
      <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
      You&apos;re offline — showing the last loaded data.
    </p>
  );
}
