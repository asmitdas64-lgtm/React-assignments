# Photo Gallery (React + Infinite Scroll + TDD)

A production-grade, single-page React Photo Gallery application with infinite scroll, paginated API ingestion, interactive micro-animations, resilient error recovery, and robust security defenses. Built intentionally beyond the brief to match the design reference (`docs/assets/reference/photo-gallery.jpg`) with zero Cumulative Layout Shift (CLS), strict Test-Driven Development (TDD), and 100% test pass rate.

---

## 📸 Design Alignment

The visual layout adheres directly to the project reference screenshot:
- **Title**: Clean serif `"Photo gallery"` heading at the top.
- **Feed Structure**: Single-column vertical stack of photo items.
- **Photo Row**:
  - **Left**: Photo thumbnail with fixed `240px × 160px` dimensions (`3:2` aspect ratio) and smooth fade-in upon load.
  - **Right**: Centered metadata showing `"Author: {author}"` followed by an inline blue FontAwesome thumbs-up icon (`#1877f2`) and adjacent click counter.
- **Thumbs-Up Counter**: Starts at `0`, increments `+1` on each click without limit, and plays an energetic pop micro-animation.

---

## 🚀 Key Features

### Core Capabilities `[CORE]`
- **Paginated Feed Ingestion**: Dynamically fetches photographs from the Picsum API (`https://picsum.photos/v2/list?page={page}&limit=10`).
- **Infinite Scroll Sentinel**: Leverages the high-performance native `IntersectionObserver` API with a bottom sentinel element and `250px` forward lookahead root margin to fetch the next page before the user reaches the absolute bottom.
- **Append-Only Flow**: Seamlessly appends new photos to the existing feed without re-rendering or wiping out previously loaded images.
- **Infinite Click Counter**: Independent like counter per photo, supporting unlimited clicks and isolated state stored in React Context.

### UX Enhancements `[UX+]`
- **Zero Cumulative Layout Shift (CLS)**: Every image container strictly preserves a `3:2` (`240px × 160px`) aspect ratio with CSS `aspect-ratio: 3 / 2`, preventing page jumps as images load.
- **Skeleton Shimmer Loaders**:
  - Initial load renders **5 skeleton rows** with smooth horizontal CSS gradient shimmer keyframes.
  - Subsequent pagination loads render a single skeleton loader below the existing items while the next batch is in flight.
- **Accessible Motion**: Automatically disables shimmer and micro-bounce animations when the user has enabled `prefers-reduced-motion: reduce`.
- **Image Fallback Handling**: Gracefully handles broken or blocked image URLs by rendering a styled, accessible placeholder indicating the image could not be loaded.
- **Floating Scroll-To-Top**: A floating circular trigger appears when the user scrolls down past `400px`, invoking smooth scrolling to the top on click.
- **Resilient Network Error Recovery**: If an API request fails, an accessible error alert with a **"Try Again"** button appears inline without destroying the already-rendered feed items. Clicking retry immediately re-attempts the exact failed page.
- **End of Feed Indicator**: Gracefully notifies users when all pages are exhausted (`[]` received from API) and unhooks the observer sentinel.

### Security Engineering `[SECURITY]`
- **Zod v4 API Payload Validation**: Every incoming API payload is strictly validated through `PicsumPhotoListSchema` before entering state. Malformed fields, unexpected prototypes, or missing keys are safely caught.
- **Image Domain Whitelisting**: Image URLs are strictly validated to originate only from allowed trusted domains (`picsum.photos`, `fastly.picsum.photos`, `images.unsplash.com`, `unsplash.com`).
- **Anti-XSS Text Rendering**: Zero usage of `dangerouslySetInnerHTML`. Malicious script tags or HTML injection strings in author names are rendered strictly as safe text nodes.
- **Prototype Pollution Prevention**: State management uses immutable operations and safe identifier mapping (`likesByPhotoId[id]`) guarding against `__proto__` and constructor tampering.
- **Concurrency & Race Condition Deduplication**: In-flight request guards (`inFlightRef`) prevent redundant network requests when sentinel triggers rapidly.

---

## 🧪 Test-Driven Development (TDD) Matrix

Every feature, schema, hook, and UI component was built following strict **Red → Green → Refactor** methodology using **Vitest** and **React Testing Library**.

| Suite | Component / Module | Scope | Tests | Result |
| :--- | :--- | :--- | :---: | :---: |
| 1 | `schemas.test.js` | Zod API payload validation & domain whitelist | 23 | ✅ Passing |
| 2 | `galleryReducer.test.js` | Pure reducer state transitions (likes, photos, pages) | 9 | ✅ Passing |
| 3 | `Header.test.jsx` | Banner landmark & semantic heading | 2 | ✅ Passing |
| 4 | `ThumbsUpButton.test.jsx` | Micro-bounce animation, unlimited clicks, keyboard a11y | 6 | ✅ Passing |
| 5 | `PhotoRow.test.jsx` | 1-column layout, 3:2 ratio, fade-in, fallback | 5 | ✅ Passing |
| 6 | `SkeletonRow.test.jsx` | Shimmer markup, accessibility status role | 1 | ✅ Passing |
| 7 | `fetchPhotos.test.js` | Network fetch, query params, Zod ingestion | 6 | ✅ Passing |
| 8 | `usePicsumFeed.test.jsx` | Hook pagination, in-flight guard, error handling | 3 | ✅ Passing |
| 9 | `useInfiniteScroll.test.jsx`| IntersectionObserver sentinel hook, rootMargin | 3 | ✅ Passing |
| 10 | `ErrorState.test.jsx` | Alert role, error text display, retry callback | 3 | ✅ Passing |
| 11 | `ScrollToTop.test.jsx` | Visibility threshold (400px), smooth scroll | 4 | ✅ Passing |
| 12 | `GalleryFeed.test.jsx` | Feed orchestration, initial/pagination skeletons, end feed | 6 | ✅ Passing |
| 13 | `App.core.test.jsx` | End-to-end integration, anti-XSS, keyboard navigation | 6 | ✅ Passing |
| **Total** | **13 Test Suites** | **Comprehensive Full-Stack Coverage** | **77** | **100% Passed** |

---

## 🏗️ Project Architecture

```
photo-gallary/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ErrorState/          # Accessible error alert with retry button
│   │   │   ├── GalleryFeed/         # Infinite scroll feed container & sentinel
│   │   │   ├── Header/              # Serif "Photo gallery" title banner
│   │   │   ├── PhotoRow/            # 1-column photo row (240x160) + author + like
│   │   │   ├── ScrollToTop/         # Floating smooth scroll-to-top button
│   │   │   ├── SkeletonRow/         # Zero-CLS shimmer loading skeleton
│   │   │   └── ThumbsUpButton/      # Blue FontAwesome icon + bounce micro-animation
│   │   ├── constants/
│   │   │   └── gallery.js           # Layout dimensions, timeouts, texts, seed data
│   │   ├── context/
│   │   │   ├── GalleryContext.jsx   # Context provider for gallery state
│   │   │   ├── galleryContextDef.js # Fast Refresh clean context definition
│   │   │   ├── galleryReducer.js    # Immutable state management
│   │   │   └── useGallery.js        # Hook consumer
│   │   ├── hooks/
│   │   │   ├── useInfiniteScroll.js # IntersectionObserver sentinel hook
│   │   │   └── usePicsumFeed.js     # Paginated Picsum data hook with deduplication
│   │   ├── styles/
│   │   │   └── tokens.css           # Design tokens (colors, spacing, fonts, motion)
│   │   ├── utils/
│   │   │   └── fetchPhotos.js       # Validated API fetcher utility
│   │   ├── validation/
│   │   │   └── schemas.js           # Zod v4 schemas for API payloads & domain whitelist
│   │   ├── App.jsx                  # Main application orchestrator
│   │   ├── App.core.test.jsx        # E2E integration and security test suite
│   │   ├── main.jsx                 # Application entry point
│   │   └── setupTests.js            # Vitest + jsdom polyfills (IntersectionObserver)
│   ├── vercel.json                  # Production deployment configuration & CSP headers
│   ├── vitest.config.js             # Vitest test runner configuration
│   └── package.json
└── docs/                            # Specifications, checklists & reference assets
```

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

```bash
# Navigate to the client directory
cd photo-gallary/client

# Install dependencies
npm install --legacy-peer-deps
```

### Running Locally

```bash
# Start Vite development server
npm run dev
```

Open your browser at `http://localhost:5173` to explore the gallery.

### Running Tests

```bash
# Run all 77 unit & integration tests
npm test

# Run code linter
npm run lint
```

### Building for Production

```bash
# Create optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🔒 Production Security Headers (`vercel.json`)

The application includes enterprise security headers configured in `vercel.json`:
- `Content-Security-Policy`: Restricts script and connection sources, allowing only approved image domains (`picsum.photos`, `fastly.picsum.photos`, `unsplash.com`).
- `X-Frame-Options: DENY`: Prevents clickjacking attacks.
- `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
- `Referrer-Policy: strict-origin-when-cross-origin`: Minimizes referrer leakage.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`: Disables unused hardware access.
