import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SunArc } from "@/components/SunArc";

describe("SunArc", () => {
  it("shows a live dot for today", () => {
    const { container } = render(
      <SunArc
        sunrise="2026-09-29T07:00"
        sunset="2026-09-29T19:00"
        nowIso="2026-09-29T13:00"
        hourFormat="24h"
      />,
    );
    expect(container.querySelectorAll("circle")).toHaveLength(2); // glow + dot
    expect(
      screen.getByRole("img", { name: /across the sky/ }),
    ).toBeInTheDocument();
  });

  it("shows drilled-day times without a dot", () => {
    const { container } = render(
      <SunArc
        sunrise="2026-10-02T07:05"
        sunset="2026-10-02T18:55"
        nowIso="2026-09-29T13:00"
        hourFormat="24h"
        dayLabel="Fri, Oct 2"
      />,
    );
    expect(container.querySelectorAll("circle")).toHaveLength(0);
    expect(
      screen.getByRole("img", { name: "Sun path · Fri, Oct 2" }),
    ).toBeInTheDocument();
    expect(screen.getByText("07:05")).toBeInTheDocument();
  });
});
