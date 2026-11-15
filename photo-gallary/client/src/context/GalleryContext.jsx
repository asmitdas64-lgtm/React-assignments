import { useReducer, useMemo, useCallback } from 'react';
import { GalleryContext } from './galleryContextDef.js';
import { galleryReducer, initialGalleryState } from './galleryReducer.js';

export function GalleryProvider({ children, initialPhotos = [] }) {
  const [state, dispatch] = useReducer(galleryReducer, {
    ...initialGalleryState,
    photos: initialPhotos.length > 0 ? initialPhotos : initialGalleryState.photos,
    isInitialLoading: initialPhotos.length === 0,
  });

  const likePhoto = useCallback((photoId) => {
    dispatch({ type: 'LIKE_INCREMENTED', payload: { photoId } });
  }, []);

  const fetchStart = useCallback(() => {
    dispatch({ type: 'FETCH_START' });
  }, []);

  const fetchSuccess = useCallback((photos) => {
    dispatch({ type: 'FETCH_SUCCESS', payload: { photos } });
  }, []);

  const fetchError = useCallback((error) => {
    dispatch({ type: 'FETCH_ERROR', payload: { error } });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      likePhoto,
      fetchStart,
      fetchSuccess,
      fetchError,
    }),
    [state, likePhoto, fetchStart, fetchSuccess, fetchError]
  );

  return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>;
}
