import { ArrowLeft, ExternalLink, Mail } from "lucide-react";

const REPO_URL = "https://github.com/BachiDev/weather";
const EMAIL = "fabian@bachi.dev";

/** Slim sticky chrome: back to bachi.dev, app wordmark, source + contact. */
export function Header() {
  return (
    <header
      id="top"
      className="sticky top-0 z-50 flex h-14 w-full items-center gap-3 border-b border-white/10 bg-zinc-950/80 px-4 backdrop-blur-sm md:px-6"
    >
      <a
        href="https://bachi.dev"
        className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">bachi.dev</span>
        <span className="sm:hidden">Back</span>
      </a>
      <span
        className="font-mono text-xs uppercase tracking-[0.2em] text-brand-400"
        aria-hidden="true"
      >
        /
      </span>
      <p className="text-sm font-semibold text-zinc-100">Weather Dashboard</p>
      <div className="ml-auto flex items-center gap-1">
        <a
          href={`mailto:${EMAIL}`}
          aria-label="Email Fabian Bachmayer"
          className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:text-white hover:ring-1 hover:ring-brand-500/50"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
        </a>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Source code on GitHub"
          className="flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-zinc-400 ring-1 ring-white/10 transition-colors hover:text-white hover:ring-brand-500/50"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Source</span>
        </a>
      </div>
    </header>
  );
}
