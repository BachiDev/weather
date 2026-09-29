import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CommandPalette } from "@/components/CommandPalette";
import { DEFAULT_CITY } from "@/lib/defaultCity";

const graz = {
  ...DEFAULT_CITY,
  id: 2,
  name: "Graz",
  label: "Graz, Styria, Austria",
};

describe("CommandPalette", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <CommandPalette
        open={false}
        current={DEFAULT_CITY}
        recents={[graz]}
        onSelect={() => {}}
        onClose={() => {}}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("lists current + recents and selects on click", () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <CommandPalette
        open
        current={DEFAULT_CITY}
        recents={[graz, DEFAULT_CITY]}
        onSelect={onSelect}
        onClose={onClose}
      />,
    );
    // Current city listed once (dedupe), recent listed, dialog labelled.
    expect(
      screen.getByRole("dialog", { name: "Quick switch city" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Vienna, Wien, Austria")).toHaveLength(1);
    expect(screen.getByText("Graz, Styria, Austria")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Graz, Styria, Austria"));
    expect(onSelect).toHaveBeenCalledWith(graz);
    expect(onClose).toHaveBeenCalled();
  });

  it("filters by query and closes on Escape", () => {
    const onClose = vi.fn();
    render(
      <CommandPalette
        open
        current={DEFAULT_CITY}
        recents={[graz]}
        onSelect={() => {}}
        onClose={onClose}
      />,
    );
    fireEvent.change(screen.getByLabelText("Filter cities"), {
      target: { value: "graz" },
    });
    expect(screen.queryByText("Vienna, Wien, Austria")).not.toBeInTheDocument();
    expect(screen.getByText("Graz, Styria, Austria")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
