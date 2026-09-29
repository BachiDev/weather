import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DayCard } from "@/components/DayCard";

const props = {
  date: "2026-09-29",
  code: 61,
  max: 20,
  min: 12,
  sunrise: "2026-09-29T07:00",
  sunset: "2026-09-29T19:00",
  precipProbability: 40,
  windMax: 16,
  tempUnit: "c" as const,
};

describe("DayCard", () => {
  it("renders wind in km/h by default", () => {
    render(<DayCard {...props} speedUnit="kmh" hourFormat="12h" />);
    expect(screen.getByText("16 km/h")).toBeInTheDocument();
  });

  it("converts wind to mph when selected (regression: stayed km/h)", () => {
    render(<DayCard {...props} speedUnit="mph" hourFormat="12h" />);
    expect(screen.getByText("10 mph")).toBeInTheDocument();
    expect(screen.queryByText("16 km/h")).not.toBeInTheDocument();
  });

  it("formats sun times in 24h mode", () => {
    render(<DayCard {...props} speedUnit="kmh" hourFormat="24h" />);
    expect(screen.getByText("07:00")).toBeInTheDocument();
    expect(screen.getByText("19:00")).toBeInTheDocument();
  });

  it("marks the drilled-down day as pressed and fires onSelect", () => {
    const onSelect = vi.fn();
    render(
      <DayCard
        {...props}
        speedUnit="kmh"
        hourFormat="24h"
        selected={false}
        onSelect={onSelect}
      />,
    );
    const button = screen.getByRole("button", { name: /Show hourly forecast/ });
    expect(button).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("shows the pressed state when selected", () => {
    render(
      <DayCard
        {...props}
        speedUnit="kmh"
        hourFormat="24h"
        selected
        onSelect={() => {}}
      />,
    );
    expect(
      screen.getByRole("button", { name: /Show hourly forecast/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
