/** Compact hero strip — H1 + lede. Search stays above the fold. */
export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-12 text-center md:pt-16">
      <div
        className="bg-grid-pattern absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,black,transparent)]"
        aria-hidden="true"
      />
      <div className="relative space-y-5">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
          Weather Dashboard
        </h1>
        <p className="mx-auto max-w-[700px] text-lg leading-relaxed text-zinc-400">
          Current conditions, 7-day outlook and 24-hour forecast for any city
          worldwide — powered by the free Open-Meteo API.
        </p>
      </div>
    </section>
  );
}
