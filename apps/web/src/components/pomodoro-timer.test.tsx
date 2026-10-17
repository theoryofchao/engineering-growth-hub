import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PomodoroTimer } from "./pomodoro-timer";

function jsonResponse(body: unknown, ok = true) {
  return Promise.resolve({ ok, status: ok ? 200 : 400, json: async () => body });
}

function activeSession(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    learning_session_id: 42,
    mode_minutes: 25,
    break_minutes: 5,
    status: "active",
    elapsed_seconds: 0,
    completed_at: null,
    ...overrides,
  };
}

describe("PomodoroTimer", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(window.localStorage.__proto__, "getItem").mockReturnValue(null);
    vi.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {});
    vi.spyOn(window.localStorage.__proto__, "removeItem").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows a start button when no session is stored", async () => {
    render(<PomodoroTimer learningSessionId={42} modeMinutes={25} />);

    await waitFor(() =>
      expect(screen.getByText("Start 25-min session")).toBeInTheDocument(),
    );
  });

  it("starts a session and shows the running timer", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockImplementation(() =>
      jsonResponse(activeSession()),
    );

    render(<PomodoroTimer learningSessionId={42} modeMinutes={25} />);

    await waitFor(() =>
      expect(screen.getByText("Start 25-min session")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("Start 25-min session"));

    await waitFor(() => expect(screen.getByText("Pause")).toBeInTheDocument());
    expect(screen.getByText("0:00")).toBeInTheDocument();
  });

  it("restores an in-progress session from localStorage", async () => {
    (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue("7");
    (fetch as ReturnType<typeof vi.fn>).mockImplementation(() =>
      jsonResponse(activeSession({ id: 7, status: "paused", elapsed_seconds: 42 })),
    );

    render(<PomodoroTimer learningSessionId={42} modeMinutes={25} />);

    await waitFor(() => expect(screen.getByText("0:42")).toBeInTheDocument());
    expect(screen.getByText("Resume")).toBeInTheDocument();
  });

  it("pauses a running session", async () => {
    (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue("7");
    const fetchMock = fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockImplementationOnce(() =>
      jsonResponse(activeSession({ id: 7, elapsed_seconds: 10 })),
    );

    render(<PomodoroTimer learningSessionId={42} modeMinutes={25} />);

    await waitFor(() => expect(screen.getByText("Pause")).toBeInTheDocument());

    fetchMock.mockImplementationOnce(() =>
      jsonResponse(
        activeSession({ id: 7, status: "paused", elapsed_seconds: 10 }),
      ),
    );
    fireEvent.click(screen.getByText("Pause"));

    await waitFor(() => expect(screen.getByText("Resume")).toBeInTheDocument());
  });

  it("renders as a fixed-position floating widget, not inline page content", async () => {
    render(<PomodoroTimer learningSessionId={42} modeMinutes={25} />);

    await waitFor(() =>
      expect(screen.getByText("Start 25-min session")).toBeInTheDocument(),
    );

    const widget = screen.getByText("Start 25-min session").closest("div.fixed");
    expect(widget).not.toBeNull();
    expect(widget).toHaveClass("fixed");
  });

  it("shows a completion summary after finishing", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === "PATCH") {
        return jsonResponse(
          activeSession({ status: "completed", elapsed_seconds: 15, completed_at: "now" }),
        );
      }
      return jsonResponse(activeSession({ elapsed_seconds: 15 }));
    });

    render(<PomodoroTimer learningSessionId={42} modeMinutes={25} />);

    await waitFor(() =>
      expect(screen.getByText("Start 25-min session")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByText("Start 25-min session"));

    await waitFor(() => expect(screen.getByText("Finish session")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Finish session"));

    await waitFor(() =>
      expect(screen.getByText(/Session complete/)).toBeInTheDocument(),
    );
  });
});
