import { describe, it, expect } from 'vitest';
import {
  galleryReducer,
  initialGalleryState,
} from './galleryReducer.js';

describe('galleryReducer [CORE]', () => {
  it('returns initial state for unknown action type', () => {
    const state = galleryReducer(initialGalleryState, { type: 'UNKNOWN_ACTION' });
    expect(state).toBe(initialGalleryState);
  });

  describe('FETCH_START', () => {
    it('sets isLoading to true and resets error to null', () => {
      const prevState = {
        ...initialGalleryState,
        isLoading: false,
        error: 'Previous network failure',
      };

      const nextState = galleryReducer(prevState, { type: 'FETCH_START' });

      expect(nextState.isLoading).toBe(true);
      expect(nextState.error).toBeNull();
    });
  });

  describe('FETCH_SUCCESS', () => {
    const mockPhotosPage1 = [
      { id: '1', author: 'Alejandro Escamilla', download_url: 'https://picsum.photos/id/1/240/160' },
      { id: '2', author: 'Paul Jarvis', download_url: 'https://picsum.photos/id/2/240/160' },
    ];

    const mockPhotosPage2 = [
      { id: '3', author: 'Danielle MacInnes', download_url: 'https://picsum.photos/id/3/240/160' },
    ];

    it('appends new photos to existing list, increments page, and resets loading flags', () => {
      const prevState = {
        ...initialGalleryState,
        photos: mockPhotosPage1,
        page: 1,
        isLoading: true,
        isInitialLoading: true,
      };

      const nextState = galleryReducer(prevState, {
        type: 'FETCH_SUCCESS',
        payload: { photos: mockPhotosPage2 },
      });

      expect(nextState.photos).toHaveLength(3);
      expect(nextState.photos).toEqual([...mockPhotosPage1, ...mockPhotosPage2]);
      expect(nextState.page).toBe(2);
      expect(nextState.isLoading).toBe(false);
      expect(nextState.isInitialLoading).toBe(false);
      expect(nextState.hasMore).toBe(true);
      expect(nextState.error).toBeNull();
    });

    it('deduplicates incoming items by id', () => {
      const prevState = {
        ...initialGalleryState,
        photos: mockPhotosPage1,
        page: 1,
      };

      // Payload includes photo with id: '2' which already exists in mockPhotosPage1
      const duplicatePayload = [
        { id: '2', author: 'Paul Jarvis', download_url: 'https://picsum.photos/id/2/240/160' },
        { id: '3', author: 'Danielle MacInnes', download_url: 'https://picsum.photos/id/3/240/160' },
      ];

      const nextState = galleryReducer(prevState, {
        type: 'FETCH_SUCCESS',
        payload: { photos: duplicatePayload },
      });

      expect(nextState.photos).toHaveLength(3);
      expect(nextState.photos.map((p) => p.id)).toEqual(['1', '2', '3']);
    });

    it('sets hasMore to false when receiving an empty photo array', () => {
      const prevState = {
        ...initialGalleryState,
        photos: mockPhotosPage1,
        page: 3,
        hasMore: true,
      };

      const nextState = galleryReducer(prevState, {
        type: 'FETCH_SUCCESS',
        payload: { photos: [] },
      });

      expect(nextState.hasMore).toBe(false);
      expect(nextState.photos).toEqual(mockPhotosPage1);
    });
  });

  describe('FETCH_ERROR', () => {
    it('sets error message and resets loading flags', () => {
      const prevState = {
        ...initialGalleryState,
        isLoading: true,
        isInitialLoading: true,
        error: null,
      };

      const nextState = galleryReducer(prevState, {
        type: 'FETCH_ERROR',
        payload: { error: 'Network error occurred' },
      });

      expect(nextState.isLoading).toBe(false);
      expect(nextState.isInitialLoading).toBe(false);
      expect(nextState.error).toBe('Network error occurred');
    });
  });

  describe('LIKE_INCREMENTED', () => {
    it('initializes count to 1 when photo has not been liked yet', () => {
      const prevState = {
        ...initialGalleryState,
        likesByPhotoId: {},
      };

      const nextState = galleryReducer(prevState, {
        type: 'LIKE_INCREMENTED',
        payload: { photoId: '10' },
      });

      expect(nextState.likesByPhotoId['10']).toBe(1);
    });

    it('increments count on subsequent clicks for the same photo', () => {
      const prevState = {
        ...initialGalleryState,
        likesByPhotoId: { '10': 3, '11': 0 },
      };

      const nextState = galleryReducer(prevState, {
        type: 'LIKE_INCREMENTED',
        payload: { photoId: '10' },
      });

      expect(nextState.likesByPhotoId['10']).toBe(4);
      expect(nextState.likesByPhotoId['11']).toBe(0); // Unrelated photos are unchanged
    });

    it('defends against prototype pollution keys', () => {
      const prevState = {
        ...initialGalleryState,
        likesByPhotoId: {},
      };

      const nextState1 = galleryReducer(prevState, {
        type: 'LIKE_INCREMENTED',
        payload: { photoId: '__proto__' },
      });
      const nextState2 = galleryReducer(prevState, {
        type: 'LIKE_INCREMENTED',
        payload: { photoId: 'constructor' },
      });

      // State is protected; Object prototype is unpolluted
      expect(Object.prototype.polluted).toBeUndefined();
      expect(nextState1).toBe(prevState); // safely ignored
      expect(nextState2).toBe(prevState); // safely ignored
    });
  });
});
