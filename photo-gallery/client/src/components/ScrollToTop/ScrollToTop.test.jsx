import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ScrollToTop from "./ScrollToTop";

describe("ScrollToTop Component", () => {
  const originalScrollTo = window.scrollTo;

  beforeEach(() => {
    window.scrollY = 0;
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    window.scrollTo = originalScrollTo;
  });

  it("is not visible when scroll position is at the top (scrollY <= 400)", () => {
    render(<ScrollToTop />);
    expect(screen.queryByRole("button", { name: /back to top/i })).toBeNull();
  });

  it("becomes visible when scroll position exceeds threshold (scrollY > 400)", () => {
    render(<ScrollToTop />);
    expect(screen.queryByRole("button", { name: /back to top/i })).toBeNull();

    window.scrollY = 450;
    fireEvent.scroll(window);
    expect(screen.getByRole("button", { name: /back to top/i })).toBeInTheDocument();
  });

  it("smoothly scrolls to top when clicked", () => {
    window.scrollY = 500;
    render(<ScrollToTop />);
    fireEvent.scroll(window);

    const button = screen.getByRole("button", { name: /back to top/i });
    fireEvent.click(button);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  it("removes scroll event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<ScrollToTop />);
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });
});
