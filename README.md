# React Assignments Monorepo

This repository contains production-grade solutions for UI Engineering internship assignments, built with React, strict Test-Driven Development (TDD), zero external UI framework dependencies, and production web security standards.

---

## Projects

### 1. [Photo Gallery (`gallery/`)](./gallery/)
A single-page, infinite scroll photo gallery based on paginated JSON feeds from Picsum:
- **Feed & Layout**: 1-column layout matching the visual reference (`photo-gallery.jpg`), displaying photo thumbnail (`240px × 160px`) on the left and `Author: <name>` with a FontAwesome thumbs-up icon on the right.
- **Infinite Scroll**: Powered by the native `IntersectionObserver` API with a 250px lookahead sentinel, automatically pulling subsequent pages (`page=2`, `page=3`, ...) when approaching the bottom of the feed and appending new articles.
- **Interactive Thumbs-Up**: Blue FontAwesome thumbs-up button initialized to `0` and incrementing by `+1` on every click without limit, featuring a micro-bounce animation.
- **UX & Resiliency**: Aspect-ratio preservation (`3:2`) for zero Cumulative Layout Shift (CLS), shimmer skeleton rows, image fade-in transitions, resilient network error retry state, and floating scroll-to-top trigger.
- **Security**: Strict Zod v4 schema validation of all API payloads, trusted domain allowlisting (`picsum.photos`, `unsplash.com`), prototype pollution guards, and anti-XSS text rendering.
- **TDD Coverage**: 13 test suites and 77 automated tests passing 100% with zero linter warnings.

```bash
# Quickstart gallery
cd gallery/client
npm install --legacy-peer-deps
npm run dev     # Starts Vite development server
npm test        # Runs all 77 automated tests
npm run lint    # Runs oxlint across all files
npm run build   # Production bundle verification
```

---

### 2. [Chat Application (`chat-app/`)](./chat-app/)
A full-stack, single-page real-time chat application built intentionally beyond the brief:
- **Core Messaging**: Textbox + Send button, message thread rendered strictly above input, random author selection per message from `user_list = ["Alan", "Bob", "Carol", "Dean", "Elin"]`, and micro-animated like button with counter.
- **Sidebar Experience**: Desktop sidebar (300px) with display-only `CURRENT_USER` profile card, pre-seeded channel switcher, isolated per-channel state, inline `+` channel creation, and responsive drawer on viewports `<900px`.
- **Extended Capabilities**: Dark-theme emoji picker with caret insertion, smart keyboard-navigable `@mentions` autocomplete, and optimistic offline fallback.
- **Backend & Security**: Real-time Express + Socket.io server with 11 events, sliding-window rate limiting, native `Map` storage (anti-prototype pollution), Zod v4 validation across client and server, and Helmet security headers.
- **TDD Coverage**: 15 test suites and 72 tests (65 client + 7 server) passing 100% with zero warnings.

```bash
# Quickstart chat-app
cd chat-app
npm install
npm --prefix client install --legacy-peer-deps
npm --prefix server install
npm run dev   # Runs client & server concurrently
npm test      # Runs all 72 automated tests
```

---

## Monorepo Quickstart

```bash
# Clone the repository
git clone https://github.com/asmitdas64-lgtm/React-assignments.git
cd React-assignments

# Run Photo Gallery directly from root
npm run gallery:install
npm run gallery

# Run Chat App directly from root
npm run chat:install
npm run chat
```
