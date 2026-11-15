# 04 · Phase Implementation Plan (TDD Approach)

Every coding phase follows strict **Test-Driven Development (TDD)**:
1. **RED:** Write unit/component tests in `*.test.js` or `*.test.jsx` that specify the required behavior. Run test runner to verify failure.
2. **GREEN:** Write the minimal implementation code to pass all tests.
3. **REFACTOR:** Clean up code, remove duplication, verify accessibility and design tokens without breaking tests.
4. **COMMIT:** Git commit for the phase.

---

## Phase 0: Project Scaffold & Test Setup (≈25 min)
- [ ] Create Vite React app: `npm create vite@latest client -- --template react` in `photo-gallery/`
- [ ] Install dependencies in `client/`:
  - `npm install zod @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons`
  - `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom oxlint`
- [ ] Configure `client/vitest.config.js` (environment: 'jsdom', setupFiles: './src/setupTests.js')
- [ ] Setup `client/src/setupTests.js` (`import '@testing-library/jest-dom'`, IntersectionObserver mock, window.scrollTo mock)
- [ ] Add test & lint scripts to `client/package.json`: `"test": "vitest run"`, `"lint": "oxlint ."`
- [ ] Copy `docs/assets/design-tokens.css` → `src/styles/tokens.css` and `docs/assets/constants.js` → `src/constants/gallery.js`
- [ ] Copy `docs/assets/schemas.js` → `src/validation/schemas.js` (adjust import to `../constants/gallery.js`)
- [ ] Setup `client/src/validation/schemas.test.js` with tests verifying all Zod validation rules (valid items, invalid URLs, bad payloads)
- [ ] Initialize git repo in `photo-gallery/` with proper `.gitignore`

**Done when:** `npm test` runs and passes all schema validation tests. → commit `chore: scaffold vite react app with vitest, fontawesome, and zod`

---

## Phase 1: Static Layout & Row Components (≈40 min) [CORE]
- [ ] **RED:**
  - Create `src/components/Header/Header.test.jsx`: asserts "Photo gallery" title in serif font.
  - Create `src/components/PhotoRow/PhotoRow.test.jsx`: asserts 1-column row with photo thumbnail (240×160), "Author: {name}", and thumbs-up button.
  - Create `src/components/ThumbsUpButton/ThumbsUpButton.test.jsx`: asserts FontAwesome thumbs-up icon, initial count `0`, and accessible `aria-label`.
- [ ] **GREEN:**
  - Implement `Header.jsx`, `Header.css`.
  - Implement `PhotoRow.jsx`, `PhotoRow.css`.
  - Implement `ThumbsUpButton.jsx`, `ThumbsUpButton.css` with `@fortawesome/react-fontawesome` and `faThumbsUp`.
  - Wire components into static `App.jsx` using `SEED_PHOTOS`.
- [ ] **REFACTOR:** Check design tokens, ensure 1-column layout matching `photo-gallery.jpg`.

**Done when:** All layout component tests pass; UI visually renders 1-column photo stream matching reference. → commit `feat: static layout with photo rows and fontawesome thumbs up`

---

## Phase 2: State Management & Reducer Logic (≈45 min) [CORE]
- [ ] **RED:**
  - Create `src/context/galleryReducer.test.js`:
    - Tests `FETCH_START` (sets `isLoading: true`, resets error).
    - Tests `FETCH_SUCCESS` (appends new photos, increments page counter, detects empty list for `hasMore`).
    - Tests `FETCH_ERROR` (stores error message, resets `isLoading`).
    - Tests `LIKE_INCREMENTED` (increments count for target photo without mutating other items).
- [ ] **GREEN:**
  - Implement `galleryReducer.js`.
  - Implement `GalleryContext.jsx` with `useGallery()` hook providing state and dispatch actions (`loadPhotos`, `likePhoto`).
  - Wire `GalleryProvider` at the root of `App.jsx`.
- [ ] **REFACTOR:** Verify pure function immutability; ensure state maps cannot suffer prototype pollution.

**Done when:** `npm test` passes all reducer unit tests. → commit `feat: gallery state reducer and context provider (TDD)`

---

## Phase 3: Thumbs Up Counter & Micro-Interactions (≈30 min) [CORE]
- [ ] **RED:**
  - Update `src/components/ThumbsUpButton/ThumbsUpButton.test.jsx`:
    - Clicking icon increments count from `0` → `1` → `2` → `5` (verifies unlimited clicks as requested).
    - Triggers bounce animation class on click.
    - Updates dynamic `aria-label` with author name and current count.
- [ ] **GREEN:**
  - Connect `ThumbsUpButton` to `likePhoto(photoId)` from context.
  - Implement `@keyframes thumbs-bounce` in CSS.
  - Add active state styling when count > 0.
- [ ] **REFACTOR:** Ensure keyboard accessibility (`Enter` and `Space` fire clicks cleanly, visible focus outline).

**Done when:** Thumbs up tests pass; clicking icon increases count smoothly on every click. → commit `feat: interactive fontawesome thumbs up counter (TDD)`

---

## Phase 4: Data Ingestion & Zod Validation Layer (≈45 min) [CORE][SECURITY]
- [ ] **RED:**
  - Create `src/utils/fetchPhotos.test.js`:
    - Mocks global `fetch`.
    - Tests successful fetch from `https://picsum.photos/v2/list?page={n}` and parsing via Zod `photoFeedSchema`.
    - Tests handling of invalid payloads (malformed JSON or unsafe URL rejection).
    - Tests network failure propagation.
- [ ] **GREEN:**
  - Implement `fetchPhotos.js` with Zod validation, error normalization, and query param formatting.
  - Implement `usePicsumFeed.js` custom hook connecting `fetchPhotos` with `GalleryContext`.
- [ ] **REFACTOR:** Optimize download URL format using `getOptimizedImageUrl` to load optimal 240×160 thumbnails instead of 5000px images.

**Done when:** API fetch tests pass; valid items are ingested and validated cleanly. → commit `feat: picsum api ingestion with zod validation (TDD)`

---

## Phase 5: Infinite Scroll Sentinel & Pagination (≈50 min) [CORE][UX+]
- [ ] **RED:**
  - Create `src/hooks/useInfiniteScroll.test.js`:
    - Mocks `IntersectionObserver`.
    - Tests that triggering intersection calls the callback when `hasMore` is true and `isLoading` is false.
    - Tests that intersection does NOT trigger when `isLoading` is true (deduplication / concurrency guard).
    - Tests that intersection does NOT trigger when `hasMore` is false.
  - Create `src/components/GalleryFeed/GalleryFeed.test.jsx`: tests bottom sentinel element and continuous appending of pages.
- [ ] **GREEN:**
  - Implement `useInfiniteScroll.js` hook using `IntersectionObserver` with `rootMargin: '250px'`.
  - Implement `GalleryFeed.jsx` with sentinel `div` at the bottom of the photo list.
  - Render end-of-feed message when `hasMore` is false.
- [ ] **REFACTOR:** Clean up observer subscriptions on unmount to prevent memory leaks.

**Done when:** Infinite scroll tests pass; scrolling to bottom fetches `page=2`, `page=3`, etc., appending items. → commit `feat: infinite scroll with intersection observer (TDD)`

---

## Phase 6: Loading Skeletons & Zero-CLS Image Polish (≈35 min) [UX+]
- [ ] **RED:**
  - Create `src/components/SkeletonRow/SkeletonRow.test.jsx`: tests rendering of shimmer placeholder rows with proper ARIA `aria-busy="true"`.
- [ ] **GREEN:**
  - Implement `SkeletonRow.jsx` and CSS shimmer animation matching the 240×160 layout.
  - Render 5 skeletons on initial load (`isInitialLoading`), and 1 skeleton below sentinel during subsequent page fetches.
  - Add `aspect-ratio: 3 / 2` on thumbnail containers to eliminate layout shift (CLS = 0).
  - Add image `onLoad` state for smooth fade-in.
- [ ] **REFACTOR:** Test on slow 3G network simulation; verify zero jitter when images load.

**Done when:** Skeleton tests pass; layout is completely stable during loading. → commit `feat: skeleton loading rows and zero cls image transitions (TDD)`

---

## Phase 7: Error Recovery, Retry & Scroll-to-Top (≈35 min) [UX+]
- [ ] **RED:**
  - Create `src/components/ErrorState/ErrorState.test.jsx`: tests display of error message and execution of retry callback on button click.
  - Create `src/components/ScrollToTop/ScrollToTop.test.jsx`: tests visibility toggle based on scroll offset and click trigger calling `window.scrollTo`.
- [ ] **GREEN:**
  - Implement `ErrorState.jsx` with accessible alert role and "Try Again" button.
  - Implement `ScrollToTop.jsx` floating button with smooth scroll.
  - Connect retry action in `GalleryFeed` to resume fetching the exact failed page.
- [ ] **REFACTOR:** Test with disconnected network; verify graceful error banner and successful retry once connection is restored.

**Done when:** Error recovery and scroll-to-top tests pass. → commit `feat: resilient error retry and scroll to top button (TDD)`

---

## Phase 8: Core Verification & Accessibility Audit (≈35 min) [QUALITY]
- [ ] **RED:**
  - Create `src/App.core.test.jsx`: comprehensive integration suite verifying:
    1. Initial page 1 loads and renders articles in 1-column view.
    2. Infinite scroll triggers page 2 fetch and appends items.
    3. Thumbs up button increments count on multiple clicks.
    4. Safe rendering prevents XSS injections.
    5. Keyboard navigation across rows and buttons.
- [ ] **GREEN:** Verify all tests pass 100%.
- [ ] Run linter: `npm run lint` (ensure 0 warnings, 0 errors).
- [ ] Audit keyboard accessibility (`Tab`, `Shift+Tab`, `Space`, `Enter`).

**Done when:** Full test suite passes; zero lint errors; complete compliance with Section A checklist. → commit `chore: core verification and accessibility audit (TDD)`

---

## Phase 9: Deployment Configuration & Final Polish (≈20 min)
- [ ] Create `client/vercel.json` with security headers (CSP, X-Frame-Options, nosniff).
- [ ] Create `.env.example`.
- [ ] Write comprehensive `README.md` including architecture, TDD test matrix, features, and setup instructions.
- [ ] Final build verification: `npm run build`.

**Done when:** Production build succeeds; README complete. → commit `chore: documentation, build audit, and submission prep (Phase 9)`
