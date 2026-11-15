import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorState from "./ErrorState";

describe("ErrorState Component", () => {
  it("renders with role='alert' for screen reader accessibility", () => {
    render(<ErrorState message="Network error occurred" onRetry={vi.fn()} />);
    const alertBox = screen.getByRole("alert");
    expect(alertBox).toBeInTheDocument();
  });

  it("displays the provided error message", () => {
    const customMessage = "Failed to fetch page 2 items";
    render(<ErrorState message={customMessage} onRetry={vi.fn()} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it("renders a retry button with accessible label and calls onRetry when clicked", () => {
    const handleRetry = vi.fn();
    render(<ErrorState message="Something went wrong" onRetry={handleRetry} />);
    const button = screen.getByRole("button", { name: /try again/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
