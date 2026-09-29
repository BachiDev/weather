import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WeatherIcon } from "@/components/WeatherIcon";

describe("WeatherIcon", () => {
  it("renders a decorative svg", () => {
    const { container } = render(<WeatherIcon code={0} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  it("exposes the description for screen readers when labelled", () => {
    render(<WeatherIcon code={95} size={32} label="Thunderstorm" />);
    expect(
      screen.getByRole("img", { name: "Thunderstorm" }),
    ).toBeInTheDocument();
  });
});
