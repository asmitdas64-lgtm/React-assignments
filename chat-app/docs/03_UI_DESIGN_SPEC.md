# 03 · UI Design Spec (with Security & Validation States)

Reference images:
- `assets/reference/ref-chat-thread.jpg`: sidebar + header + thread + input
- `assets/reference/ref-emoji-picker.jpg`: emoji picker open

> Values are estimated from the screenshots and expanded to include security & validation UI states. All values exist as CSS variables in `assets/design-tokens.css`. Never use hard-coded hex colors in components.

## 1. Layout (desktop ≥ 900px)
```
┌───────────────────┬──────────────────────────────────────────────┐
│ (AD)• Asmit Das   │ Introductions                     1 | 5  👥  │  ← ChatHeader
│       UI Eng Intern│ This Channel Is For Company Wide Chatter     │
│                   │──────────────────────────────────────────────│  ← 1px divider
│ Conversations  (+)│                                              │
│                   │      (messages stack from the bottom)        │
│ [#] Poland Office │ (AL) Alan  12:16                             │
│▓[#] Introductions▓│      ┌────────────────────────┐       ♡ 3    │  ← like at RIGHT END
│ [#] India Office  │      │ Message bubble text    │              │
│                   │      └────────────────────────┘              │
│                   │                                              │
│                   │ [⚠ Message can't exceed 500 chars]   480/500 │  ← validation & counter
│                   │ ( Type a message…                 🙂 ) [Send]│  ← ChatInput
└───────────────────┴──────────────────────────────────────────────┘
   Sidebar 300px                 ChatPanel (flex: 1)
```

## 2. Security & Validation UI States

### 2.1. ChatInput Counter & Error Alerts
- **Character Counter (`.input-counter`):**
  - Hidden by default.
  - Appears when text length reaches `450` characters (`MESSAGE_COUNTER_THRESHOLD`).
  - Text size: `12px` (`--fs-xs`), color: `--text-secondary`.
  - When reaching `500` characters, color changes to `--danger` (`#E5484D`) with `font-weight: 500`.
- **Input Error Alert (`.input-alert`):**
  - Appears directly above the input pill if validation fails or server emits `chat:error`.
  - Background: `rgba(229, 72, 77, 0.1)`, border: `1px solid var(--danger)`, border-radius: `6px`.
  - Text: `13px` (`--fs-sm`), color: `--danger`, padding: `6px 12px`.
  - Accessible role: `role="alert"` (screen readers announce it immediately).
  - Auto-dismisses after 4 seconds or when user types valid characters.

### 2.2. AddChannelForm Validation States
- **Inline Error Alert (`.channel-error`):**
  - Displays below the input inside `AddChannelForm`.
  - Text size: `12px`, color: `--danger`, margin-top: `4px`.
  - Focus state on invalid input: border color `--danger` with `box-shadow: 0 0 0 3px rgba(229, 72, 77, 0.2)`.

### 2.3. Safe Rendering & Word Wrapping
- **Bubble Text Protection:**
  - `overflow-wrap: anywhere; word-break: break-word; white-space: pre-wrap;`
  - Long uninterrupted strings (e.g. 500 'A's or URLs) break naturally inside the bubble without stretching the chat layout or pushing the Like button offscreen.
  - Text rendered strictly via React text interpolation, preventing DOM injection.

## 3. Colors
| Token | Value | Usage |
|---|---|---|
| `--bg-app` | `#ECEEF2` | Chat panel background |
| `--bg-sidebar` | `#FFFFFF` | Sidebar |
| `--bg-bubble` | `#FFFFFF` | Message bubble |
| `--bg-input` | `#FFFFFF` | Input pill |
| `--bg-tile` | `#EEF0F4` | `#` channel icon tile |
| `--bg-hover` | `#F4F6F9` | Hover on sidebar rows |
| `--backdrop` | `rgba(0, 0, 0, 0.35)` | Mobile drawer backdrop |
| `--text-primary` | `#3D3D3D` | Names, message text, channel names |
| `--text-secondary` | `#8A8F98` | Timestamp, subtitles, placeholder, role |
| `--text-on-accent` | `#FFFFFF` | Text on buttons and active channel |
| `--border` | `#C9CDD4` | Header divider, input border, "+" circle |
| `--accent` | `#5B9BF0` | Active channel row, Send button, focus ring, mentions |
| `--accent-strong` | `#4A8BE6` | Icon tile on the active row, Send hover |
| `--like-active` | `#E5484D` | Like icon + count when likes > 0 |
| `--status-online` | `#8BC34A` | Status dot: connected |
| `--status-connecting` | `#F5A524` | Status dot: connecting |
| `--status-offline` | `#B0B5BD` | Status dot: offline / local mode |
| `--danger` | `#E5484D` | Validation errors and limit alerts |
| `--picker-bg` | `#222427` | Emoji picker (dark) |

## 4. Component Details & Accessibility

### ProfileCard
- 56px circle avatar (`--avatar-size-lg`) + status dot (12px circle with 2px white border).
- Status title: "Connected", "Connecting", "Offline (local mode)".

### LikeButton (REQUIRED, right end)
- Placed at the **far right end** of the message row (`margin-left: auto`), vertically aligned with the bubble.
- Min touch target 32×32px.
- Heart icon (18px) + count (13px) with 4px gap.
- Active count > 0 triggers `--like-active` fill. Pop animation on click (`transform: scale(1.25)`).
- Accessibility: `aria-label="Like message, {n} likes"`.

### ChatInput
- Pill input: 44px height, 999px radius, 1px border.
- Smiley button inside on the right (22px icon).
- **Send button (REQUIRED):** 44px pill button with accent background, white text + send icon.
- Disabled state: 50% opacity, `cursor: not-allowed` when input is empty or invalid.

### MentionList
- Popover positioned directly above the input, width 220px, white card with shadow.
- Highlighted row has background `--accent-soft`.
- Accessible listbox: `role="listbox"`, options `role="option"`, `aria-selected`.
- In-message styling: `<span className="mention">` with `--accent` color, 500 weight, and subtle soft blue background.

## 5. Responsive Behavior
- Desktop (≥ 900px): Sidebar 300px width fixed.
- Tablet / Mobile (< 900px): Sidebar transformed off-canvas (`transform: translateX(-100%)`). Header renders hamburger button (`aria-label="Open sidebar"`). Drawer animates in with backdrop.
- Small screens (≤ 600px): Chat padding reduces to 12px; Send button collapses to circular icon button (44×44px).
