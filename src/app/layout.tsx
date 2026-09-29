import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "./ThemeRegistry";
import { Header } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://bachidev.github.io/weather";
const description =
  "Current conditions, 7-day outlook and 24-hour forecast for any city worldwide. Built with Next.js, TypeScript and the free Open-Meteo API.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Weather Dashboard · Fabian Bachmayer",
    template: "%s · Weather Dashboard",
  },
  description,
  authors: [{ name: "Fabian Bachmayer", url: "https://bachi.dev" }],
  keywords: [
    "weather dashboard",
    "Open-Meteo",
    "Next.js",
    "TypeScript",
    "Fabian Bachmayer",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Weather Dashboard",
    title: "Weather Dashboard · Fabian Bachmayer",
    description,
    images: [
      {
        url: "/og-cover.png",
        width: 1200,
        height: 630,
        alt: "Weather Dashboard — 7-day outlook, 24-hour forecast",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Weather Dashboard · Fabian Bachmayer",
    description,
    images: ["/og-cover.png"],
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Weather Dashboard",
  url: siteUrl,
  applicationCategory: "WeatherApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0" },
  author: {
    "@type": "Person",
    name: "Fabian Bachmayer",
    url: "https://bachi.dev",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ThemeRegistry>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </ThemeRegistry>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
