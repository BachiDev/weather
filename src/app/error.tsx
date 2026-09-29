"use client";

import { ErrorState } from "@/components/states";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-6">
      <ErrorState
        message="The page failed to render. Your search is preserved — try again."
        onRetry={reset}
      />
    </div>
  );
}
