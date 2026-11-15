import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useInfiniteScroll } from './useInfiniteScroll.js';

function TestSentinel({ onIntersect, enabled = true }) {
  const sentinelRef = useInfiniteScroll({ onIntersect, enabled });
  return <div ref={sentinelRef} data-testid="sentinel-element" />;
}

describe('useInfiniteScroll hook [CORE][UX+]', () => {
  beforeEach(() => {
    window.IntersectionObserver.instances = [];
  });

  it('observes sentinel ref and calls onIntersect when target intersects', () => {
    const handleIntersect = vi.fn();

    render(<TestSentinel onIntersect={handleIntersect} enabled={true} />);

    // Get created observer instance
    const observer = window.IntersectionObserver.instances.at(-1);
    expect(observer).toBeDefined();

    // Trigger intersection
    observer.triggerIntersect(true);
    expect(handleIntersect).toHaveBeenCalledTimes(1);

    // Non-intersecting should not trigger
    observer.triggerIntersect(false);
    expect(handleIntersect).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onIntersect when enabled is false', () => {
    const handleIntersect = vi.fn();

    render(<TestSentinel onIntersect={handleIntersect} enabled={false} />);

    const observer = window.IntersectionObserver.instances.at(-1);
    if (observer) {
      observer.triggerIntersect(true);
    }

    expect(handleIntersect).not.toHaveBeenCalled();
  });

  it('disconnects observer on unmount', () => {
    const handleIntersect = vi.fn();

    const { unmount } = render(<TestSentinel onIntersect={handleIntersect} enabled={true} />);

    const observer = window.IntersectionObserver.instances.at(-1);
    expect(observer).toBeDefined();
    const disconnectSpy = vi.spyOn(observer, 'disconnect');

    unmount();

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });
});
