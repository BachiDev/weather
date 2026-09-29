import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Weather Dashboard — Fabian Bachmayer",
    short_name: "Weather",
    description:
      "Current conditions, 7-day outlook and 24-hour forecast for any city. Open-Meteo powered.",
    // Relative so it resolves under /weather on Pages and / in local dev.
    start_url: ".",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      {
        src: "icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
