import { useEffect, useRef } from 'react';
import { OBSERVER_ROOT_MARGIN, OBSERVER_THRESHOLD } from '../constants/gallery.js';

export function useInfiniteScroll({
  onIntersect,
  enabled = true,
  rootMargin = OBSERVER_ROOT_MARGIN,
  threshold = OBSERVER_THRESHOLD,
}) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onIntersect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [onIntersect, enabled, rootMargin, threshold]);

  return sentinelRef;
}
