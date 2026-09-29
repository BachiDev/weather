import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// React Testing Library only auto-registers cleanup when test-framework
// globals exist (we import from "vitest" explicitly, so it doesn't).
// Without this, renders leak across tests in the same file.
afterEach(() => {
  cleanup();
});
