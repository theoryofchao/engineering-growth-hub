import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HealthStatus } from "./health-status";

describe("HealthStatus", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows loading state before the response resolves", () => {
    (fetch as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

    render(<HealthStatus />);

    expect(screen.getByRole("status")).toHaveTextContent("Checking API connectivity");
  });

  it("renders health details on a successful response", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "ok",
        service: "engineering-growth-hub-api",
        database: "ok",
      }),
    });

    render(<HealthStatus />);

    await waitFor(() => expect(screen.getByText(/API reachable/)).toBeInTheDocument());
    expect(screen.getByText("engineering-growth-hub-api", { exact: false })).toBeInTheDocument();
  });

  it("renders an error state when the API is unreachable", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Failed to fetch"));

    render(<HealthStatus />);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Could not reach the API."),
    );
  });
});
