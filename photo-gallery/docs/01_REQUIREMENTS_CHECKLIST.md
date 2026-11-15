# 01 · Requirements Checklist

Source: take-home assignment brief (UI Internship - Photo Gallery) & reference image `docs/assets/reference/photo-gallery.jpg`.

**Scope decision:** to make the submission stand out and demonstrate senior-level engineering rigor, **all core requirements, production-grade security, resilient infinite scroll, and visual fidelity to the reference image are mandatory** for this project.

Tags:
- **[CORE]** = Basic Task from the brief (graded first; must never break)
- **[UX+]** = Production UX enhancements (skeleton loaders, image aspect ratio preservation, zero CLS, error retry, scroll-to-top)
- **[SECURITY]** = Security hardening (added by us; **mandatory**): Zod v4 validation, URL host sanitization, XSS prevention, prototype-pollution defenses
- **[QUALITY]** = Accessibility, keyboard navigation, and responsive ergonomics expected by senior engineering reviewers

> Build order matters: **[CORE] first → [UX+] enhancements**, with **[SECURITY] built into each phase** (not bolted on at the end).

---

## A. Application Shape & Layout — [CORE]

### A1. Framework & Single Page Architecture
- [ ] **[CORE]** Built with **ReactJS**
- [ ] **[CORE]** **Single Page Application** (no router library like `react-router-dom`; single continuous feed view)
- [ ] **[CORE]** **1-column view** layout displaying photographs and article details matching `photo-gallery.jpg`
- [ ] **[CORE]** Header title: **"Photo gallery"** (serif bold heading matching reference)
- [ ] **[QUALITY]** Responsive container width (`max-width: 900px`), adapting gracefully from mobile (320px) to desktop
- [ ] **[QUALITY]** Clean white background (`#ffffff`) and typography extracted into `tokens.css`

---

## B. Photo Row Item Rendering — [CORE]

### B1. Photo & Author Display (Reference Layout)
- [ ] **[CORE]** Each item renders in a 1-column list with photo on the left and author + icon on the right
- [ ] **[CORE]** Uses `download_url` to render the photo thumbnail (aspect ratio `3:2`, approx `240px × 160px`)
- [ ] **[CORE]** Uses `author` to render author attribution prefixed with **"Author: "** (e.g. `Author: Vadim Sherbakov`)
- [ ] **[UX+]** **Zero Cumulative Layout Shift (CLS):** Thumbnail containers reserve aspect ratio (`3 / 2`) with placeholder shimmer before image downloads
- [ ] **[UX+]** Image fade-in transition (`opacity: 0` → `1`) upon `onLoad` completion
- [ ] **[UX+]** Image error fallback placeholder if an image fails to load
- [ ] **[SECURITY]** Author string rendered strictly via React text children (zero `dangerouslySetInnerHTML`)
- [ ] **[SECURITY]** `download_url` verified through Zod schema to enforce valid `https://` protocol and trusted photography domain whitelist

### B2. Thumbs Up Icon & Like Counter — [CORE]
- [ ] **[CORE]** Next to each photo / author text, renders a **thumbs up icon**
- [ ] **[CORE]** Thumbs up icon uses **FontAwesome** (`@fortawesome/react-fontawesome` with `faThumbsUp`) in blue (`#1877f2`) matching the reference image
- [ ] **[CORE]** Next to the icon, displays a **counter initialized to 0**
- [ ] **[CORE]** Clicking the thumbs up icon **increases the count by +1**
- [ ] **[CORE]** Counter increases with **as many clicks performed** (unlimited increments per user request)
- [ ] **[QUALITY]** Micro-interaction animation on click (`@keyframes thumbs-bounce`)
- [ ] **[QUALITY]** Accessible button semantics: `<button type="button">`, `aria-label="Thumbs up photo by {author}. Currently {count} likes"`
- [ ] **[SECURITY]** Likes state managed via isolated lookup map (`likesByPhotoId`) with bounded integers (`min: 0`)

---

## C. Data Ingestion & Infinite Scroll — [CORE]

### C1. Paginated JSON Feeds
- [ ] **[CORE]** Feeds fetched from Picsum API:
  - `https://picsum.photos/v2/list?page=1`
  - `https://picsum.photos/v2/list?page=2`
  - `https://picsum.photos/v2/list?page=3` (and so forth)
- [ ] **[CORE]** Initial load fetches `page=1` and renders the first batch of articles
- [ ] **[CORE]** When the user reaches the bottom of the page, automatically pulls in data from the next page (`page=2`, etc.)
- [ ] **[CORE]** Newly fetched items are appended to the **existing list** of articles without replacing or wiping previous items
- [ ] **[CORE]** Keeps paginating until reaching a page that returns **no more data** (empty array `[]` or length < limit)

### C2. Infinite Scroll Mechanics & Guardrails
- [ ] **[UX+]** Utilizes **IntersectionObserver API** with a dedicated sentinel trigger element placed at the bottom of the feed
- [ ] **[UX+]** Pre-fetching margin (`rootMargin: "250px"`) so items load smoothly before the user hits an abrupt dead end
- [ ] **[SECURITY]** **Concurrency & Request Deduplication Guard:** Prevents multiple simultaneous duplicate network requests while a page is already fetching (`isLoading` gate)
- [ ] **[SECURITY]** **Runaway Fetch Protection:** Hard cap on page numbers (`MAX_ALLOWED_PAGES = 100`) to prevent infinite looping
- [ ] **[UX+]** End-of-feed indicator displayed when all pages are consumed ("You have reached the end of the gallery")
- [ ] **[UX+]** Fallback local seed data if network is completely severed or offline

---

## D. User Experience & Resiliency — [UX+]

### D1. Loading States & Skeletons
- [ ] **[UX+]** Initial page load renders 5 animated skeleton rows matching the 240×160 layout with shimmer animation
- [ ] **[UX+]** Subsequent page loads render a bottom spinner / skeleton indicator while keeping previously loaded items interactive

### D2. Error Recovery & Offline Handling
- [ ] **[UX+]** Catches network drops, HTTP 500s, or CORS failures gracefully
- [ ] **[UX+]** Renders an inline error notification with a visible **"Try Again" / "Retry"** button
- [ ] **[UX+]** Clicking Retry resumes fetching the exact page that failed without losing previously loaded articles

### D3. Scroll Ergonomics
- [ ] **[UX+]** Floating **"Back to top"** button appears when user scrolls down > 600px
- [ ] **[UX+]** Smooth scroll back to top on click

---

## E. Security Hardening — [SECURITY]

- [ ] **[SECURITY]** **F1: Zod v4 Feed Validation:** All API responses validated with `photoFeedSchema` before updating React state. Invalid/malformed items rejected safely.
- [ ] **[SECURITY]** **F2: URL Host Whitelisting:** `download_url` verified to match trusted image origins (`picsum.photos`, `fastly.picsum.photos`, `unsplash.com`).
- [ ] **[SECURITY]** **F3: Zero DOM Injection (Anti-XSS):** No raw HTML rendering; text nodes rendered purely as JSX text.
- [ ] **[SECURITY]** **F4: Prototype Pollution Defense:** Likes state maintained with clean object maps or `Map` instances without arbitrary key injection.
- [ ] **[SECURITY]** **F5: Safe Content Security Policy & Headers:** Vercel deployment headers with CSP, Frame Options (`DENY`), and anti-sniff headers.

---

## F. Test-Driven Development (TDD) — [TDD]

- [ ] **[TDD]** Every phase follows strict **Red → Green → Refactor** cycle using **Vitest** and **React Testing Library**
- [ ] **[TDD]** Unit tests for Zod schemas (`schemas.test.js`)
- [ ] **[TDD]** Unit tests for custom hooks (`useInfiniteScroll.test.js`, `usePicsumFeed.test.js`)
- [ ] **[TDD]** Component tests for `ThumbsUpButton`, `PhotoRow`, `GalleryFeed`, `SkeletonRow`, and `ErrorState`
- [ ] **[TDD]** End-to-end integration test (`App.core.test.jsx`) asserting pagination, like counter increments, and error recovery
- [ ] **[TDD]** 100% test pass rate with zero console errors or warnings
