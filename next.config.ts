import type { NextConfig } from "next";

// Static export for the GitHub Pages *project* site
// (BachiDev/weather → https://bachidev.github.io/weather).
// - `output: "export"` + `images.unoptimized` are required: Pages serves static
//   files only, so neither SSR nor Next's image optimizer exist there.
// - `basePath` is "/weather" in CI so `/_next/*` assets resolve under the
//   project subpath; empty locally so `npm run dev` stays at `/`.
//   The CI workflow sets GITHUB_PAGES=true (explicit > configure-pages magic).
const isPagesBuild = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: isPagesBuild ? "/weather" : "",
};

export default nextConfig;
