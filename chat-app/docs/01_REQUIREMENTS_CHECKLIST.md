# 01 · Requirements Checklist

Source: take-home assignment brief (UI Internship).

**Scope decision:** to make the submission stand out, **all stretch goals, the sidebar, and a security layer are now mandatory** for this project.

Tags:
- **[CORE]** = Basic Task from the brief (graded first; must never break)
- **[CORE+]** = Stretch goal from the brief, **promoted to mandatory**
- **[SIDEBAR]** = Sidebar from the reference image (brief said optional; **now mandatory**)
- **[SECURITY]** = Security hardening (added by us; **mandatory**): Zod validation, XSS prevention, abuse limits
- **[QUALITY]** = not in brief, but expected by reviewers

> Build order still matters: **[CORE] first → [SIDEBAR] → [CORE+]**, with **[SECURITY] built into each phase** (not bolted on at the end). A reviewer opens the app expecting the basic task, so it must work perfectly before extras are added.

---

## A. Basic Task — [CORE]

### A1. Application shape
- [ ] **[CORE]** Built with **ReactJS**
- [ ] **[CORE]** **Single Page Application** (one screen; switching channels changes state, not routes)
- [ ] **[CORE]** Layout = **sidebar (left)** + **chat panel (right)** with message thread and input box (as in reference image)

### A2. Chat input
- [ ] **[CORE]** A **textbox** to type the message
- [ ] **[CORE]** A **Send button** (must exist even though the reference image doesn't show one)
- [ ] **[CORE]** Clicking **Send** posts the message
- [ ] **[QUALITY]** Pressing **Enter** also sends (unless the mention list is open)
- [ ] **[QUALITY]** Empty / whitespace-only messages are **not** sent (button disabled or no-op)
- [ ] **[QUALITY]** Input is cleared and re-focused after sending
- [ ] **[SECURITY]** Text validated with `messageTextSchema` (Zod) before sending: invisible/control chars stripped, trimmed, 1–500 chars; input has `maxLength={500}`
- [ ] **[QUALITY]** Character counter `n/500` appears from 450 chars; validation errors shown inline under the input (`role="alert"`)

### A3. Message thread
- [ ] **[CORE]** Sent message is shown **above the textbox** (thread on top, input pinned at bottom)
- [ ] **[QUALITY]** Newest message at the **bottom**; thread **auto-scrolls** to latest
- [ ] **[QUALITY]** Empty-state text when a channel has no messages
- [ ] **[QUALITY]** Long words / URLs wrap and don't break the layout
- [ ] **[SECURITY]** Message text rendered only as React text children (no `dangerouslySetInnerHTML` / `innerHTML`) → `<script>` / `<img onerror>` show as plain text

### A4. Random username
- [ ] **[CORE]** Each message gets a **randomly assigned username** from exactly:
  ```js
  const user_list = ["Alan", "Bob", "Carol", "Dean", "Elin"]
  ```
- [ ] **[CORE]** Random pick happens **per message** (not once per session)
- [ ] **[QUALITY]** Avatar circle with user's **initials** + a **consistent color per user** (matches reference)
- [ ] **[QUALITY]** Timestamp (`HH:mm`) next to username (matches reference)

### A5. Like button
- [ ] **[CORE]** **Every message** has a **like button**
- [ ] **[CORE]** Like button is at the **right end** of the chat message
- [ ] **[CORE]** Clicking it **increases the count**
- [ ] **[CORE]** **Count is displayed next to** the like button
- [ ] **[QUALITY]** Likes are per-message (liking one doesn't change others)
- [ ] **[QUALITY]** Count starts at `0`; accessible label e.g. `aria-label="Like message, 3 likes"`

---

## B. Sidebar — [SIDEBAR] (now mandatory)

### B1. Profile card (top of sidebar)
- [ ] **[SIDEBAR]** Large avatar circle (56px) with initials of `CURRENT_USER` + **status dot**
- [ ] **[SIDEBAR]** Display name + role under it, from `CURRENT_USER` in `constants/users.js` (`"Asmit Das"`, `"UI Engineering Intern"`)
- [ ] **[SIDEBAR]** Profile is **display-only**: it does **not** change message authorship (messages still get a random name from `user_list`)
- [ ] **[SIDEBAR]** Status dot: **green** = connected to server · **amber** = connecting · **gray** = offline / local mode (before Phase 9, it shows gray "local mode")

### B2. Conversations list
- [ ] **[SIDEBAR]** "Conversations" heading with a **"+" (add) button**
- [ ] **[SIDEBAR]** Channel items with `#` icon tile + name, seeded from `SEED_CHANNELS`: **Poland Office**, **Introductions**, **India Office** (in that order)
- [ ] **[SIDEBAR]** **Introductions** is active on load (`DEFAULT_CHANNEL_ID = "introductions"`)
- [ ] **[SIDEBAR]** **Active channel highlighted** (blue full-width row, as in reference)
- [ ] **[SIDEBAR]** Clicking a channel **switches the thread** — each channel has its **own messages and likes**
- [ ] **[SIDEBAR]** "+" shows an **inline input** at the top of the list to **create a new channel**: Enter = create, Esc / blur-when-empty = cancel
- [ ] **[SECURITY]** Channel name validated with `channelNameSchema` (Zod): trimmed, spaces collapsed, 1–30 chars, ASCII letters/numbers/space/`-`/`_`, must start with a letter or number; input has `maxLength={30}`
- [ ] **[SIDEBAR]** Name must be **unique by slug** (`slugify(name)`, so "India Office" and "india-office" collide → "Channel already exists"); show the first Zod error inline otherwise
- [ ] **[SIDEBAR]** New channel is appended to the list and becomes active
- Out of scope: unread badges, deleting/renaming channels

### B3. Chat header (top of chat panel)
- [ ] **[SIDEBAR]** Shows **active channel name** + **description** (Introductions → "This Channel Is For Company Wide Chatter")
- [ ] **[SIDEBAR]** Right side: `online | members` + users icon, where **online** = `presence:count` from server (`1` in local mode) and **members** = `user_list.length` (5)
- [ ] **[SIDEBAR]** 1px divider under header

### B4. Responsive sidebar
- [ ] **[SIDEBAR]** Desktop (≥ 900px): sidebar fixed ~300px wide, always visible
- [ ] **[SIDEBAR]** Mobile/tablet (< 900px): sidebar hidden → **hamburger** in chat header opens it as a **slide-in drawer** with backdrop
- [ ] **[SIDEBAR]** Drawer closes on channel select, backdrop click, or `Esc`

---

## C. Emoji Picker — [CORE+] (promoted)
- [ ] **[CORE+]** Smiley icon inside the input (right side, as in reference)
- [ ] **[CORE+]** Click opens an **emoji picker** (dark emoji-mart style: category tabs, search, "Frequently Used", "Smileys & People")
- [ ] **[CORE+]** Selecting an emoji **inserts it at the caret position** in the input
- [ ] **[CORE+]** Picker closes on outside click / `Esc`
- [ ] **[CORE+]** Emojis render correctly inside sent messages

## D. Mentions (@) — [CORE+] (promoted)
- [ ] **[CORE+]** Typing **`@`** opens a **list of users** from `user_list`
- [ ] **[CORE+]** List **filters** as you type after `@` (e.g. `@ca` → Carol)
- [ ] **[CORE+]** Select via **click** or **↑ / ↓ + Enter/Tab**; `Esc` closes
- [ ] **[CORE+]** Selection inserts `@Name ` into the input
- [ ] **[CORE+]** Mentions are **highlighted** in rendered messages (built from React elements, no HTML strings)
- [ ] **[CORE+]** Enter selects mention (does **not** send) while list is open

## E. WebSocket Server (Express + socket.io) — [CORE+] (promoted)
- [ ] **[CORE+]** Separate **Express.js** server with **socket.io**
- [ ] **[CORE+]** Client connects with **socket.io-client**
- [ ] **[CORE+]** Event contract exactly as in `02_PROJECT_CONTEXT.md §8` (**11 events**; no extra/renamed events)
- [ ] **[CORE+]** **Publish/subscribe**: client emits `message:send` → server publishes `message:new` to that channel's room
- [ ] **[CORE+]** Likes synced: `message:like` → server publishes `message:updated` to that channel's room
- [ ] **[CORE+]** **Channels = socket.io rooms**: client emits `channel:join`; server leaves the previous room and joins the new one, then replies `messages:history`
- [ ] **[CORE+]** Channel list synced: `channel:create` (with ack) → server broadcasts `channels:updated` to everyone
- [ ] **[CORE+]** On connect, server sends `channels:list`; online count broadcast as `presence:count`
- [ ] **[CORE+]** Verified with **two browser tabs** in real time (messages, likes, new channels)
- [ ] **[QUALITY]** Connection status indicator (connected / reconnecting / offline)
- [ ] **[QUALITY]** App still works in **local mode** if the server is down (all [CORE] + [SIDEBAR] features work without the server)
- [ ] **[QUALITY]** Server errors (`chat:error`) shown inline under the input and auto-hidden after 4s

---

## F. Security — [SECURITY] (mandatory)
Full model: `02_PROJECT_CONTEXT.md §13`. Schemas: `docs/assets/schemas.js`.

### F1. Input validation (Zod)
- [ ] **[SECURITY]** `zod` v4 installed in **client and server**; schemas from `docs/assets/schemas.js` copied to `client/src/validation/schemas.js` and `server/schemas.js` (only the constants import line differs)
- [ ] **[SECURITY]** Client validates **before** sending (message text, channel name) and shows the first error
- [ ] **[SECURITY]** Server validates **every** incoming socket payload with `safeParse` (never trusts the client); invalid → `chat:error { code: "INVALID_INPUT" }` (or ack error for `channel:create`)
- [ ] **[SECURITY]** Payload schemas use `z.strictObject` → unknown keys rejected (`{ text, username: "Alan" }` fails), and non-strings rejected (`{ text: { "$gt": "" } }` fails)
- [ ] **[SECURITY]** Server builds `id`, `username`, `timestamp`, `likes` itself; client-sent values for these are never accepted
- [ ] **[SECURITY]** `channelId` must match the slug regex **and** exist; `messageId` must be a UUID **and** exist in that channel → otherwise `NOT_FOUND`
- [ ] **[SECURITY]** Client also validates **incoming server data** (`messageSchema`, `channelListSchema`, …) and drops anything invalid (defense in depth)

### F2. XSS prevention
- [ ] **[SECURITY]** No `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function` anywhere
- [ ] **[SECURITY]** ESLint enforces it: `react/no-danger: "error"`, `no-eval`, `no-implied-eval`, `no-new-func` (via `eslint-plugin-react`)
- [ ] **[SECURITY]** User text never placed in `href`, `src`, `style` or event attributes; URLs are **not** auto-linked
- [ ] **[SECURITY]** Avatar color comes from the `AVATAR_COLORS` lookup keyed by a validated `username` (enum), never from user input
- [ ] **[SECURITY]** No HTML escaping on input (it would double-encode); React escapes on output (decision documented in README)
- [ ] **[SECURITY]** Production **Content-Security-Policy** + security headers on the client host (`client/vercel.json`, see `02 §13`)

### F3. Injection (SQL / NoSQL / prototype pollution)
- [ ] **[SECURITY]** **SQL injection: not applicable by design.** No database and no query strings; data lives in in-memory `Map`s. Documented in README with "if a DB is added: parameterized queries only"
- [ ] **[SECURITY]** NoSQL/operator injection blocked by strict Zod schemas (only primitive strings in the defined shape)
- [ ] **[SECURITY]** Prototype pollution blocked: server and client store channels/messages in `Map`s (not plain objects keyed by user input), so keys like `constructor` are harmless; the name/slug regexes also reject `__proto__`
- [ ] **[SECURITY]** Text like `'; DROP TABLE users; --` is stored and shown as harmless text (test case)

### F4. Server hardening (Express + socket.io)
- [ ] **[SECURITY]** `helmet()` on Express (security headers, hides `X-Powered-By`)
- [ ] **[SECURITY]** CORS restricted to `CLIENT_ORIGIN` for **both** Express (`cors`) and socket.io; socket.io `allowRequest` rejects other `Origin` headers
- [ ] **[SECURITY]** socket.io `maxHttpBufferSize: 10_000` bytes (oversized payloads dropped)
- [ ] **[SECURITY]** Per-socket **rate limiting** (`RATE_LIMITS` in constants): send 5/5s, like 20/10s, create 3/60s, join 20/10s → `chat:error { code: "RATE_LIMITED" }`
- [ ] **[SECURITY]** Memory caps: max **25 channels**, max **200 messages per channel** (oldest dropped)
- [ ] **[SECURITY]** Every socket handler wrapped in try/catch; clients only get a generic `SERVER_ERROR` message (no stack traces); details logged on the server
- [ ] **[SECURITY]** Rate-limit state cleaned up on `disconnect` (no memory leak)

### F5. Secrets & dependencies
- [ ] **[SECURITY]** `.env` files git-ignored; only `.env.example` committed; no secrets in `VITE_*` vars (they are public in the bundle)
- [ ] **[SECURITY]** Lockfiles committed; `npm audit` shows **0 high/critical** in client and server before submission

### F6. Security test cases (all must pass, record results in README)
- [ ] Send `<script>alert(1)</script>` and `<img src=x onerror=alert(1)>` → shown as text, no alert
- [ ] Send `'; DROP TABLE users; --` → shown as text
- [ ] Send 501 chars (bypass `maxLength` via DevTools) → rejected client-side and server-side
- [ ] Send only `\u202E\u200B` (invisible chars) → rejected as empty
- [ ] Create channels `__proto__`, `<b>x</b>`, `"   "` → rejected with an inline error
- [ ] From the DevTools console emit `message:send` with `{ channelId: "introductions", text: "hi", username: "Alan" }` → rejected (`INVALID_INPUT`)
- [ ] Spam Send 10× quickly with the server on → `RATE_LIMITED` error shown, server keeps running
- [ ] Like a non-existent messageId → `NOT_FOUND`, nothing changes
- [ ] **[QUALITY]** CORS configured for the client origin (details in F4)

---

## G. Submission Quality
- [ ] **[QUALITY]** UI visually matches **both** reference images (sidebar, header, bubbles, avatars, pill input, emoji picker)
- [ ] **[QUALITY]** Responsive from 360px mobile up to desktop
- [ ] **[QUALITY]** Keyboard accessible, visible focus states, semantic HTML (`<aside>`, `<nav>`, `<main>`)
- [ ] **[QUALITY]** Clean component structure, no console errors/warnings
- [ ] **[QUALITY]** ESLint passes
- [ ] **[QUALITY]** `README.md`: setup, run commands, feature list, screenshots/GIF, **note that the sidebar, stretch goals and security layer were added beyond the brief**, plus a **Security** section (threat → mitigation table + F6 test results)
- [ ] **[QUALITY]** Meaningful git commit history (one commit per phase is fine)
- [ ] **[QUALITY]** Deployed demo link (Vercel/Netlify for client; Render/Railway for server)
