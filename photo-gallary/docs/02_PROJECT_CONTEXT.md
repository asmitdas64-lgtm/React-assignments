# 02 · Project Context

> **Source of truth hierarchy:** `01_REQUIREMENTS_CHECKLIST.md` (what) → this file (how) → `03_UI_DESIGN_SPEC.md` (look) → `04_IMPLEMENTATION_PHASES.md` (order & TDD). If two files ever disagree, `01` wins.

---

## 1. Overview
A single-page **React Photo Gallery** application with infinite scroll, built for a UI Engineering Internship evaluation based on `photo-gallery.jpg`. The project ingests paginated JSON feeds from the Picsum Photos API, renders a 1-column feed of photographic articles with photo on the left and author + thumbs-up on the right, enables interactive thumbs-up counts using FontAwesome, and maintains production-grade web security and Test-Driven Development (TDD) discipline.

- **Brief's Basic Task [CORE]:** Single page application, 1-column view, Picsum paginated feeds (`page=1`, `page=2`, ...), infinite scroll bottom detection, render photo (`download_url`) and author, thumbs-up icon (FontAwesome) with click counter starting at 0 and incrementing +1 per click.
- **Enhanced UX [UX+]:** Shimmer skeleton rows, zero Cumulative Layout Shift (aspect-ratio preservation 3:2), image lazy loading with blur fade-in, floating scroll-to-top trigger, resilient error retry, and end-of-feed notification.
- **Production Security [SECURITY]:** Zod v4 validation across all external API payloads, image domain whitelisting, anti-XSS text rendering, prototype pollution defenses, and request concurrency throttling.
- **Engineering Standard [TDD]:** Strict Test-Driven Development across all phases using **Vitest** + **React Testing Library** + **@testing-library/user-event** + **jsdom**.

---

## 2. Hard Rules (never violate)
1. **ReactJS**, **single page**, NO router (`react-router-dom` is forbidden). All views and states exist in a single root container.
2. Layout = **1-column view** matching `photo-gallery.jpg`:
   - Bold serif title: "Photo gallery"
   - Each item row contains:
     - Left: Photo thumbnail (`240px × 160px`).
     - Right: `"Author: {author}"`, blue FontAwesome thumbs-up icon, and adjacent count.
3. The thumbs-up count MUST start initialized at `0`, and increment by `+1` on each click without arbitrary limits ("as many clicks performed").
4. Infinite scroll MUST append new items to the existing feed without replacing or refreshing previously loaded articles.
5. Feed pagination stops gracefully when a page returns an empty list (`[]`) or `hasMore` is false.
6. **Strict TDD Workflow:** Write tests first (Red) → Implement minimal code to pass (Green) → Refactor. No phase is complete without passing automated unit/integration tests.
7. **Zero Unvalidated External Data:** All external API responses from `picsum.photos` must pass Zod schema validation before touching React state.
8. **Zero DOM Injection:** Zero `dangerouslySetInnerHTML` or `innerHTML`. Text must be rendered strictly as React children.
9. Plain CSS + JavaScript (no TypeScript, Tailwind, Bootstrap, Material UI, or Redux).

---

## 3. Tech & Testing Stack

| Layer | Choice | Why |
| :--- | :--- | :--- |
| **Build & Dev** | **Vite** + React 18/19 (JavaScript, `.jsx`) | Blazing fast HMR, standard ESM tooling |
| **Styling** | Plain **CSS** + CSS custom properties (`tokens.css`), modular per component | Demonstrates pure CSS layout, flexbox, and keyframe animation proficiency |
| **Icons** | **FontAwesome** (`@fortawesome/react-fontawesome` + `@fortawesome/free-solid-svg-icons`) | Explicit brief requirement ("Use fontawesome icon for thumbs up") |
| **State Management**| `useReducer` + React Context (`GalleryContext`) + custom hooks | Predictable, centralized unidirectional data flow |
| **Infinite Scroll** | **IntersectionObserver API** (`useInfiniteScroll` custom hook) | Native browser performance, off main-thread layout calculations |
| **Validation & Sec** | **Zod v4** + URL Whitelisting | Type safety at the boundary, anti-injection |
| **Testing** | **Vitest** + **@testing-library/react** + **@testing-library/user-event** + **jsdom** | Modern, fast TDD suite |
| **Linter** | `oxlint` / ESLint (`react/no-danger: error`) | Catches security vulnerabilities and anti-patterns |

---

## 4. Folder Structure (target, final)

```
photo-gallary/
├─ README.md                    # Production documentation, setup & test matrix
├─ package.json                 # Project dependencies & scripts
├─ docs/                        # Specifications and design references (source of truth)
│  ├─ 01_REQUIREMENTS_CHECKLIST.md
│  ├─ 02_PROJECT_CONTEXT.md
│  ├─ 03_UI_DESIGN_SPEC.md
│  ├─ 04_IMPLEMENTATION_PHASES.md
│  ├─ 05_AI_SYSTEM_PROMPT.md
│  └─ assets/
│     ├─ constants.js           # API urls, defaults, seed data, UI text
│     ├─ schemas.js             # Zod validation schemas
│     ├─ design-tokens.css      # CSS variables & keyframe definitions
│     └─ reference/
│        └─ photo-gallery.jpg   # Assignment visual reference image
├─ public/
│  └─ favicon.svg
├─ index.html                   # SPA root entry
├─ vite.config.js               # Vite config with proxy & Vitest setup
└─ src/
   ├─ setupTests.js             # Jest-dom matchers, IntersectionObserver polyfill
   ├─ main.jsx                  # React DOM root render
   ├─ App.jsx                   # Main layout container
   ├─ styles/
   │  ├─ tokens.css             # Design tokens imported globally
   │  └─ global.css             # Modern reset & typography
   ├─ constants/
   │  └─ gallery.js             # Copied from docs/assets/constants.js
   ├─ validation/
   │  ├─ schemas.js             # Zod schemas (photoItemSchema, photoFeedSchema)
   │  └─ schemas.test.js        # TDD tests for data validation
   ├─ context/
   │  ├─ GalleryContext.jsx     # State provider and custom hook `useGallery()`
   │  ├─ galleryReducer.js      # Pure reducer: FETCH_START, FETCH_SUCCESS, FETCH_ERROR, LIKE_PHOTO
   │  └─ galleryReducer.test.js # Unit tests for reducer actions
   ├─ hooks/
   │  ├─ useInfiniteScroll.js   # IntersectionObserver sentinel hook
   │  ├─ useInfiniteScroll.test.js
   │  ├─ useScrollPosition.js   # Tracks scroll depth for "Back to top" button
   │  └─ usePicsumFeed.js       # Encapsulates data fetching and pagination
   ├─ utils/
   │  ├─ fetchPhotos.js         # Fetch wrapper with Zod parsing and error mapping
   │  └─ fetchPhotos.test.js    # Unit tests for API fetch wrapper with mocked fetch
   └─ components/
      ├─ Header/                # Header.jsx, Header.css, Header.test.jsx
      ├─ GalleryFeed/           # GalleryFeed.jsx, GalleryFeed.css, GalleryFeed.test.jsx
      ├─ PhotoRow/              # PhotoRow.jsx, PhotoRow.css, PhotoRow.test.jsx
      ├─ ThumbsUpButton/        # ThumbsUpButton.jsx, ThumbsUpButton.css, ThumbsUpButton.test.jsx
      ├─ SkeletonRow/           # SkeletonRow.jsx, SkeletonRow.css
      ├─ ErrorState/            # ErrorState.jsx, ErrorState.css, ErrorState.test.jsx
      └─ ScrollToTop/           # ScrollToTop.jsx, ScrollToTop.css
```

---

## 5. State Architecture & Reducer Contract

The application state is centralized via `galleryReducer.js`:

```javascript
export const initialGalleryState = {
  photos: [],               // Array of validated photo objects: [{ id, author, download_url, ... }]
  likesByPhotoId: {},       // Map of like counts: { "0": 4, "1": 0 }
  page: 1,                  // Current page index
  isLoading: false,         // True during active fetch
  error: null,              // Error message or null
  hasMore: true,            // True if more pages exist; false when page returns empty
  isInitialLoading: true,   // True only on initial page=1 mount
};
```

### Action Types:
1. `FETCH_START`: Sets `isLoading = true`, clears previous error.
2. `FETCH_SUCCESS`: Appends new unique photos (`state.photos.concat(newItems)`), updates `page = page + 1`, sets `hasMore = (newItems.length > 0)`, sets `isLoading = false`, `isInitialLoading = false`.
3. `FETCH_ERROR`: Sets `error = action.payload`, `isLoading = false`.
4. `LIKE_INCREMENTED`: Increments `likesByPhotoId[photoId] = (likesByPhotoId[photoId] || 0) + 1`.
5. `RETRY_FETCH`: Resets error state and triggers fetch for the current page.

---

## 6. Infinite Scroll Lifecycle & Guardrails

```
User scrolls near bottom
         │
         ▼
IntersectionObserver detects sentinel element (250px before bottom)
         │
         ├── Is state.isLoading === true? ──► [YES] ──► Do nothing (Prevent duplicate calls)
         │
         ├── Is state.hasMore === false? ──► [YES] ──► Do nothing (End of gallery reached)
         │
         └── [NO to both]
                 │
                 ▼
         Dispatch FETCH_START
                 │
                 ▼
         Call https://picsum.photos/v2/list?page={page}&limit=10
                 │
                 ├── [Success] ──► Validate via Zod ──► Append photos ──► Increment page
                 │
                 └── [Network / CORS Failure] ──► Catch error ──► Show Error Banner + "Retry"
```
