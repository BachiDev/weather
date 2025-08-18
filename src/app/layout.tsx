import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "./ThemeRegistry";
import { Fab, Box } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Weather",
  description: "A modern weather dashboard built with Next.js and Open-Meteo API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
        <Box sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}>
          <Fab
            aria-label="GitHub repository"
            href="https://github.com/BachiDev/weather"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              backgroundColor: 'rgba(33, 33, 33, 0.7)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(43, 43, 43, 0.7)',
              },
            }}
          >
            <GitHubIcon />
          </Fab>
        </Box>
      </body>
    </html>
  );
}