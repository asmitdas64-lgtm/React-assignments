// Shared constants for Photo Gallery.
// Copy this file UNCHANGED to:
//   - client/src/constants/gallery.js (Phase 0)

// Picsum API configuration
export const PICSUM_BASE_URL = "https://picsum.photos/v2/list";
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_LIMIT = 10;
export const MAX_ALLOWED_PAGES = 100; // anti-abuse runaway loop safeguard

// Infinite Scroll Observer config
export const OBSERVER_ROOT_MARGIN = "250px"; // Trigger fetch 250px before user hits absolute bottom
export const OBSERVER_THRESHOLD = 0.1;

// Image dimensions from reference image (thumbnail layout)
export const THUMBNAIL_WIDTH = 240; // px
export const THUMBNAIL_HEIGHT = 160; // px
export const THUMBNAIL_ASPECT_RATIO = "3 / 2";

// Animation & Interaction timings
export const LIKE_POP_DURATION_MS = 300;
export const SKELETON_ITEMS_COUNT = 5;

// Fallback seed photos for offline mode / offline testing
export const SEED_PHOTOS = [
  {
    id: "0",
    author: "Alejandro Escamilla",
    width: 5616,
    height: 3744,
    url: "https://unsplash.com/photos/yC-YDelHvfQ",
    download_url: "https://picsum.photos/id/0/5616/3744",
  },
  {
    id: "1",
    author: "Alejandro Escamilla",
    width: 5616,
    height: 3744,
    url: "https://unsplash.com/photos/LNRyGwIJr5c",
    download_url: "https://picsum.photos/id/1/5616/3744",
  },
  {
    id: "2",
    author: "Alejandro Escamilla",
    width: 5616,
    height: 3744,
    url: "https://unsplash.com/photos/N7XodRrbzS0",
    download_url: "https://picsum.photos/id/2/5616/3744",
  },
  {
    id: "3",
    author: "Alejandro Escamilla",
    width: 5616,
    height: 3744,
    url: "https://unsplash.com/photos/Dl6jeyfihLk",
    download_url: "https://picsum.photos/id/3/5616/3744",
  },
  {
    id: "4",
    author: "Alejandro Escamilla",
    width: 5616,
    height: 3744,
    url: "https://unsplash.com/photos/y83smtlcijI",
    download_url: "https://picsum.photos/id/4/5616/3744",
  },
];

// Helper: generate responsive/optimized Picsum URL (e.g. 240x160 rather than raw 5000px download)
export const getOptimizedImageUrl = (downloadUrl, targetWidth = THUMBNAIL_WIDTH, targetHeight = THUMBNAIL_HEIGHT) => {
  if (!downloadUrl || typeof downloadUrl !== "string") return "";
  // Picsum URL format: https://picsum.photos/id/{id}/{origWidth}/{origHeight}
  const match = downloadUrl.match(/^https:\/\/picsum\.photos\/id\/(\d+)\/\d+\/\d+$/);
  if (match) {
    const id = match[1];
    return `https://picsum.photos/id/${id}/${targetWidth}/${targetHeight}`;
  }
  return downloadUrl;
};

// UI text constants matching reference layout
export const UI_TEXT = {
  APP_TITLE: "Photo gallery",
  AUTHOR_PREFIX: "Author: ",
  LOADING_MORE: "Loading more photographs…",
  END_OF_FEED: "You have reached the end of the gallery.",
  ERROR_FETCH: "Failed to load photographs. Please check your internet connection.",
  RETRY_BUTTON: "Try Again",
  SCROLL_TOP: "Back to top",
  LIKE_BUTTON_LABEL: (author, count) => `Thumbs up photo by ${author}. Currently ${count} likes`,
};
