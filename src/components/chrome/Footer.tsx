import { BackToTopButton } from "./BackToTopButton";

const EMAIL = "fabian@bachi.dev";
const REPO_URL = "https://github.com/BachiDev/weather";

/** Site footer: brand, portfolio nav, Open-Meteo attribution, back-to-top. */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full border-t border-white/10 bg-zinc-900 px-4 py-8 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-200">
              Weather Dashboard
            </p>
            <p className="text-xs text-zinc-400">
              A portfolio demo by{" "}
              <a
                href="https://bachi.dev"
                className="underline-offset-4 hover:text-zinc-100 hover:underline"
              >
                Fabian Bachmayer
              </a>{" "}
              ·{" "}
              <a
                href={`mailto:${EMAIL}`}
                className="underline-offset-4 hover:text-zinc-100 hover:underline"
              >
                {EMAIL}
              </a>
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Footer">
            <a
              href="https://bachi.dev"
              className="text-sm text-zinc-400 underline-offset-4 hover:text-zinc-100 hover:underline"
            >
              bachi.dev
            </a>
            <a
              href="https://bachi.dev/work"
              className="text-sm text-zinc-400 underline-offset-4 hover:text-zinc-100 hover:underline"
            >
              Work
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-zinc-400 underline-offset-4 hover:text-zinc-100 hover:underline"
            >
              Source
            </a>
          </nav>
          <BackToTopButton />
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-400">
            © {year} Fabian Bachmayer. Weather data by{" "}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 hover:text-zinc-100 hover:underline"
            >
              Open-Meteo.com
            </a>
            .
          </p>
          <p className="text-xs text-zinc-400">
            Built with Next.js &amp; TypeScript — no cookies, no tracking.
          </p>
        </div>
      </div>
    </footer>
  );
}
