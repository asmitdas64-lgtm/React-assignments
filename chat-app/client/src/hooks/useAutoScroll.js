import { useEffect, useRef } from 'react';

/**
 * Automatically scrolls container to bottom when dependency changes
 * or when new messages arrive.
 */
export function useAutoScroll(dependency) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [dependency]);

  return scrollRef;
}
