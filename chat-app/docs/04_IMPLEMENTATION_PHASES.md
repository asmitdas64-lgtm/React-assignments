# 04 · Phase Implementation Plan (TDD Approach)

Every coding phase follows strict **Test-Driven Development (TDD)**:
1. **RED:** Write unit/component tests in `*.test.js` or `*.test.jsx` that specify the required behavior. Run test runner to verify failure.
2. **GREEN:** Write the minimal implementation code to pass all tests.
3. **REFACTOR:** Clean up code, remove duplication, verify accessibility and design tokens without breaking tests.
4. **COMMIT:** Git commit for the phase.

---

## Phase 0: Project Scaffold & Test Setup (≈25 min)
- [ ] Create Vite React app: `npm create vite@latest client -- --template react` in `chat-app/`
- [ ] Install testing dependencies in `client/`:
  `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom zod`
- [ ] Configure `client/vitest.config.js` (environment: 'jsdom', setupFiles: './src/setupTests.js')
- [ ] Setup `client/src/setupTests.js` (`import '@testing-library/jest-dom'`)
- [ ] Add `"test": "vitest run"` and `"test:watch": "vitest"` to `client/package.json`
- [ ] Clean Vite boilerplate; add Google Fonts Roboto 400/500 to `index.html`
- [ ] Copy `docs/assets/design-tokens.css` → `src/styles/tokens.css` and `docs/assets/constants.js` → `src/constants/users.js`
- [ ] Copy `docs/assets/schemas.js` → `src/validation/schemas.js` (adjust import to `../constants/users.js`)
- [ ] Setup `client/src/validation/schemas.test.js` with tests verifying all Zod validation rules
- [ ] `git init` at `chat-app/` + `.gitignore` (`node_modules`, `dist`, `.env`)

**Done when:** `npm test` runs and passes all schema tests. → commit `chore: scaffold vite react app with vitest and zod`

## Phase 1: Static Layout Components (≈45 min) [CORE][SIDEBAR]
- [ ] **RED:** Write `AppLayout.test.jsx`, `MessageItem.test.jsx`, `LikeButton.test.jsx`, `ChatInput.test.jsx` asserting DOM presence, roles, and accessible labels. Tests fail.
- [ ] **GREEN:** Implement `AppLayout`, `Sidebar`, `ProfileCard`, `ChannelList`, `ChatHeader`, `MessageList`, `MessageItem`, `Avatar`, `LikeButton`, and `ChatInput` with mock props and design tokens. Tests pass.
- [ ] **REFACTOR:** Check visual fidelity against `ref-chat-thread.jpg`. Ensure no hard-coded colors.
- [ ] Verify Send button exists alongside textbox.

**Done when:** All layout component tests pass; UI visually matches reference. → commit `feat: static layout with sidebar`

## Phase 2: State & Core Messaging (≈60 min) [CORE] A1–A4
- [ ] **RED:**
  - Create `src/context/chatReducer.test.js`: test `MESSAGE_ADDED` (appends message, assigns random user from `user_list`, enforces unique ID, initializes likes: 0).
  - Create `src/utils/formatTime.test.js`: test epoch timestamp formatting to `HH:mm`.
  - Create `src/components/ChatInput/ChatInput.test.jsx`: test that clicking Send or pressing Enter triggers message send, input clears, empty text is rejected, counter appears at 450 chars.
- [ ] **GREEN:**
  - Implement `chatReducer.js`, `ChatContext.jsx` with `useChat()`.
  - Implement `formatTime.js`.
  - Wire `ChatInput` with controlled state, Zod `messageTextSchema` validation, counter, and inline error.
  - Implement `useAutoScroll.js` hook for message thread.
- [ ] **REFACTOR:** Verify input auto-focuses after send; confirm long unbroken strings wrap safely.

**Done when:** `npm test` passes all reducer, time utility, and chat input tests. 5 sent messages display with random users. → commit `feat: send messages with random users (TDD)`

## Phase 3: Like Button & Counter (≈25 min) [CORE] A5
- [ ] **RED:**
  - Update `chatReducer.test.js` with `MESSAGE_LIKED` tests (increments target message likes only; does not affect others).
  - Create `LikeButton.test.jsx`: verify count rendering, accessible label, click firing, active state class when likes > 0.
- [ ] **GREEN:**
  - Implement `likeMessage(id)` in `chatReducer` and expose via `useChat()`.
  - Implement `LikeButton` component with pop animation and correct styling.
- [ ] **REFACTOR:** Ensure accessible click target and clean CSS transitions.

**Done when:** Like tests pass; clicking like increments count at right end of the message. → commit `feat: like button with counter (TDD)`

## Phase 4: Core Verification & Accessibility [CORE]
- [ ] Run full test suite: `npm test`
- [ ] Run linter: `npm run lint`
- [ ] Manual check: keyboard navigation (Tab between input, Send, and Like buttons; visible focus rings).
- [ ] Verify all Section A checklist items in `01_REQUIREMENTS_CHECKLIST.md`.

**Done when:** 100% of Core tests pass; zero lint errors. → commit `chore: core verification and a11y audit`

## Phase 5: Functional Sidebar & Channel Switching (≈60 min) [SIDEBAR] B1–B3
- [ ] **RED:**
  - Update `chatReducer.test.js` for `CHANNEL_SELECTED` and `CHANNEL_ADDED`.
  - Create `src/components/Sidebar/ChannelList.test.jsx`: clicking channel highlights it and filters active messages.
  - Create `src/components/Sidebar/AddChannelForm.test.jsx`: test inline input, Zod validation errors (empty, duplicates, illegal characters), Enter to submit, Esc to cancel.
- [ ] **GREEN:**
  - Wire channel state in `ChatContext`.
  - Implement `AddChannelForm` with Zod `channelNameSchema`, inline error alert, and keyboard controls.
  - Connect `ChatHeader` to show active channel name, description, and member count (`onlineCount | 5`).
- [ ] **REFACTOR:** Ensure channel state isolation (messages in "Poland Office" do not leak into "Introductions").

**Done when:** Channel tests pass; channels can be created and switched cleanly. → commit `feat: functional sidebar and channel state (TDD)`

## Phase 6: Responsive Sidebar Drawer (≈40 min) [SIDEBAR] B4
- [ ] **RED:**
  - Create `src/components/AppLayout/AppLayout.responsive.test.jsx`: test hamburger button opens drawer, backdrop click or Esc closes drawer.
- [ ] **GREEN:**
  - Implement drawer state in `AppLayout` with CSS slide transition and backdrop overlay.
  - Focus trap / focus return to hamburger when drawer closes.
- [ ] **REFACTOR:** Responsive CSS for ≤ 600px (Send button collapses to circle icon, padding adjusts).

**Done when:** Responsive tests pass; tested at 360px and 1200px viewport widths. → commit `feat: responsive sidebar drawer (TDD)`

## Phase 7: Emoji Picker (≈45 min) [CORE+] C
- [ ] Install emoji-mart: `npm i @emoji-mart/react @emoji-mart/data`
- [ ] **RED:**
  - Create `src/utils/insertAtCaret.test.js`: test string insertion at specific caret index.
  - Create `src/components/ChatInput/EmojiPicker.test.jsx`: test toggle button opens/closes popover, selecting emoji inserts into input.
- [ ] **GREEN:**
  - Implement `insertAtCaret.js`.
  - Implement `EmojiPickerPopover` with lazy-loading (`React.lazy`), dark theme, and outside-click dismissal.
- [ ] **REFACTOR:** Ensure emoji picker closes when mention list opens and vice versa.

**Done when:** Emoji tests pass; picker matches `ref-emoji-picker.jpg`. → commit `feat: emoji picker (TDD)`

## Phase 8: @mentions Feature (≈60 min) [CORE+] D
- [ ] **RED:**
  - Create `src/utils/parseMentions.test.js`: test parsing of `@Alan`, `@Bob` into structured nodes; ignores `@Unknown`.
  - Create `src/components/ChatInput/MentionList.test.jsx`: test typing `@` reveals all users, typing `@c` filters to Carol, ArrowDown/Enter selects, Esc closes.
- [ ] **GREEN:**
  - Implement `useMentions.js` hook.
  - Implement `MentionList` component with keyboard navigation and ARIA attributes.
  - Update `MessageItem` to render text using `parseMentions`.
- [ ] **REFACTOR:** Verify Enter selects a mention without submitting the message.

**Done when:** Mention tests pass; mentions render highlighted in message bubbles. → commit `feat: @mentions support (TDD)`

## Phase 9: Real-Time Server with Socket.io (≈90 min) [CORE+] E, [SECURITY] F
- [ ] Setup server:
  - Inside `server/`: `npm init -y`, `npm i express socket.io cors helmet zod`
  - Install dev dependencies: `npm i -D vitest socket.io-client`
  - Copy `constants.js` and `schemas.js` into `server/`
- [ ] **RED:**
  - Create `server/index.test.js`:
    - Connect multiple clients.
    - Test room isolation: message sent to `introductions` not received in `poland-office`.
    - Test server validation: sending `{ text: "" }` or `{ text: "hi", username: "Hacker" }` returns `chat:error` `INVALID_INPUT`.
    - Test rate limiting: emitting 10 messages rapidly triggers `RATE_LIMITED`.
    - Test like sync: `message:like` broadcasts `message:updated`.
    - Test channel creation: `channel:create` validates uniqueness and broadcasts `channels:updated`.
- [ ] **GREEN:**
  - Implement `server/index.js` using `helmet()`, CORS configuration, `Map` storage, and Zod validation on all 11 socket events.
  - Implement rate limiting middleware and error shielding.
  - Implement client `socketHandler.js` in `client/` and wire into `ChatContext`.
- [ ] **REFACTOR:** Graceful local-mode fallback when server disconnects; StrictMode cleanup verification.

**Done when:** `npm --prefix server test` passes all real-time integration tests. Two browser tabs sync messages and likes live. → commit `feat: realtime socket.io server with security hardening (TDD)`

## Phase 10: Root Orchestration, Documentation & Deployment (≈45 min)
- [ ] Setup root `package.json` with `concurrently`:
  - `"dev"`: runs both client and server dev servers
  - `"test"`: runs client and server test suites
  - `"lint"`: runs linting
- [ ] Execute `F6` Security Test Cases and record results.
- [ ] Write comprehensive `README.md` (Features, Architecture, Security, TDD approach, Setup instructions, Screenshots, Trade-offs).
- [ ] Prepare deployment configs (`client/vercel.json`, `server/package.json`).
- [ ] Final verification against all checklist items in `01_REQUIREMENTS_CHECKLIST.md`.

**Done when:** All tests pass across client and server; ready for production evaluation. → commit `chore: documentation, test audit, and submission prep`
