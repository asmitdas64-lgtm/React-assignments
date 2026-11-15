import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GalleryProvider } from '../../context/GalleryContext.jsx';
import { GalleryFeed } from './GalleryFeed.jsx';
import * as fetchModule from '../../utils/fetchPhotos.js';
import { UI_TEXT } from '../../constants/gallery.js';

describe('GalleryFeed Component [CORE][UX+]', () => {
  const page1Photos = [
    {
      id: '0',
      author: 'Alejandro Escamilla',
      width: 500,
      height: 300,
      url: 'https://unsplash.com',
      download_url: 'https://picsum.photos/id/0/500/300',
    },
    {
      id: '1',
      author: 'Paul Jarvis',
      width: 500,
      height: 300,
      url: 'https://unsplash.com',
      download_url: 'https://picsum.photos/id/1/500/300',
    },
  ];

  const page2Photos = [
    {
      id: '2',
      author: 'Danielle MacInnes',
      width: 500,
      height: 300,
      url: 'https://unsplash.com',
      download_url: 'https://picsum.photos/id/2/500/300',
    },
  ];

  beforeEach(() => {
    window.IntersectionObserver.instances = [];
    vi.spyOn(fetchModule, 'fetchPhotos').mockResolvedValue(page1Photos);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial photos and bottom sentinel element', async () => {
    render(
      <GalleryProvider>
        <GalleryFeed />
      </GalleryProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/author:\s*alejandro escamilla/i)).toBeInTheDocument();
      expect(screen.getByText(/author:\s*paul jarvis/i)).toBeInTheDocument();
    });

    const sentinel = screen.getByTestId('infinite-scroll-sentinel');
    expect(sentinel).toBeInTheDocument();
  });

  it('pulls in data from the next page when sentinel intersects and appends items', async () => {
    render(
      <GalleryProvider>
        <GalleryFeed />
      </GalleryProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/author:\s*alejandro escamilla/i)).toBeInTheDocument();
    });

    // Mock next page fetch
    fetchModule.fetchPhotos.mockResolvedValueOnce(page2Photos);

    // Trigger intersection observer
    const observer = window.IntersectionObserver.instances.at(-1);
    expect(observer).toBeDefined();

    await act(async () => {
      observer.triggerIntersect(true);
    });

    // Verify all 3 photos are now rendered (appended without replacing)
    await waitFor(() => {
      expect(screen.getByText(/author:\s*danielle macinnes/i)).toBeInTheDocument();
      expect(screen.getByText(/author:\s*alejandro escamilla/i)).toBeInTheDocument();
      expect(screen.getByText(/author:\s*paul jarvis/i)).toBeInTheDocument();
    });
  });

  it('displays end of gallery notification when hasMore is false', async () => {
    // Initial fetch returns page 1
    render(
      <GalleryProvider>
        <GalleryFeed />
      </GalleryProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/author:\s*alejandro escamilla/i)).toBeInTheDocument();
    });

    // Next fetch returns empty array representing end of feed
    fetchModule.fetchPhotos.mockResolvedValueOnce([]);

    const observer = window.IntersectionObserver.instances.at(-1);
    await act(async () => {
      observer.triggerIntersect(true);
    });

    await waitFor(() => {
      expect(screen.getByText(UI_TEXT.END_OF_FEED)).toBeInTheDocument();
    });

    // Sentinel element is removed when hasMore is false
    expect(screen.queryByTestId('infinite-scroll-sentinel')).not.toBeInTheDocument();
  });
});
