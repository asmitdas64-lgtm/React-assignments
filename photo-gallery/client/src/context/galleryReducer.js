// Initial state contract
export const initialGalleryState = {
  photos: [],
  likesByPhotoId: {},
  page: 1,
  isLoading: false,
  isInitialLoading: true,
  error: null,
  hasMore: true,
};

// Forbidden keys for prototype-pollution defense
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function galleryReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START': {
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    }

    case 'FETCH_SUCCESS': {
      const incomingPhotos = action.payload?.photos || [];
      const hasMore = incomingPhotos.length > 0;

      // Deduplicate incoming photos against existing items by id
      const existingIds = new Set(state.photos.map((p) => p.id));
      const uniqueNewPhotos = incomingPhotos.filter((p) => !existingIds.has(p.id));

      return {
        ...state,
        photos: [...state.photos, ...uniqueNewPhotos],
        page: state.page + 1,
        isLoading: false,
        isInitialLoading: false,
        error: null,
        hasMore,
      };
    }

    case 'FETCH_ERROR': {
      return {
        ...state,
        isLoading: false,
        isInitialLoading: false,
        error: action.payload?.error || 'Failed to load photographs',
      };
    }

    case 'LIKE_INCREMENTED': {
      const photoId = action.payload?.photoId;

      // Prototype pollution defense
      if (!photoId || FORBIDDEN_KEYS.has(photoId)) {
        return state;
      }

      const currentLikes = state.likesByPhotoId[photoId] || 0;

      return {
        ...state,
        likesByPhotoId: {
          ...state.likesByPhotoId,
          [photoId]: currentLikes + 1,
        },
      };
    }

    default:
      return state;
  }
}
