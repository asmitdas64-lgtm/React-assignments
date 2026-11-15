# 02 · Project Context

> **Source of truth hierarchy:** `01_REQUIREMENTS_CHECKLIST.md` (what) → this file (how) → `03_UI_DESIGN_SPEC.md` (look) → `04_IMPLEMENTATION_PHASES.md` (order & TDD). If two files ever disagree, `01` wins.

## 1. Overview
A single-page **React chat app** for a UI-internship take-home, deliberately built **beyond the brief** with production-grade engineering standards:
- **Brief's basic task [CORE]:** type a message, click **Send**, message appears in thread above input. Random username from fixed list per message; like button at right end with counter (+1 per click).
- **Promoted to mandatory [CORE+]:** emoji picker, `@mentions`, real-time sync with **Express + socket.io**.
- **Added by us [SIDEBAR]:** responsive sidebar (profile card + channel list + inline add channel) + chat header.
- **Added by us [SECURITY]:** end-to-end schema validation via **Zod v4**, XSS defenses, prototype pollution & injection protection, rate limiting, and size boundaries.
- **Engineering standard [TDD]:** **Test-Driven Development** across all coding phases using **Vitest** + **React Testing Library** (client) and **Vitest** (server). Red → Green → Refactor for every phase.

## 2. Hard Rules (never violate)
1. **ReactJS**, **single page**, no router. Channel switching is internal state, not URL routing.
2. Layout = **sidebar (left, 300px) + chat panel (right)**. Responsive drawer below 900px.
3. Chat panel must have a **textbox** and a **Send button** (brief requirement).
4. Sent message shows **above** textbox, in the **active channel**.
5. Username for **each message** = random pick from exactly `["Alan", "Bob", "Carol", "Dean", "Elin"]` (`user_list`). Sidebar profile (`CURRENT_USER`) is display-only and **never** the message author.
6. **Like button at the right end** of every message. Click increments counter (+1). No unlike.
7. Build order: **[CORE] → [SIDEBAR] → [CORE+]**. All [CORE] and [SIDEBAR] features must function fully in **local mode** if the server is offline.
8. **Strict TDD Workflow:** Write tests first (Red) → Implement minimal code to pass (Green) → Refactor. No phase is complete without passing automated unit/integration tests.
9. **Zero Unvalidated Input:** All inputs (messages, channel names, socket payloads) must pass Zod schema validation before processing or storing.
10. Plain CSS + JavaScript (no TypeScript, Tailwind, UI component libraries, Redux, or react-router).

## 3. Tech & Testing Stack
| Layer | Choice | Why |
|---|---|---|
| Build | **Vite** + React 18/19 (JavaScript, `.jsx`) | Fast, modern standard |
| Styling | Plain **CSS** + CSS variables (`tokens.css`), one `.css` per component | Demonstrates pure CSS proficiency |
| State | `useReducer` + React Context (`ChatContext`) + custom hooks | Predictable state flow across sidebar and chat |
| Validation & Security | **Zod v4** (client & server) + **Helmet** (server) + strict escaping | Type-safe schema validation, anti-XSS, anti-injection |
| Client Testing | **Vitest** + **@testing-library/react** + **@testing-library/user-event** + **jsdom** | Modern, fast TDD runner matching Vite environment |
| Server Testing | **Vitest** + **socket.io-client** (in-memory test instances) | Fast automated verification of socket event contracts |
| Emoji | `@emoji-mart/react` + `@emoji-mart/data` | Matches reference dark picker |
| Realtime | Server: `express`, `socket.io`, `cors`, `helmet` · Client: `socket.io-client` | Real-time publish/subscribe rooms |
| Lint & Security | ESLint (`eslint-plugin-react` with `react/no-danger: error`) | Catches security antipatterns and style issues |

Environment: Node v24, npm 11. Client port **5173**, Server port **3001**.

## 4. Folder Structure (target, final)
```
chat-app/
├─ AGENTS.md
├─ README.md
├─ package.json                 # root: scripts for "dev", "test", "lint" via concurrently
├─ docs/                        # context files (source of truth)
│  └─ assets/                   # reference images, icons, tokens, constants, schemas
├─ client/                      # Vite React app
│  ├─ index.html
│  ├─ vitest.config.js          # Vitest + jsdom + setupFiles
│  ├─ .env.example              # VITE_SOCKET_URL=http://localhost:3001
│  ├─ package.json
│  └─ src/
│     ├─ setupTests.js          # @testing-library/jest-dom matchers, window.matchMedia polyfill
│     ├─ main.jsx
│     ├─ App.jsx                # <ChatProvider><AppLayout/></ChatProvider>
│     ├─ constants/users.js     # users, limits, seed channels, helpers
│     ├─ validation/
│     │  ├─ schemas.js          # Zod schemas (messageTextSchema, channelNameSchema, etc.)
│     │  └─ schemas.test.js     # TDD tests for client input validation
│     ├─ context/
│     │  ├─ ChatContext.jsx     # Provider + useChat()
│     │  ├─ chatReducer.js      # Pure state reducer
│     │  └─ chatReducer.test.js # TDD unit tests for state actions
│     ├─ socket/
│     │  ├─ socket.js           # socket.io-client instance (autoConnect: false)
│     │  └─ socketHandler.js    # manages connection, listeners, and dispatching
│     ├─ hooks/
│     │  ├─ useAutoScroll.js
│     │  ├─ useClickOutside.js
│     │  └─ useMentions.js
│     ├─ utils/
│     │  ├─ formatTime.js       # ms -> "HH:mm"
│     │  ├─ formatTime.test.js
│     │  ├─ insertAtCaret.js
│     │  ├─ parseMentions.js
│     │  └─ parseMentions.test.js
│     ├─ components/
│     │  ├─ AppLayout/          # AppLayout.jsx, AppLayout.css, AppLayout.test.jsx
│     │  ├─ Sidebar/
│     │  ├─ ProfileCard/
│     │  ├─ ChannelList/
│     │  ├─ ChannelItem/
│     │  ├─ AddChannelForm/     # AddChannelForm.jsx, .css, .test.jsx
│     │  ├─ ChatPanel/
│     │  ├─ ChatHeader/
│     │  ├─ MessageList/
│     │  ├─ MessageItem/        # MessageItem.jsx, .css, .test.jsx
│     │  ├─ Avatar/
│     │  ├─ LikeButton/         # LikeButton.jsx, .css, .test.jsx
│     │  ├─ ChatInput/          # ChatInput.jsx, .css, .test.jsx (includes counter & alert)
│     │  ├─ EmojiPickerPopover/
│     │  └─ MentionList/        # MentionList.jsx, .css, .test.jsx
│     └─ styles/
│        ├─ tokens.css          # Design tokens
│        └─ global.css          # Resets, utilities (.sr-only, .alert-error)
└─ server/
   ├─ package.json              # "type": "module", scripts: dev, start, test
   ├─ vitest.config.js
   ├─ constants.js              # Server copy identical to client
   ├─ schemas.js                # Server copy of Zod schemas
   ├─ schemas.test.js           # Server schema verification
   ├─ index.js                  # Express + Socket.io server
   └─ index.test.js             # Integration tests for socket events, rate limits, Zod rejection
```

## 5. Security & Validation Architecture

### 5.1. Input Validation with Zod v4
All inputs are validated using Zod v4 (`schemas.js`):
1. **Message Text (`messageTextSchema`):**
   - Strips control characters, zero-width spaces, RTL/LTR overrides, and BOM. Preserves ZWJ for emoji sequences.
   - Trims whitespace.
   - Must be between 1 and 500 characters.
   - Rejects empty, whitespace-only, or control-only strings.
2. **Channel Name (`channelNameSchema`):**
   - Collapses consecutive whitespace to a single space.
   - Regex: `/^[A-Za-z0-9][A-Za-z0-9 _-]*$/` (starts with alphanumeric, allowed characters: alphanumeric, space, `-`, `_`).
   - Length between 1 and 30 characters.
3. **Payload Sanitization (`z.strictObject`):**
   - Rejects any payload containing unexpected properties (e.g. `{ text: "hello", isAdmin: true }`).
   - Rejects non-string types (protecting against NoSQL/operator injection like `{ text: { "$gt": "" } }`).
4. **Channel & Message IDs:**
   - Channel ID: strictly slugified ASCII (`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`).
   - Message ID: RFC-4122 UUID (`z.uuid()`).

### 5.2. Cross-Site Scripting (XSS) Defenses
1. **React Output Escaping:** All user-supplied text (usernames, message content, channel names) is rendered strictly as child text nodes (`{message.text}`).
2. **Zero `dangerouslySetInnerHTML`:** Forbidden across the entire codebase. Enforced by ESLint rule `react/no-danger: "error"`.
3. **Safe Mention Parsing:** `parseMentions(text)` splits text by validated usernames and returns structured React elements (`<span>` and text nodes), **never** HTML strings.
4. **No Raw HTML in Attributes:** User text is never bound to `href`, `src`, or event handlers.
5. **Content Security Policy (CSP):** Documented and implemented in client deployment configuration (Vercel/Netlify headers) restricting script execution to self.

### 5.3. Injection Prevention (SQL, NoSQL, Prototype Pollution)
1. **SQL Injection:** Not applicable because persistence is in-memory; no database engine or SQL interpreter is connected.
2. **Prototype Pollution:** Data is stored in JavaScript `Map` instances (`channels = new Map()`, `messages = new Map()`), never in plain object properties keyed by user strings. Keys like `__proto__`, `constructor`, and `toString` do not pollute object prototypes.
3. **NoSQL / Object Injection:** Zod schemas enforce primitive string types.

### 5.4. Server Hardening & Abuse Mitigation
1. **Rate Limiting:** In-memory sliding/fixed window per connected socket:
   - `message:send`: 5 per 5 seconds.
   - `message:like`: 20 per 10 seconds.
   - `channel:create`: 3 per 60 seconds.
   - `channel:join`: 20 per 10 seconds.
   Exceeding limits emits `chat:error` (`code: "RATE_LIMITED"`).
2. **Resource Caps:**
   - Max 25 channels total.
   - Max 200 messages retained per channel (FIFO drop).
   - Socket HTTP buffer capped at `10,000` bytes (`maxHttpBufferSize`).
3. **Error Shielding:** Catch blocks prevent uncaught exceptions from crashing Node.js; clients receive generic sanitized messages (`INVALID_INPUT`, `RATE_LIMITED`, `NOT_FOUND`, `SERVER_ERROR`), while detailed errors log only to server console.
4. **Helmet:** Express server uses `helmet()` to set secure HTTP headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, removal of `X-Powered-By`).

## 6. Test-Driven Development (TDD) Strategy

Every development phase follows the strict **Red → Green → Refactor** cycle:

```
┌────────────────────────────────────────────────────────┐
│ 1. RED: Write test asserting requirement               │
│    -> Run test runner -> Test FAILS as expected        │
├────────────────────────────────────────────────────────┤
│ 2. GREEN: Write minimal implementation code            │
│    -> Run test runner -> Test PASSES                   │
├────────────────────────────────────────────────────────┤
│ 3. REFACTOR: Clean up code, enforce tokens/security    │
│    -> Re-run tests -> Ensure all tests STAY GREEN      │
└────────────────────────────────────────────────────────┘
```

### Test Categories
1. **Unit Tests (Red → Green):**
   - Utility functions (`formatTime`, `parseMentions`, `slugify`).
   - Zod validation schemas (`schemas.test.js`).
   - State management (`chatReducer.test.js`).
2. **Component Tests (Red → Green):**
   - `ChatInput`: typing, character counter visibility at 450 chars, error alert rendering, submission blocking for empty/invalid input.
   - `LikeButton`: renders initial count, clicks fire callback, accessible label reflects count.
   - `MessageItem`: displays avatar initials, timestamp, safe text, like button at right end.
   - `AddChannelForm`: validates input, shows inline error, keyboard shortcuts (Enter/Esc).
   - `Sidebar` & `ChatHeader`: active channel styling, channel switching callback.
3. **Integration Tests (Red → Green):**
   - Client Chat Context integration: sending message updates active channel thread with random author and 0 likes.
   - Server Socket integration (`index.test.js`): multi-client socket.io tests verifying room isolation, event emission, rate limits, and Zod validation failures.

## 7. Socket.io Contract (11 Events)

The server is the authoritative source for message IDs, timestamps, random usernames, and like counts.

| # | Direction | Event | Payload | Description |
|---|---|---|---|---|
| 1 | server → client | `channels:list` | `Channel[]` | Sent on connection |
| 2 | server → all | `presence:count` | `number` | Broadcast on connection/disconnection |
| 3 | client → server | `channel:join` | `{ channelId }` | Client switches room |
| 4 | server → client | `messages:history` | `{ channelId, messages }` | Sent in response to `channel:join` |
| 5 | client → server | `message:send` | `{ channelId, text }` | Client posts message |
| 6 | server → room | `message:new` | `Message` | Broadcast to channel room |
| 7 | client → server | `message:like` | `{ channelId, messageId }` | Client likes a message |
| 8 | server → room | `message:updated` | `{ channelId, messageId, likes }` | Broadcast to channel room |
| 9 | client → server | `channel:create` | `{ name }` + ack callback | Creates channel with ack `{ ok, channel }` or `{ ok: false, error }` |
| 10 | server → all | `channels:updated` | `Channel[]` | Broadcast to all clients |
| 11 | server → client | `chat:error` | `{ code, message }` | Sent when an action fails validation or rate limiting |

## 8. Out of Scope
Authentication, custom usernames, persistent SQL/NoSQL database, message editing/deletion, unlike feature, unread badges, channel deletion/renaming, file uploads, typing indicators.
