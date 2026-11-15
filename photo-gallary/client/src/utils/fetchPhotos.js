import {
  PICSUM_BASE_URL,
  DEFAULT_PAGE,
  DEFAULT_PAGE_LIMIT,
} from '../constants/gallery.js';
import { photoFeedSchema } from '../validation/schemas.js';

export async function fetchPhotos({
  page = DEFAULT_PAGE,
  limit = DEFAULT_PAGE_LIMIT,
  signal,
} = {}) {
  const url = new URL(PICSUM_BASE_URL);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));

  let response;
  try {
    response = await fetch(url.toString(), {
      signal,
      headers: {
        Accept: 'application/json',
      },
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err;
    }
    throw new Error(`Failed to fetch photographs: ${err.message}`);
  }

  if (!response.ok) {
    throw new Error(
      `Server responded with status ${response.status}: ${response.statusText || 'Fetch error'}`
    );
  }

  const json = await response.json();
  const parseResult = photoFeedSchema.safeParse(json);

  if (!parseResult.success) {
    throw new Error(
      `Photo feed validation failed: ${parseResult.error.issues.map((i) => i.message).join(', ')}`
    );
  }

  return parseResult.data;
}
