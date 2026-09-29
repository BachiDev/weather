"use client";

import { ArrowUp } from "lucide-react";

/**
 * Back-to-top as a real button (window.scrollTo), not an href="#top" anchor:
 * deterministic — no id coupling, no router interception, reduced-motion safe.
 */
export function BackToTopButton() {
  const scrollTop = () => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollTop}
      aria-label="Back to top"
      className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 ring-1 ring-white/10 transition-colors hover:text-white hover:ring-brand-500/50"
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
