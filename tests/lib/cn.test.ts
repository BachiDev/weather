import { describe, expect, it } from "vitest";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("joins truthy class parts", () => {
    expect(cn("a", false, "b", null, undefined, "c")).toBe("a b c");
    expect(cn()).toBe("");
  });
});
