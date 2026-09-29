"use client";

import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// MUI theme aligned with the bachi.dev tokens (globals.css):
// Inter body font, violet primary, zinc-950/zinc-900 surfaces.
//
// AppRouterCacheProvider is required under the App Router: without it,
// Emotion injects styles differently on server vs client and React throws
// a hydration mismatch (server `<style data-emotion>` vs client content).
export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: "dark",
          primary: {
            main: "#a78bfa",
            light: "#c4b5fd",
            dark: "#7c3aed",
          },
          background: {
            default: "#09090b",
            paper: "#18181b",
          },
        },
        typography: {
          fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
        },
      }),
    [],
  );

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
