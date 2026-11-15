import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchPhotos } from './fetchPhotos.js';
import { PICSUM_BASE_URL, DEFAULT_PAGE_LIMIT } from '../constants/gallery.js';

describe('fetchPhotos utility [CORE][SECURITY]', () => {
  const mockValidPhotos = [
    {
      id: '0',
      author: 'Alejandro Escamilla',
      width: 5616,
      height: 3744,
      url: 'https://unsplash.com/photos/yC-YDelHvfQ',
      download_url: 'https://picsum.photos/id/0/5616/3744',
    },
    {
      id: '1',
      author: 'Alejandro Escamilla',
      width: 5616,
      height: 3744,
      url: 'https://unsplash.com/photos/LNRyGwIJr5c',
      download_url: 'https://picsum.photos/id/1/5616/3744',
    },
  ];

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches from correct URL with pagination parameters and returns validated photos', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockValidPhotos,
    });

    const result = await fetchPhotos({ page: 2, limit: 10 });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const calledUrl = global.fetch.mock.calls[0][0];
    expect(calledUrl).toBe(`${PICSUM_BASE_URL}?page=2&limit=10`);

    expect(result).toEqual(mockValidPhotos);
  });

  it('uses default page and limit when omitted', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockValidPhotos,
    });

    await fetchPhotos();

    const calledUrl = global.fetch.mock.calls[0][0];
    expect(calledUrl).toBe(`${PICSUM_BASE_URL}?page=1&limit=${DEFAULT_PAGE_LIMIT}`);
  });

  it('passes AbortSignal to fetch request', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockValidPhotos,
    });

    const controller = new AbortController();
    await fetchPhotos({ page: 1, limit: 10, signal: controller.signal });

    const calledOptions = global.fetch.mock.calls[0][1];
    expect(calledOptions.signal).toBe(controller.signal);
  });

  it('rejects when HTTP status is not ok (e.g. 500 error)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(fetchPhotos({ page: 1 })).rejects.toThrow(/server responded with status 500/i);
  });

  it('rejects when network fetch throws a TypeError / drop', async () => {
    global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(fetchPhotos({ page: 1 })).rejects.toThrow(/failed to fetch/i);
  });

  it('rejects and validates against malformed JSON or schema violations', async () => {
    const invalidPayload = [
      {
        id: '99',
        author: '', // Invalid: empty author
        width: 100,
        height: 100,
        url: 'https://unsplash.com',
        download_url: 'https://evil-site.com/image.jpg', // Invalid: untrusted domain
      },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => invalidPayload,
    });

    await expect(fetchPhotos({ page: 1 })).rejects.toThrow(/feed validation failed/i);
  });
});
