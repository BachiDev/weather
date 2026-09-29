# Weather Dashboard Overhaul Plan

> Goal: take the functional-but-dated weather demo from "MUI tutorial app" to a polished, sturdy, portfolio-grade project that matches the **bachi.dev design system** and demonstrates senior habits (typed API layer, tested hooks, accessible UI, static-export deploy).

Owner: **Fabian Bachmayer** — fabian@bachi.dev — [bachi.dev](https://bachi.dev) · Live demo: `https://bachidev.github.io/weather` (project page, stays on `*.github.io` per main-site decision) · Repo: `BachiDev/weather`.

Stack today: Next.js 15.4.6 + React 19 + TypeScript + MUI 7 (`@mui/material`, `@mui/icons-material`, `@mui/x-charts`) + Emotion + Axios. Tailwind v4 is installed but **unused** (styling is MUI `sx` + one hand-written `globals.css`). No tests, no CI, `next.config.ts` empty, `lint` runs deprecated `next lint`.

Target: same stack family (no framework swap — not worth it for this size), but **restyled to bachi.dev tokens**, hardened (error boundaries, caching, a11y, SEO), feature-completed (details the API already fetches but never shows), tested (Vitest + RTL), and deployable via static export to GitHub Pages like the main site.

---

## 1. Current-state audit (what's good / what's holding it back)

### What's already working — keep it

- Clean separation for its age: `src/app/api.ts` (API layer), `src/hooks/useSearch` + `useWeather` (logic), `src/components/*` (UI), `src/app/page.tsx` (composition). Good bones.
- Real APIs, no keys: Open-Meteo forecast + geocoding (free, no auth) — keep, it's the right choice.
- TypeScript throughout with a shared `interfaces.ts`.
- Debounced city search (300 ms) via Autocomplete — right instinct.
- Default city (Vienna) so first paint isn't empty.
- Responsive-ish via MUI Container/Grid.

### Coherence & visual design issues (biggest lever — must match bachi.dev)

1. **No shared design system; directly clashes with bachi.dev.** Body font is `Geist_Mono` everywhere (`globals.css:3` + `ThemeRegistry.tsx:12`); background is a loud blue→purple gradient (`rgba(41,106,186) → rgba(184,72,212) → rgba(57,24,163)`); cards are `rgba(33,33,33,0.7)` with **white** glow hover (`CurrentWeather.tsx:24`, `DailyForecast.tsx:30`, `HourlyForecast.tsx:31`). bachi.dev is: `zinc-950` base, `zinc-100`/`zinc-400` text, **violet** accent (`brand-400 #a78bfa / brand-500 #8b5cf6`), `Inter` sans + mono only for kickers/pills, cards `border-white/10 bg-white/[0.02]` with **violet** glow. Every token diverges.
2. **Tailwind installed but dead.** `tailwindcss@4` + `@tailwindcss/postcss` in devDeps, yet zero Tailwind classes in the codebase — all styling is MUI `sx`. Decide: Tailwind for layout/chrome (header/footer/landing) + MUI only where it earns its weight (Autocomplete, charts)? Or full Tailwind + drop MUI? (Recommendation in §6.)
3. **Typography is all-mono** (same mistake the main site fixed in Phase 1). Hurts readability, looks unfinished next to bachi.dev's Inter.
4. **No site chrome.** No header (no back-link to bachi.dev / `/work`), no footer, no branding. Floating GitHub `Fab` in `layout.tsx:32-53` is the exact anti-pattern the main site **removed** in Phase 3 (floating clutter, overlaps content on mobile) — move to footer.
5. **Hero/thumbnail story is weak.** `page.tsx` headline is bare "Weather Dashboard" with no subtitle, no tech pills, no link to source — bad as a portfolio piece screenshot and bad as a landing.
6. **Charts are unstyled defaults.** Red/blue (`#ff5252`/`#42a5f5`) daily lines and a near-invisible white (`#ffffffff`) hourly line on dark — no violet brand, no axis styling, x-axis crams 24 hour labels, no text alternative for screen readers.

### Content & UX issues

7. **Fetched-but-never-shown data.** `api.ts:23` requests `sunrise,sunset` daily and `weather_code` hourly — `DailyForecast` renders only a min/max line chart (no icons, no sunrise/sunset, no description), `HourlyForecast` renders only temperature (no icons). Users get less than the API call costs.
8. **No weather descriptions.** `WeatherIcon.tsx` maps WMO codes → icons but there is **no code→label mapping** ("Overcast", "Drizzle", …) anywhere, so the UI shows an icon + temperature with no words. Screen readers get nothing meaningful.
9. **Hourly slice is buggy.** `HourlyForecast.tsx:17` matches `getHours() === now.getHours()` on raw ISO strings **ignoring the API timezone**; when no hour matches, `findIndex` returns `-1` and `slice(-1, 23)` silently shows the wrong window. Also breaks across day boundaries/DST.
10. **Search UX gaps:** `SearchBar` duplicates the `CityData` interface instead of importing it; `value={null}` makes the Autocomplete effectively uncontrolled (selection never displays); `filterOptions={(x) => x}` + `includeInputInList` is correct for remote search but there's no loading indicator, no "no results" state, no keyboard-announced status; debounce `setTimeout` in a ref is never cleared on unmount.
11. **State UX gaps:** single `CircularProgress` for all loading (no skeletons, layout jumps); error is a bare `Alert` with retry only via re-selecting the city; no empty state (before default city loads); no offline handling; three separate `<Fade>` wrappers in `page.tsx:38-62` triple-animate instead of one.
12. **Missing portfolio-expected features:** no geolocation ("use my location"), no recent searches / favorites (localStorage), no °C/°F toggle, no wind/humidity detail beyond three lines, no deep-link (`?city=` / `?lat=&lon=`) so results aren't shareable, no PWA/manifest.

### Code health / tech debt

13. **MUI Grid v2 misuse.** `CurrentWeather.tsx:28,37` uses `<Grid sx={{ xs: 12, md: 6 }}>` — in MUI v7 the breakpoint props live on the Grid item (`<Grid size={{ xs: 12, md: 6 }}>` / `Grid2`), not in `sx`. Currently silently renders wrong widths (verify in browser; likely full-width always).
14. **Wrong file homes.** `api.ts` and `interfaces.ts` live in `src/app/` (route territory) — should be `src/lib/` + `src/types/`. `interfaces.ts` declares non-exported interfaces + `export type` at the bottom; `SearchBar.tsx:6-13` re-declares `CityData` instead of importing.
15. **Axios without guards.** No timeout, no cancellation (`AbortController`), no query encoding (`?name=${cityName}` breaks on spaces/umlauts — use `params`), no response validation (zod or manual guard). `console.error` in hooks with no user-visible fallback for the default-city path.
16. **Wasteful default-city load.** `useSearch` hardcodes `"Vienna"` then spends an API call (`fetchDefaultCityData`) to resolve coordinates it could ship statically. One round-trip wasted on every first visit.
17. **Double-fetch / race risk.** `useSearch.loadDefaultCity` effect depends on `[city, selectedCity]` and fires the default fetch while the user may already be typing; `useWeather` has no stale-response guard (slow first response can overwrite a newer city's data).
18. **`next.config.ts` is empty.** No `output: 'export'`, no `images: { unoptimized: true }` — required for GitHub Pages static export (main site learned this in Phase 0). If Pages currently builds, it's via external magic; fragile and undocumented.
19. **`package.json` scripts are stale.** `lint` runs `next lint` (deprecated/removed in Next 15); no `typecheck`, `format`, or `test` scripts. `axios` is redundant weight (native `fetch` suffices); `@emotion/*` are MUI transitive deps (don't need direct listing); `@mui/x-charts` is the heaviest dep — only worth keeping if charts become excellent, else replace with a lighter custom SVG sparkline.
20. **SEO/a11y gaps.** `layout.tsx` metadata is `title: "Weather"` + one-line description. No Open Graph/Twitter cards, canonical, `robots.ts`/`sitemap.ts`, `manifest.ts`, JSON-LD, `theme-color`, favicon set (only default `favicon.ico`), or semantic headings (city name is `h2`, sections are `h3`s, fine — but charts have no text fallback). No skip-link, no `:focus-visible` styling, floating labels rely on MUI defaults (ok) but chart SVGs are decorative-to-AT without summaries.
21. **No tests, no CI.** Zero test files, zero workflow in `.github/` (verify — `ls` showed none). Regressions like #9/#13 have nothing to catch them.
22. **`public/` is boilerplate.** `file.svg globe.svg next.svg vercel.svg window.svg` — create-next-app leftovers, all unused. No OG cover, no app icons.

---

## 2. Vision & principles

**Positioning (one line):** _A fast, accessible weather dashboard — Vienna-born, Open-Meteo powered — styled like the rest of bachi.dev and built like production code._

**Design principles (mirrored from the main site):**

1. **One brand, everywhere:** zinc-950 base, violet accent, Inter + Geist Mono — import the tokens, don't re-invent them.
2. **Data earned, data shown:** every field requested from the API is displayed or the request is trimmed.
3. **Calm + fast:** skeletons over spinners, dynamic-imported charts, `prefers-reduced-motion` respected, Lighthouse 95+ target.
4. **Sturdy by default:** typed API boundary, request cancellation, error boundaries, empty/error/offline states, tests on the tricky parts.
5. **Portfolio-readable:** a stranger from bachi.dev `/work` understands what it is, what it uses, and where the code is within 10 seconds.

**Success metrics (define done):**

- Looks like it belongs next to bachi.dev (side-by-side visual review, mobile + desktop).
- Lighthouse ≥ 95 / 95 / 95 / 100 (Perf/A11y/Best Practices/SEO), no CLS, charts never block first paint.
- `typecheck` + `lint` + `test` + `next build` (static `out/`) all green in CI.
- Zero `console.*`, zero dead assets, zero hardcoded secrets (none needed — Open-Meteo is keyless).

---

## 3. Information architecture (proposed)

Single page (keep it — right for this app), but with real chrome:

```
1. Header (slim: ← bachi.dev · Weather Dashboard · GitHub source icon)
2. Hero strip (H1 + one-line lede + tech pills: Next.js · TypeScript · Open-Meteo · MUI)
3. Search (Autocomplete + Geolocate button + °C/°F toggle + recent searches)
4. Current weather (hero card: icon + temp + description + feels-like + meta grid:
   wind / humidity / pressure / sunrise / sunset)
5. Daily (7-day detail cards — icon, hi/lo, description — + optional temp-range chart)
6. Hourly (next-24h strip or chart with timezone-correct slicing)
7. Footer (© year Fabian Bachmayer · fabian@bachi.dev · bachi.dev link · "Data: Open-Meteo" attribution · Back to top)
```

**Routing:** `/` only, plus search params for deep-linking: `?name=Vienna&lat=48.21&lon=16.37&units=metric`. Selecting a city replaces the URL (shareable); loading with params skips the geocoding round-trip.

**Navigation:** header back-link `← bachi.dev` (https://bachi.dev) + `Work` anchor (https://bachi.dev/work) + GitHub icon (repo URL). No mobile menu needed at this size.

---

## 4. Design system (match bachi.dev — copy, don't drift)

### 4.1 Tokens (Tailwind v4 `@theme` in `globals.css`, copied from main site)

- **Colors:** bg `zinc-950` (`#09090b`), raised surfaces `zinc-900` / `white/[0.02]`; text `zinc-100` headings / `zinc-300`-`zinc-400` body (contrast ≥ 4.5:1); accent violet `brand-400 #a78bfa` / `brand-500 #8b5cf6`, gradients `from-violet-500 to-fuchsia-500` only; borders `white/10`; success/error emerald/red for form states.
- **Typography:** `Inter` (sans, body + headings, tight `-0.02em` headings, `leading-relaxed` body) + `Geist_Mono` **only** for kickers/pills/stats/labels. Kill the all-mono body.
- **Shape:** `rounded-xl`/`rounded-2xl` cards, `rounded-full` pills/buttons; single card style: `border-white/10 bg-white/[0.02]` + hover `border-violet-500/40` + violet shadow (replace all white-glow hovers).
- **Background:** drop the blue-purple gradient wash. Use zinc-950 + subtle `bg-grid-pattern` and/or a faint violet radial glow (copy the utility from the main site). Optional: keep a _hint_ of sky character in the CurrentWeather hero card (per-city dynamic tint by weather code — tasteful, contained, not page-wide).
- **Focus:** violet `:focus-visible` ring + skip-link (copy both from main site).

### 4.2 Shared primitives (mirror main-site names where sensible)

- `Section`/`Container`-equivalent layout rhythm: `max-w-6xl`, sections `py-10 md:py-14`, kicker (mono, uppercase, violet) → H2 → lede pattern for Daily/Hourly headings.
- `Card`, `Pill/Badge`, `Stat` (value + label), `EmptyState`, `ErrorState` (message + Retry button), `Skeleton` rows for loading.
- `SocialLinks`-equivalent: GitHub + Mail + Globe (bachi.dev) icons — use `lucide-react` (as the main site does) for chrome; keep MUI icons only inside weather-mapped components or migrate `WeatherIcon` to Lucide weather glyphs for visual consistency.
- `Reveal`-equivalent: skip for v1 (dashboard content should render instantly; animation budget goes to skeletons + chart transitions, both reduced-motion-gated).

### 4.3 MUI vs Tailwind decision (make once, in Phase 0)

- **Recommended: Tailwind owns layout/chrome/cards; MUI keeps Autocomplete + charts only** (shortest path, lowest risk). Theme MUI via `createTheme` with Inter + violet palette + dark mode so the two systems agree.
- **Alternative (cleaner, bigger): drop MUI entirely** — custom combobox + lightweight SVG charts. Saves ~150–250 kB JS but costs 1–2 days. Defer unless bundle audit (§6.5) misses budget with MUI kept.
- Either way: **one font source** (`next/font/google` Inter + Geist Mono in `layout.tsx`), **one dark theme**, delete the dual font definitions (`globals.css` mono body vs MUI mono typography).

---

## 5. Section-by-section plan

### 5.1 Chrome: Header + Footer (NEW — highest portfolio ROI)

- Slim sticky header: monogram/`← bachi.dev` link, centered wordmark or app title, right side: units toggle + GitHub icon-button. `aria-label`s, keyboard reachable, no FAB.
- Footer: brand line, `fabian@bachi.dev` mailto, sitemap links (bachi.dev, /work, demo anchors), **Open-Meteo attribution (required by their terms — "Weather data by Open-Meteo.com")**, imprint shortcut (link to bachi.dev legal block, don't duplicate), `Back to top ↑`, "Built with Next.js & Open-Meteo".
- **Delete** the floating `Fab` in `layout.tsx` and all 5 unused `public/*.svg`.

### 5.2 Hero strip (NEW, tiny)

- Eyebrow (mono, violet): `OPEN-METEO · NO API KEY` or `LIVE DEMO`.
- H1: keep "Weather Dashboard" but add lede: "Current conditions, 7-day and 24-hour forecasts for any city — built with Next.js, TypeScript and the Open-Meteo API."
- Tech pills: `Next.js · TypeScript · Open-Meteo · MUI` (mono pills, shared `Pill` style).
- Keep it compact — this is an app, not a landing page; search must stay above the fold.

### 5.3 Search (`SearchBar.tsx` + `useSearch`)

- Import `CityData` from shared types (delete local duplicate); show selected value (controlled component); add `loading` spinner in the input, `noOptionsText` ("No cities found — try another spelling"), `aria-label` + live status.
- Fix debounce: `useRef` + cleanup on unmount (or `useDeferredValue`/`useMemo`-debounce); encode query via `params` (fixes "São Paulo", "München").
- Add **Geolocate** button (`navigator.geolocation` → reverse via Open-Meteo geocoding? No — Open-Meteo has no reverse endpoint; use BigDataCloud free reverse or simply label the coords "Current location" and fetch weather directly). Handle denial with a friendly message.
- Add **recent searches** (last 5, `localStorage`, pill row under the input, click to reload, clear button).
- Deep-link: on select, `router.replace('?name=&lat=&lon=')`; on load, parse params and skip geocoding when coords present.
- Static default city: ship Vienna coords (`48.2082, 16.3738`) as a constant — delete `fetchDefaultCityData` round-trip.

### 5.4 Current weather (`CurrentWeather.tsx`)

- Fix Grid API (`Grid2`/`size` prop) and verify 2-col → 1-col collapse visually.
- Add **description line** from new WMO code→label map (e.g. code 3 → "Overcast"); show sunrise/sunset (already fetched!) + wind direction if added to the API call; restructure meta as `Stat` grid (Wind, Humidity, Pressure, Sunrise, Sunset, Feels like).
- Dynamic hero tint: subtle per-condition accent (clear → amber hint, rain → sky hint, snow → slate hint) inside the card only — keep page chrome violet/zinc.
- Units: respect °C/°F + km/h/mph toggle (convert client-side from metric base).
- A11y: icon gets `aria-hidden` + adjacent visually-hidden or visible description text; temperature uses `<output>`/`aria-live="polite"` on city change.

### 5.5 Daily (`DailyForecast.tsx`)

- Rebuild as **7 detail cards first, chart second**: each day — weekday, icon + description, hi/lo (bold hi), sunrise/sunset small, precipitation probability if added to query. Cards carry the information; chart becomes the nice-to-have.
- Keep the min/max chart only if restyled (violet/fuchsia lines, zinc axes, responsive, `dynamic` import with `ssr: false` + skeleton fallback). Otherwise replace with per-day range bars (pure CSS/SVG, zero JS weight — and a reason to drop `x-charts`).
- Extend the API query: add `precipitation_probability_max` + `wind_speed_10m_max` (cheap, high value). Display them.
- A11y: every chart gets a visually-hidden data table (or `aria-label` summary + the detail cards serve as the text alternative — document which).

### 5.6 Hourly (`HourlyForecast.tsx`)

- **Fix the slice bug:** compare in the location's timezone (API returns `utc_offset_seconds` — use it, or request `hourly=time` + `timezone=auto` and slice from index 0/current via `current.time`). Guard `findIndex === -1` (fallback: first 24 entries). Add a regression test.
- Reduce x-axis crowding: tick every 3h, rotate/format compactly (`3PM`), add horizontal scroll-snap strip alternative (icon + temp per hour) for mobile.
- Include hourly weather icons (already fetched `weather_code`, never rendered) + description on hover/`title`.
- Same dynamic-import + skeleton treatment as Daily chart.

### 5.7 `WeatherIcon.tsx` + new `weatherCodes.ts`

- New `src/lib/weatherCodes.ts`: `WMO_CODE → { label, dayIcon, nightIcon }` table covering all Open-Meteo codes (0–99 incl. 96/99 hail — currently mapped to generic thunderstorm). Day/night via sunrise/sunset or `is_day` (add `is_day` to the current query — free).
- Migrate glyphs to Lucide (`Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, Snowflake, CloudLightning, CloudHail`) for bachi.dev consistency; keep the component API (`<WeatherIcon code isDay size />`).
- Unit-test the full mapping (every documented code returns a label + icon; unknown codes fall back gracefully, never crash).

### 5.8 API layer (`api.ts` → `src/lib/`) + hooks

- Move to `src/lib/openMeteo.ts` (fetch, not axios — drop axios unless something needs it); `params`-based queries; `AbortController` timeout (8–10 s); typed guards on responses; friendly error classes (`CityNotFound`, `NetworkError`, `TimeoutError`).
- Simple cache: in-memory `Map` + `localStorage` (10-min TTL per coords, stale-while-revalidate) so back-navigation and unit toggles don't refetch.
- Hooks: `useSearch` (input + options + recent + geolocation state) and `useWeather` (data + loading + error + `retry()`) with stale-response guards (request id ref), tested with RTL + mocked fetch.
- Remove all `console.error` (report to UI state; optional `reportError` stub).

### 5.9 States & resilience (cross-cutting)

- `error.tsx` + `loading.tsx` route files (App Router) + an `ErrorBoundary` around charts (a chart crash must not blank the current weather).
- Skeletons: current-card skeleton, 7-card daily skeleton, chart skeleton — no bare page spinner, no layout shift (reserve heights).
- Offline: `navigator.onLine` listener + friendly banner ("You're offline — showing last cached data") when cache exists.

### 5.10 SEO / PWA

- `layout.tsx` metadata: title template (`"%s · Weather Dashboard · Fabian Bachmayer"`), 150–160-char description ("…Open-Meteo…"), `metadataBase: https://bachidev.github.io/weather`, canonical `/`, OG/Twitter card with generated `og-cover.png` (reuse main-site `scripts/generate-og-cover.mjs` pattern), `theme-color`, `authors`, `keywords` (light).
- `robots.ts` + `sitemap.ts` + `manifest.ts` (all `force-static` for export; verify in `out/`), JSON-LD `WebApplication` (+ `author` Person pointing at bachi.dev).
- Favicon audit: reuse bachi.dev icon set; `manifest` name "Weather Dashboard — Fabian Bachmayer".

---

## 6. Technical plan

### 6.1 App structure (target)

```
src/
  app/
    layout.tsx          # fonts (Inter + Geist Mono), metadata, JSON-LD, skip link, header/footer
    page.tsx            # Server Component shell composing client islands (search + results)
    loading.tsx error.tsx
    globals.css         # Tailwind v4 @theme tokens (copied from bachi.dev) + grid utility + reveal guards
    robots.ts sitemap.ts manifest.ts
    icon.png apple-icon.png (favicons)
  components/
    chrome/  (Header, Footer)
    weather/ (SearchBar, CurrentWeather, DailyForecast, HourlyForecast, WeatherIcon,
              HourlyStrip, DayCard, StatCard, UnitsToggle, RecentSearches, GeolocateButton)
    ui/      (Card, Pill, Stat, EmptyState, ErrorState, Skeletons, SectionHeading)
  lib/
    openMeteo.ts   # fetch client + query builders + response guards + cache
    weatherCodes.ts# WMO code → label/icons
    units.ts       # °C/°F, km/h↔mph, time formatting (Intl, timezone-aware)
    geo.ts         # geolocation + reverse-label helper
    cn.ts          # classnames helper (copy from main site)
    storage.ts     # typed localStorage (recents, units, favorites)
    params.ts      # URL search-param encode/decode
  types/
    weather.ts     # WeatherData, CityData, GeoResult (exported interfaces, no dupes)
  hooks/
    useSearch.ts useWeather.ts useUnits.ts useRecentSearches.ts (all tested)
tests/
  lib/weatherCodes.test.ts
  lib/units.test.ts
  lib/openMeteo.test.ts (mapping + guards + param encoding)
  components/WeatherIcon.test.tsx
  hooks/useWeather.test.tsx (stale-guard + error states)
  e2e/smoke.spec.ts (Playwright, optional Phase 3)
```

### 6.2 Key refactors (ordered)

1. **Phase 0 foundations:** `next.config.ts` → explicit `output: 'export'` + `images: { unoptimized: true }` (+ `basePath` only if the Pages project setup needs it — document why); `.env.example` (no keys needed — note that); scripts `dev/build/start/typecheck/lint/format/test` (flat `eslint .`, drop `next lint`); Prettier config copied from main site; `.github/workflows/ci.yml` (lint + typecheck + test + build) + Pages deploy workflow mirroring bachi.dev's.
2. **De-client `page.tsx`:** shell becomes a Server Component; islands (`SearchSection`, `WeatherResults`) get `'use client'` — same Server-first split the main site applied.
3. **Fonts + tokens:** `next/font/google` Inter + Geist Mono; `body { font-family: sans }`; `@theme` brand ramp; delete gradient wash + mono-body CSS; MUI theme aligned (Inter, violet primary, dark mode) if MUI stays.
4. **Types + API move:** `interfaces.ts` → `src/types/weather.ts` (real exports); `api.ts` → `src/lib/openMeteo.ts` on `fetch` with timeout/cancel/guards; static Vienna fallback; delete axios if unused after migration.
5. **Grid fix + card rebuild** on shared `Card`/`Stat` (kills white-glow hovers, fixes widths).
6. **Charts:** `next/dynamic` + `ssr: false` + skeletons; decide keep-`x-charts` vs custom SVG by bundle audit (keep only if restyled excellently).
7. **Cleanup `public/`:** delete 5 boilerplate SVGs; add `og-cover.png`, favicon set.

### 6.3 SEO — see §5.10 (same checklist the main site completed in Phase 3).

### 6.4 Accessibility (acceptance: axe clean, keyboard-only pass)

- Skip link, violet `:focus-visible` rings, body text `zinc-300`+ for contrast, Autocomplete fully keyboard-operable with announced status, charts have text alternatives, `aria-live="polite"` on result region, decorative FX `aria-hidden`, `prefers-reduced-motion` disables chart animation + fades.

### 6.5 Performance budget

- Target: ≤ 200 kB first-load JS (ex-charts), LCP < 2.5 s on Moto G4/4G, no CLS (reserved skeleton heights, explicit chart aspect).
- Levers: dynamic-import charts, drop axios, drop-or-tree-shake MUI icons (import per-icon — already done — but audit `@mui/x-charts` weight first), subset fonts, `loading="lazy"` below fold, 10-min cache kills refetch spam.

### 6.6 Quality gates

- ESLint (next + `jsx-a11y`), Prettier, `tsc --noEmit` in CI before `next build`.
- Vitest + RTL (+ `msw` or fetch mocks) for lib/hooks/components; Playwright smoke (search → select → results visible) as Phase 3 stretch.
- PR checklist: Lighthouse + axe + visual diff vs bachi.dev tokens (copy the main-site PR template idea).

---

## 7. Features (new — prioritized)

| #   | Feature                                                        | Value                                      | Cost                                |
| --- | -------------------------------------------------------------- | ------------------------------------------ | ----------------------------------- |
| F1  | Geolocation ("Use my location")                                | High (expected in any weather app)         | S — geolocation API + reverse label |
| F2  | °C/°F + km/h/mph toggle (persisted)                            | High (US visitors, portfolio completeness) | S — `units.ts` + context            |
| F3  | Recent searches (localStorage, 5)                              | High (return-visit UX)                     | S                                   |
| F4  | Daily detail cards (icon, desc, hi/lo, precip, sunrise/sunset) | Highest (shows already-fetched data)       | M                                   |
| F5  | WMO description labels + day/night icons                       | Highest (core readability + a11y)          | S                                   |
| F6  | Deep-link `?lat&lon&name`                                      | M (shareable results)                      | S                                   |
| F7  | Hourly strip for mobile + fixed timezone slicing               | High (fixes real bug #9)                   | M                                   |
| F8  | Favorites (pin cities)                                         | M                                          | S (extends F3 storage)              |
| F9  | Precipitation probability + wind-max in daily                  | M                                          | S (2 query params + display)        |
| F10 | PWA manifest + installable                                     | Low-M                                      | S                                   |
| F11 | Multi-day hourly browser / 7-day hourly                        | Low (scope creep risk)                     | M — defer                           |
| F12 | Maps/radar layer                                               | Low for portfolio, high cost               | L — explicitly out of scope         |

Ship F1–F7 + F9 in v1; F8/F10 if smooth; F11/F12 out.

---

## 8. Testing plan

- **Runner:** Vitest + React Testing Library + jsdom (Next 15 compatible); `msw` for API mocks or hand-rolled `fetch` stubs (prefer hand-rolled — fewer deps for this size).
- **Unit (lib):** `weatherCodes` full-table coverage; `units` conversions + formatting incl. edge cases (−0, rounding); `openMeteo` param encoding (umlauts/spaces), response guards (malformed → typed error), cache TTL logic; `params` round-trip.
- **Hooks:** `useWeather` — loading → success, error + `retry()`, stale-response guard (slow A then fast B shows B); `useSearch` — debounce fires once, empty input clears, unmount cleanup.
- **Components:** `WeatherIcon` every code band; `SearchBar` keyboard select + no-results + loading states; `CurrentWeather` unit conversion display; error/empty/skeleton states render.
- **A11y:** `axe-core` (jest-axe) on page + cards; keyboard-only walkthrough script in PR template.
- **E2E (stretch):** Playwright: load → default Vienna visible → search "Graz" → select → URL params set → hourly+daily visible; offline → cached banner.
- **Gates:** `npm test` (watch-off CI mode) + coverage threshold on `lib/` (≥ 80%) in CI.

---

## 9. Phased roadmap (solo-friendly, each phase shippable)

### Phase 0 — Foundations (done 2026-09-29, no visual change)

- [x] `next.config.ts`: explicit `output: 'export'` + `images.unoptimized` + `basePath: "/weather"` behind `GITHUB_PAGES=true` (project site, not user site — basePath verified in `out/index.html`: all `/_next` + favicon URLs carry the prefix; local dev stays at `/`). No `configure-pages` magic.
- [x] Scripts: `typecheck` / `lint` (flat `eslint .` + ignores for `.next/out/coverage`, dropped `next lint`) / `format` + `format:check` (Prettier, `.prettierignore`) / `test` + `test:watch` (Vitest 3 + RTL + jsdom, `vite-tsconfig-paths` for `@/*`, ≥80% coverage gate on `lib/`+hooks). First test: `DEFAULT_CITY` smoke.
- [x] Deps: `lucide-react` (matches main site) + `@mui/material` declared explicitly (was imported everywhere but only transitively installed — fragile). Kept `axios`/`@emotion` for now; axios → fetch migration is Phase 2. Pinned test stack to `@types/node@20`-compatible majors (vitest 3, plugin-react 4, jest-dom 6).
- [x] Types: `src/app/interfaces.ts` → `src/types/weather.ts` (real exports); `SearchBar` duplicate deleted; debounce cleared on unmount.
- [x] Static default city: `src/lib/defaultCity.ts` (Vienna 48.2082, 16.3738) — deleted `fetchDefaultCityData` round-trip; `useSearch` initializes synchronously.
- [x] Deleted 5 unused `public/*.svg` (verified unreferenced); added `.env.example` (documents keyless Open-Meteo + `GITHUB_PAGES` knob); README gained scripts/deploy/roadmap sections.
- [x] CI: `ci.yml` (typecheck + lint + format:check + test + build) + `pages.yml` (build with `GITHUB_PAGES=true` → deploy `./out`). Branch stays `master` (current Pages default — don't rename mid-overhaul).
- [x] Findings: `typecheck` caught a **pre-existing build break** — MUI v7 Grid props (`alignItems` as prop, `xs/md` inside `sx`) fail `tsc` (old `next lint` never checked). Fixed minimally with `size={{…}}` + `sx` (full card rebuild is Phase 1). Baseline perf: **293 kB first load** (target ≤200 kB — confirms the Phase 2/3 bundle decision). Note: stray `C:\Users\Fabian\package-lock.json` triggers Next's "multiple lockfiles" warning — outside this repo, left alone.

### Phase 1 — Design system + bachi.dev coherence (done 2026-09-29)

- [x] Tokens in `globals.css` (`@theme`: brand violet ramp, Inter + Geist Mono vars, zinc-950 body, violet `:focus-visible`, skip-link, `bg-grid-pattern` — copied from main site); gradient wash + mono-body CSS deleted.
- [x] `layout.tsx`: Inter (sans body) + Geist Mono (accents), skip link, `<main id="main">`; new `Header` (sticky, `← bachi.dev`, wordmark, Mail + Source links) + `Footer` (brand, portfolio nav, Open-Meteo attribution, back-to-top); **floating FAB deleted**.
- [x] Primitives: `Card` / `Pill` / `Stat` / `SectionHeading` (+ `cn()`), same class patterns as main site. New compact `Hero` (eyebrow, H1, lede, stack pills, grid-masked backdrop); `page.tsx` H1 removed (single H1), MUI Container → `max-w-6xl` Tailwind wrapper.
- [x] `CurrentWeather` rebuilt on `Card` + `Stat` grid (violet-tinted icon, rounded temps, **visible WMO description** via new `src/lib/weatherCodes.ts` + 3 tests, feels-like stat); white-glow hovers gone everywhere.
- [x] MUI theme aligned (Inter, violet primary, zinc surfaces); `SearchBar` input re-tinted (zinc fill, violet focus ring); Daily/Hourly charts re-tinted (fuchsia max / violet min / violet hourly) on `Card` + `SectionHeading` (h3).
- [x] Definition of done: `typecheck` + `eslint .` + `format:check` + `test` (4 passing) + `next build` (static `out/`) all green; `out/index.html` verified to contain skip-link, header, hero, and attribution server-rendered. First load ~292 kB (bundle diet is Phase 2/3).
- [x] Deliberately deferred: Lucide weather glyphs (Phase 2 with day/night), page de-clienting (Phase 2, when units/recents state lands), full SEO metadata (Phase 3).

### Phase 2 — Data honesty + feature completions (done 2026-09-29)

- [x] `src/lib/weatherCodes.ts` extended to `getWeatherMeta(code, isDay)` (day/night Lucide glyphs for all WMO bands, unknown → Cloud fallback) + `WeatherIcon` migrated from MUI to Lucide (`role="img"` label support); 5 tests.
- [x] Daily detail cards (`DayCard`: weekday, icon + sr description, hi/lo, precip %, wind max, sunrise/sunset) + extended query (`precipitation_probability_max`, `wind_speed_10m_max`, `is_day`, `wind_direction_10m`, `current.time`); chart kept below, unit-aware.
- [x] Hourly timezone bug fixed: new `src/lib/forecast.ts` `sliceNext24Hours()` anchors on location-local `current.time` (lexicographic, no TZ math) with `findIndex === -1` fallback (regression-tested); hourly **chart replaced by a scroll-snap strip** (icon + temp + aria-label per hour, mobile-first, zero chart JS).
- [x] `src/app/api.ts` (axios) → `src/lib/openMeteo.ts` (fetch): `params`-encoded queries, 10 s timeout, AbortController cancellation, typed `WeatherApiError`, response guards, 10-min `Map` cache; `useWeather` gained stale-response guard (request id + abort), `retry()`, friendly messages; `useSearch` gained `searching` state, controlled selection display, empty/no-result texts.
- [x] Units toggle (°C/°F, km/h/mph via `units.ts`, persisted, no refetch) + recents (5, persisted, click-to-reload + clear) + geolocation button (denial handled, coords-labelled city) + deep-link `?name&lat&lon` (shareable, skips geocoding).
- [x] States: `ResultsSkeleton` (reserved heights) + `ErrorState` (retry) + `EmptyState` + route `loading.tsx`/`error.tsx` + `OfflineBanner` + `aria-live` results region.
- [x] Learnings: deep-links are applied in a mount effect via `window.location.search`, NOT `useSearchParams` — the Suspense bailout emptied the static prerender (caught by grepping `out/`). Prerender verified again (search + skeleton in HTML). `axios` is now unbundeled (147 kB route, 277 kB first load, down from 293) but still listed — `npm uninstall axios` is Phase 3.
- [x] Definition of done: 38/38 tests green (incl. stale-guard + retry + cache + encoding), `typecheck` + `lint` + `format:check` + `next build` green; tests caught 3 real bugs pre-merge (params `Number(null)===0`, cache-bucket test error, `code >= 95` swallowing unknown codes).
- [x] Hotfix 2026-09-29 (reported live: ErrorState + console 400s + hydration mismatch):
  - **400 root cause:** `current=time` is not a requestable variable — Open-Meteo auto-includes `current.time` and rejects it explicitly (bisected live: every other variable 200s, `time` 400s; fixed URL verified 200). Removed from the query; hourly window now anchors on new `locationNowIso(utc_offset_seconds)` (`forecast.ts`, tested incl. negative offsets). `WeatherData` gained required `utc_offset_seconds` (guard-enforced); `current.time` removed from types + fixtures.
  - **Hydration root cause (emotion):** without `@mui/material-nextjs` `AppRouterCacheProvider`, Emotion's server `<style data-emotion>` tags don't match client insertion → React regenerates the tree (your stack trace: server `style` vs client `header`). Provider added (documented MUI App Router fix) + theme memoized.
  - **Hydration second source (storage):** `useUnits`/`useRecentSearches` read localStorage during render → repeat visits hydrate differently than the prerender. Both now init with defaults and load stored prefs in a mount effect.
  - **Dep hygiene found en route:** `@mui/material` had floated to v9 (peer-mismatched with icons/x-charts v7-era) — pinned back to v7 line (`npm ls` clean, first load 265 kB, down from 277).
  - 40/40 tests green; `out/` prerender re-verified (search + skeleton in HTML). Please confirm in the browser: no hydration warning, Vienna loads, hourly starts at the current hour.

### Phase 3 — SEO / a11y / perf / tests hardening (done 2026-09-29)

- [x] Full metadata (`title` template, 155-char description, `metadataBase: https://bachidev.github.io/weather`, canonical, OG/Twitter cards, keywords, `theme-color`) + JSON-LD `WebApplication` + `robots.ts`/`sitemap.ts`/`manifest.ts` (all `force-static`; verified byte-correct in `out/`).
- [x] OG cover + app icons generated without design tools: `scripts/generate-assets.mjs` (sharp SVG raster, `npm run assets`) → `public/og-cover.png` (1200×630, 91 kB) + `icon-192/512.png`; manifest uses relative icon paths + `start_url: "."` so both `/weather` (Pages) and `/` (local) resolve.
- [x] Daily chart dynamically imported (`ssr: false` + pulse fallback); detail cards are the text alternative. **Bundle verdict: KEEP `x-charts` — first load 193 kB, under the 200 kB budget** (was 265 kB; route JS 147 → 65 kB).
- [x] Dep cleanup: `axios` uninstalled (unused since Phase 2 fetch rewrite); MUI v7 line aligned; `eslint-plugin-jsx-a11y` recommended set added — lint clean, zero violations.
- [x] Tests: 46/46 green, coverage **~94% lines** (gate ≥80% enforced via `test:coverage`, now the CI command). Added `useSearch`/`useUnits`/`useRecentSearches`/`cn` suites.
- [x] Still manual (needs a real browser — not available in this environment): Lighthouse run on the deployed URL (target 95+/95+/95+/100), keyboard-only walkthrough (search → select → units → recents → retry), axe DevTools pass, OG preview debugger. Checklist:
  1. `npm run build` → `npx serve out` → Chrome Lighthouse (mobile + desktop).
  2. Tab through the whole page; verify violet focus rings + skip link + Escape closes suggestions.
  3. Paste the live URL into LinkedIn/GitHub preview debuggers; confirm the OG cover renders.
  4. DevTools Network throttling (Fast 4G): skeleton → results, no CLS.
- [x] Lighthouse triage 2026-09-29 (report `localhost_3000-*.json`): Perf 76 / A11y 100 / BP 100 / SEO 91 — **but measured against the Turbopack dev server**, so perf numbers are noise (dev-only: `next-devtools` 1.38 MB, unminified react-dom 896 KB, 36 scripts, HMR WebSocket, `no-store` → the unminified/unused-JS, TTI 9.3s, and both bf-cache failures all evaporate in production; prod first load is 193 kB). Two real takeaways: (1) `label-content-name-mismatch` on the units toggle (aria-label "Use Celsius" vs visible "°C") — fixed to "Temperature unit °C" style labels; (2) `meta-description` fail was a stale dev server (tag verified present in `out/index.html`). Re-run protocol: `npm run build` (no env) + `npx serve out` + incognito + mobile, never `next dev`.

### Phase 4 — Launch & iterate (in progress)

- [x] Live deploy verified: production Lighthouse at https://bachi.dev/weather/ → **99 / 100 / 100 / 100** (Perf/A11y/BP/SEO).
- [x] CI incident 2026-09-29 (red `CI #1` run): `test:coverage` died with `webidl.util.markAsUncloneable is not a function` (jsdom → undici chain) — **jsdom 30 requires Node `^22.22.2 || ^24.15.0 || >=26`**, but the workflows pinned Node 20 (copied from the main site, which has no jsdom tests). Local Node 24 masked it. Fixed: `ci.yml` + `pages.yml` → Node 22.
- [x] Duplicate-deploy incident 2026-09-29 (3 runs per push): the repo carried the stock GitHub Pages starter `.github/workflows/nextjs.yml` (commit `f572578 Create nextjs.yml`, created via the GitHub web UI when Pages was enabled) next to our `ci.yml` + `pages.yml` — two racers deploying the same Pages environment. Deleted the starter; `pages.yml` (explicit `GITHUB_PAGES` basePath, no `configure-pages` magic) is the single deploy path. Expect exactly 2 runs per push from now (CI + Deploy to Pages).
- [ ] Link back from bachi.dev `/work` (update the portfolio `projects.ts` entry/screenshot if the new look warrants it).
- [ ] Optional follow-ups: favorites (F8), PWA installability (F10), quarterly dep/Lighthouse refresh.

### Phase 5 — Impressive features (proposed, not started)

Goal: keep the sturdy foundation, add the "wow" a portfolio visitor remembers — all with **keyless, free APIs** (Open-Meteo family, RainViewer) and **zero new runtime deps** (first load must stay ≤ 220 kB; hand-rolled SVG/CSS over libraries).

#### 5A — Atmosphere (done 2026-09-29)

- [x] **A1 Condition-reactive backdrop** (`src/lib/scene.ts` + `SceneBackdrop`): 9 scenes from WMO code + `is_day` as inline-style radial glows (no Tailwind purge risk), key-based crossfade with reduced-motion static fallback, `aria-hidden`. 4 tests.
- [x] **A2 Sun arc** (`src/lib/sun.ts` + `SunArc`): dashed SVG arc, live dot from `sunrise/sunset + locationNowIso()`, times row, `role="img"` label; polar/garbage → times-only fallback, never crashes. 5 tests (incl. a `sin(π)` float lesson — tolerance, not exact equality).
- [x] **A3 Moon phase** (`src/lib/moon.ts` + `MoonPhase`): synodic-month math from the 2000-01-06 new moon (name + illumination % + moon day), mount-guarded render (same hydration class as Phase-2 storage — `Date.now()` differs server/client). 4 tests incl. periodicity invariant.
- [x] Wired in `page.tsx`: backdrop behind everything + Sun/Moon 2-col grid between current and daily. Cost: **+1 kB first load (194 kB)** — pure CSS/SVG/math, zero deps, as budgeted.
- [x] Feedback round 2026-09-29 (priority + density + bugs):
  - **Order:** sun/moon moved to the end (after hourly) — forecasts first, atmosphere last.
  - **Density:** hourly + sun/moon share a `lg:grid-cols-5` row (hourly spans 3, sun/moon stack in 2) — fills wide screens, stacks on mobile.
  - **Bugfix (reported):** `DayCard` wind hardcoded `km/h` — now `formatSpeed(windMax, speedUnit)` + regression test.
  - **New: 12h/24h toggle** (`HourFormat`, persisted in the same `weather:units` key, backward-compatible with pre-hour stored prefs): third segment group (`12h`/`24h`, labels contain visible text per WCAG 2.5.3), threaded through hourly labels, day-card/current sun times, and sun arc. 24h uses 2-digit hours (`07:12`, `14`).
  - **Test-infra fix found en route:** RTL renders leaked across tests (no auto-cleanup without vitest globals) — explicit `afterEach(cleanup)` in `tests/setup.ts`. 63/63 green, first load unchanged at 194 kB.
- [x] Polish round 2026-09-29 (density + prefs): hourly strip **wraps into rows** (even-fill `flex-1 min-w-16`, no scroll); hour labels carry minutes (`2:00 PM` / `14:00`); **24h is first + default** (stored `12h` prefs still respected, backward-compatible); hero de-cluttered (stack pills + "no API key" eyebrow removed, H1 + lede only); dead code pruned (`Pill`, `custom-scrollbar` CSS). 63/63 green, 194 kB unchanged.

#### 5B — Data depth (done 2026-09-29)

- [x] **B1 Air-quality card** (`src/lib/airQuality.ts` + `useAirQuality` + `AirQualityCard`): keyless Open-Meteo AQI API (response shape verified live before coding), 10-min cache, US AQI badge (6 purge-safe color bands) + PM2.5/O₃ stats; failures degrade to a quiet note, never blank the page. Slim strip under the current card. 7 tests.
- [x] **B2 "Rain next 24h"** (`PrecipForecast` + lazy `PrecipChart`): hourly query extended (`precipitation_probability`, `relative_humidity_2m` — 200 verified), composed bar (rain) + line (humidity) chart on a shared 0–100 axis, 3-hour ticks, custom HTML legend (dodged an uncertain `ChartsLegend` API). Rides the existing lazy x-charts chunk.
- [x] **B3 Day drill-down:** `DayCard` is now a real `<button>` (phrasing-content-only internals for valid HTML, `aria-pressed`, full-card accessible name) → hourly grid shows that day's 24 points (`sliceDayHours`, tested) with day-labeled heading + "← Back to next 24 hours" reset; `?day=` deep-link (read on mount, written on select, cleared on city change); smooth scroll to `#hourly` honoring reduced-motion. `decodeDayParam` tested.
- [x] Cost: **197 kB first load** (+3 kB, still ≤ 220 kB budget). 76/76 tests green; prerender re-verified (search + skeleton; data sections correctly client-only).
- [x] Polish round 2, 2026-09-29 (click affordance + AQI fold-in): `button:not(:disabled) { cursor: pointer }` base rule (covers toggles, day cards, retry, geolocate — Tailwind v4 defaults buttons to `default`); AQI strip folded into the current card (AQI tile with band-tinted value + Leaf icon, PM2.5 tile, "—" placeholders while loading/unavailable, zero layout shift, `AirQualityCard.tsx` deleted); sunrise/sunset stats removed (SunArc owns them); `Stat` gained `icon` + `valueClassName`. 76/76 green, 197 kB unchanged.
- [x] Polish round 3, 2026-09-29 (drill-down everywhere + wrap fix): DayCard meta rows regrouped into `whitespace-nowrap` groups (100% precip no longer pushes km/h to the next line); precip chart follows the drilled day (`sliceDayHours` reuse, day-labeled heading); SunArc shows the drilled day's times without a live dot (`Sun path · {day}` label); MoonPhase takes the drilled date (deterministic, still mount-guarded for tonight — eyebrow shows the day). Tests: SunArc dot/no-dot, MoonPhase deterministic full moon (which caught a real a11y insight: `aria-label` on a generic div is ignored — dropped it since the text is self-describing). 80/80 green, 197 kB unchanged.
- [x] Polish round 4, 2026-09-29 (uniformity): DayCard buttons are `h-full` (grid rows render equal heights); feels-like hero line removed (tile already shows it); `Stat` tiles fixed to `min-h-[78px]`, centered, `whitespace-nowrap` value+label, compact `text-base`, icon on every tile (incl. CloudFog for PM2.5); AQI labels shortened for tiles (`USG`, `V. unhealthy` via new `AqiBand.short`, tested). 81/81 green, 197 kB unchanged.
- [x] Branding 2026-09-29: tab icon is now the FB monogram (`public/icon-192.png` copied from bachi.dev's `android-chrome-192x192.png`; `icon-512.png` upscaled from it via `npm run assets`; stale Next-default `favicon.ico` deleted — no `rel="icon"` to it remains). OG cover de-sunned (text + glow + accent bar only, matching the main-site OG style).
- [x] Live-incident triage 2026-09-29 (CI red + missing favicon + dead back-to-top):
  - **CI red = prettier only** (`PLAN.md` + `generate-assets.mjs` edited after the last format pass). Fixed; process rule: `format:check` is always the last gate before push.
  - **Missing favicon = real basePath bug:** Next does NOT apply `basePath` to metadata `icons`, so `/icon-192.png` resolved to the domain root (404) on the live project page while working on localhost. Fixed with absolute custom-domain icon URLs. Same class of bug hit `manifest` harder: the `app/manifest.ts` route _overrides_ the metadata manifest URL with a root-relative link — fixed by serving `public/manifest.webmanifest` statically instead (route deleted). Verified in `out/`: all three links absolute + file exported.
  - **Back-to-top = replaced, not debugged:** the `#top` anchor _should_ have worked (target exists in the served HTML — verified), but cross-component id coupling + router interception is fragile by construction. New `BackToTopButton` does `window.scrollTo({top: 0})` directly (smooth, reduced-motion aware). Cannot fail silently.
- [x] Edit discipline note (two self-inflicted doc-comment clobbers fixed immediately): when appending to a file, anchor on the _end_ of the previous block, never on the next block's comment.

#### 5C — Portfolio showpieces (done 2026-09-29)

- [x] **C1 City compare** (`useCompareWeather` + `CompareSection`): up to 3 cities, parallel cached fetch, per-city error isolation + section retry, persisted + shareable `?compare=name~lat~lon|…` URL (umlaut-safe, capped, validated, tested). Toolbar "Compare" button with full/disabled states. 5 tests.
- [x] **C2 Rain radar, zero map deps** (`src/lib/tiles.ts` + `RadarMap`): OSM base (dark-filtered) + RainViewer overlay on a hand-rolled 3×3 tile grid, zoom 4–10, frame slider + play/pause (user-initiated only), location-local frame labels, attribution, lazy-loaded. 9 tests (known-tile vectors, antimeridian/pole handling, manifest guards).
- [x] **C3 ⌘K palette** (`CommandPalette`): current + recents with filter, native-button keyboard support, autofocus-in-dialog (justified disable), backdrop as a real dismiss button (restructured after jsx-a11y flagged the div-handler pattern), global mod+K toggle. 3 tests.
- [x] Cost: **200 kB first load** (radar rides a lazy chunk; compare+palette in main). 98/98 tests green; prerender re-verified.
- [x] Tooling lesson: Turbopack dev artifacts in `.next` poisoned a prod build (`[turbopack]_runtime.js` prerender crash) — added cross-platform `prebuild` clean (no dep). If `next build` ever fails this way again, that script is why it won't.
- [x] Radar fix 2026-09-29 (reported: tiles "misordered"): the tile math and grid order were correct — the bug was geometry. A 16:9 box with a 3×3 grid makes 16:9 cells, but tiles are square, so `object-cover` cropped ~44% off the top/bottom of every tile: rows went discontinuous at the seams (features "skipped", diagonals looked horizontally shifted). Fixed with a square box (`aspect-square`, capped at 560px) where square tiles fit exactly — zero crop, seamless. Also index-suffixed tile keys (y-clamp can legitimately repeat a tile at polar/low-zoom edges; React still needs unique keys).

#### Explicitly out (documented, not forgotten)

- Severe-weather alerts (no free global source with usable coverage), full i18n (per decision #5), animated radar loop, PWA offline-first (static export + live API = limited value; manifest stays as-is), clothing/activity advice (gimmicky, unprovable).

#### Acceptance (in addition to §11)

- [ ] Each feature: unit-tested pure logic + component smoke test + skeleton/error/empty states + reduced-motion + keyboard support.
- [ ] First load ≤ 220 kB, Lighthouse perf ≥ 95 on production re-run.
- [ ] No new runtime dependencies (devDeps for tests excepted).

**Estimated total:** 3–4 focused days solo. Phase 1 alone delivers ~70% of the perceived level up.

---

## 10. Risks & decisions needed

| #   | Decision                                                  | Recommendation                                                                                | Owner |
| --- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----- |
| 1   | MUI: keep scoped (Autocomplete+charts) vs drop entirely?  | Keep scoped for v1; drop only if bundle audit fails                                           | You   |
| 2   | Charts: keep `x-charts` vs custom SVG range bars?         | Keep iff restyled excellently + dynamically imported; else custom SVG (lighter, more branded) | You   |
| 3   | Geolocation reverse-label provider (Open-Meteo has none)? | BigDataCloud free client-side reverse (no key) or "Current location (lat, lon)" label v1      | You   |
| 4   | `basePath`/repo naming for Pages project page?            | Verify current Pages setup first; document `output:'export'` + workflow like main site        | You   |
| 5   | German (DE) UI toggle?                                    | EN now; note "DE on request" like main site — no i18n in v1                                   | You   |
| 6   | Analytics?                                                | No (matches main-site decision 2026-09-29: portfolio site, no tracking)                       | You   |

---

## 11. Acceptance criteria (ship gate)

- [ ] Side-by-side with bachi.dev: one palette (violet/zinc), two fonts (Inter + mono accents), one card pattern — mobile + desktop.
- [ ] Header/footer with bachi.dev + GitHub + email links and Open-Meteo attribution; no floating FAB; no dead assets.
- [ ] Search: debounced, encoded, loading/empty/error states, keyboard-usable, recents + geolocation + units toggle work.
- [ ] Current: icon + description + temp + feels-like + wind/humidity/pressure/sunrise/sunset; units convert correctly.
- [ ] Daily: 7 detail cards + (optional) restyled chart; hourly: timezone-correct next-24h + icons; WMO labels everywhere.
- [ ] Resilience: skeletons, error + retry, offline banner, chart error boundary, no `console.*`.
- [ ] SEO: OG card renders, robots/sitemap/manifest live, JSON-LD valid, single H1, chart text alternatives.
- [ ] A11y: keyboard-only flow works, focus visible, contrast pass, reduced-motion respected, axe clean.
- [ ] Perf: Lighthouse ≥95/95/95/100, no CLS, charts never block paint.
- [ ] Repo: `typecheck + lint + test + build` green in CI, README updated (run/test/deploy), tests ≥80% on `lib/`.

---

## 12. Immediate next actions (if you say "go")

1. Phase 0 foundations PR (config + scripts + deps + types move + CI + `public/` cleanup).
2. Phase 1 design-system PR (tokens + fonts + Header/Footer/Hero + card rebuild + FAB removal).
3. Copy deck sign-off (hero lede, pills, footer, attribution wording) before Phase 2 styling polish.
4. Phase 2 + 3, then launch + link-back from bachi.dev `/work`.

_Suggested commit flow: one PR per phase above; each deployable to Pages independently._

---

### Appendix — files to touch (quick index)

- Keep & refactor: `src/app/page.tsx` (de-client into shell + islands), `layout.tsx` (fonts/metadata/chrome), `globals.css` (tokens), `components/{SearchBar,CurrentWeather,DailyForecast,HourlyForecast,WeatherIcon}.tsx`, `hooks/{useSearch,useWeather}.ts`, `next.config.ts`, `package.json`, `public/` (prune + OG/favicons), `README.md`.
- Move: `src/app/api.ts` → `src/lib/openMeteo.ts`, `src/app/interfaces.ts` → `src/types/weather.ts`.
- Rework or remove: `ThemeRegistry.tsx` (align or fold into token setup), floating `Fab` in `layout.tsx` (delete → footer link), `axios` (drop if fetch suffices), `@mui/x-charts` (keep iff §6.5 passes).
- Add: `components/{chrome,weather,ui}/*`, `src/lib/{weatherCodes,units,geo,storage,params,cn}.ts`, `src/hooks/{useUnits,useRecentSearches}.ts`, `src/app/{loading,error,robots,sitemap,manifest}.ts`, `og-cover.png`, `tests/**`, `.github/workflows/{ci.yml,pages.yml}`, `.env.example`, PR template with Lighthouse/a11y checklist.
- Do NOT carry over: all-mono typography, gradient-wash background, white-glow card hovers, `next lint`, empty `next.config.ts`, boilerplate `public/*.svg`, uncontrolled `value={null}` Autocomplete, `slice(findIndex)` without the `-1` guard.
