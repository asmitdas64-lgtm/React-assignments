import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GalleryProvider } from '../context/GalleryContext.jsx';
import { usePicsumFeed } from './usePicsumFeed.js';
import * as fetchModule from '../utils/fetchPhotos.js';

describe('usePicsumFeed hook [CORE][SECURITY]', () => {
  const mockBatchPage1 = [
    {
      id: '0',
      author: 'Alejandro Escamilla',
      width: 500,
      height: 300,
      url: 'https://unsplash.com',
      download_url: 'https://picsum.photos/id/0/500/300',
    },
  ];

  const mockBatchPage2 = [
    {
      id: '1',
      author: 'Paul Jarvis',
      width: 500,
      height: 300,
      url: 'https://unsplash.com',
      download_url: 'https://picsum.photos/id/1/500/300',
    },
  ];

  beforeEach(() => {
    vi.spyOn(fetchModule, 'fetchPhotos').mockResolvedValue(mockBatchPage1);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }) => <GalleryProvider>{children}</GalleryProvider>;

  it('triggers initial page 1 fetch on mount when photos list is empty', async () => {
    const { result } = renderHook(() => usePicsumFeed(), { wrapper });

    await waitFor(() => {
      expect(result.current.photos).toHaveLength(1);
    });

    expect(fetchModule.fetchPhotos).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1 })
    );
    expect(result.current.photos[0].author).toBe('Alejandro Escamilla');
    expect(result.current.page).toBe(2);
  });

  it('fetches next page when loadNextPage is called', async () => {
    const { result } = renderHook(() => usePicsumFeed(), { wrapper });

    await waitFor(() => {
      expect(result.current.photos).toHaveLength(1);
    });

    fetchModule.fetchPhotos.mockResolvedValueOnce(mockBatchPage2);

    await act(async () => {
      result.current.loadNextPage();
    });

    await waitFor(() => {
      expect(result.current.photos).toHaveLength(2);
    });

    expect(result.current.photos[1].author).toBe('Paul Jarvis');
    expect(result.current.page).toBe(3);
  });

  it('stores error and allows retry when fetch fails', async () => {
    fetchModule.fetchPhotos.mockRejectedValueOnce(new Error('Network drop'));

    const { result } = renderHook(() => usePicsumFeed(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBe('Network drop');
    });

    // Mock recovery for retry
    fetchModule.fetchPhotos.mockResolvedValueOnce(mockBatchPage1);

    await act(async () => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.photos).toHaveLength(1);
    });
  });
});
