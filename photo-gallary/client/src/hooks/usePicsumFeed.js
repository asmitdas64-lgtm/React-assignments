import { useEffect, useRef, useCallback } from 'react';
import { useGallery } from '../context/useGallery.js';
import { fetchPhotos } from '../utils/fetchPhotos.js';
import { DEFAULT_PAGE_LIMIT } from '../constants/gallery.js';

export function usePicsumFeed() {
  const {
    photos,
    page,
    isLoading,
    isInitialLoading,
    hasMore,
    error,
    fetchStart,
    fetchSuccess,
    fetchError,
  } = useGallery();

  const inFlightRef = useRef(false);

  // Load a specific page with concurrency & deduplication guard
  const loadPage = useCallback(
    async (pageToLoad, signal) => {
      if (inFlightRef.current || !hasMore) return;

      inFlightRef.current = true;
      fetchStart();

      try {
        const newPhotos = await fetchPhotos({
          page: pageToLoad,
          limit: DEFAULT_PAGE_LIMIT,
          signal,
        });
        fetchSuccess(newPhotos);
      } catch (err) {
        if (err.name !== 'AbortError') {
          fetchError(err.message);
        }
      } finally {
        inFlightRef.current = false;
      }
    },
    [hasMore, fetchStart, fetchSuccess, fetchError]
  );

  // Load next page helper
  const loadNextPage = useCallback(() => {
    if (!isLoading && hasMore) {
      loadPage(page);
    }
  }, [isLoading, hasMore, loadPage, page]);

  // Retry failed page
  const retry = useCallback(() => {
    loadPage(page);
  }, [loadPage, page]);

  // Initial mount load if photos array is empty
  useEffect(() => {
    const controller = new AbortController();

    if (photos.length === 0 && !inFlightRef.current) {
      loadPage(1, controller.signal);
    }

    return () => {
      controller.abort();
    };
  }, [photos.length, loadPage]);

  return {
    photos,
    page,
    isLoading,
    isInitialLoading,
    hasMore,
    error,
    loadNextPage,
    retry,
  };
}
