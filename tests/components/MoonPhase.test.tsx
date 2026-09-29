import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MoonPhase } from "@/components/MoonPhase";
import { SYNODIC_MONTH_DAYS } from "@/lib/moon";

const DAY_MS = 86_400_000;
const REF_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0);
const FULL_MOON = REF_NEW_MOON + (SYNODIC_MONTH_DAYS / 2) * DAY_MS;

describe("MoonPhase", () => {
  it("renders tonight after mount", async () => {
    render(<MoonPhase />);
    await waitFor(() =>
      expect(screen.queryByText("Loading moon phase")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Moon")).toBeInTheDocument();
  });

  it("renders a deterministic phase for a drilled-down day", async () => {
    render(<MoonPhase dateMs={FULL_MOON} dayLabel="Mon, Sep 28" />);
    await waitFor(() =>
      expect(screen.getByText("Full Moon")).toBeInTheDocument(),
    );
    expect(screen.getByText("Moon · Mon, Sep 28")).toBeInTheDocument();
    expect(screen.getByText(/100% lit/)).toBeInTheDocument();
  });
});
