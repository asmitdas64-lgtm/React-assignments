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
    async (pageToLoad) => {
      if (inFlightRef.current || !hasMore) return;

      inFlightRef.current = true;
      fetchStart();

      try {
        const newPhotos = await fetchPhotos({
          page: pageToLoad,
          limit: DEFAULT_PAGE_LIMIT,
        });
        fetchSuccess(newPhotos);
      } catch (err) {
        fetchError(err.message);
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
    if (photos.length === 0) {
      loadPage(1);
    }
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
