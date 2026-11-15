# 03 · UI Design Spec (Faithful to Reference Image)

Reference image: `docs/assets/reference/photo-gallery.jpg`

All design parameters, spatial proportions, and colors are extracted directly from the reference image and maintained as CSS custom properties in `docs/assets/design-tokens.css`. Never use hard-coded hex colors in components.

---

## 1. Visual Layout Wireframe (Exact Match to `photo-gallery.jpg`)

```
                                              Photo gallery          ← Serif bold heading
                                              
┌──────────────────┐
│                  │
│  PHOTO THUMBNAIL │   Author: Vadim Sherbakov  👍 0                 ← Row 1
│    (240 × 160)   │
└──────────────────┘

┌──────────────────┐
│                  │
│  PHOTO THUMBNAIL │   Author: Alex  👍 0                            ← Row 2
│    (240 × 160)   │
└──────────────────┘

┌──────────────────┐
│                  │
│  PHOTO THUMBNAIL │   Author: Daniel Genser  👍 0                   ← Row 3
│    (240 × 160)   │
└──────────────────┘

┌──────────────────┐
│                  │
│  PHOTO THUMBNAIL │   Author: Justin Leibow  👍 0                   ← Row 4
│    (240 × 160)   │
└──────────────────┘

┌──────────────────┐
│                  │
│  PHOTO THUMBNAIL │   Author: Alexander Shustov  👍 0               ← Row 5
│    (240 × 160)   │
└──────────────────┘

┌──────────────────┐
│ [Skeleton/Loader]│   Loading more photographs…                     ← Infinite Scroll Sentinel
└──────────────────┘
```

---

## 2. Visual Hierarchy & Proportions

### 2.1. App Heading ("Photo gallery")
- **Text:** "Photo gallery" (exact capitalization from screenshot).
- **Font Family:** `Georgia, "Times New Roman", Times, serif` (`--font-family-heading`).
- **Font Size:** `32px` (`--fs-title`), font-weight: `700` (`--fw-bold`), color: `#000000`.
- **Placement:** Placed at the top with generous top and bottom spacing (`margin-bottom: 32px`).

### 2.2. Photo Item Row (`.gallery-item-row`)
- **Structure:** 1-column list where each item is rendered as a clean horizontal flexbox row:
  - **Left element:** Photo thumbnail.
  - **Right element:** Inline group containing `"Author: {author}"`, the FontAwesome thumbs-up icon, and the counter.
- **Display:** `display: flex; align-items: center; gap: 16px; margin-bottom: 24px;`
- **Background:** Clean transparent / white (`--bg-row: #ffffff`).

### 2.3. Photo Thumbnail (`.photo-thumbnail`)
- **Dimensions:** Width `240px`, Height `160px` (`aspect-ratio: 3 / 2`).
- **Image Styling:** `width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 2px;`
- **Zero CLS (Cumulative Layout Shift):** Container reserves `240px × 160px` with a neutral skeleton placeholder background (`#f1f3f5`) while image bytes download.
- **Fade-in Transition:** Smooth `opacity: 0` → `opacity: 1` (`transition: opacity 250ms ease`) on image `onLoad`.

### 2.4. Author & Thumbs-Up Group (`.item-meta`)
- **Display:** `display: inline-flex; align-items: center; gap: 10px;`
- **Author Text (`.author-text`):**
  - Prefix: `"Author: "`
  - Font: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` (`--font-family-body`).
  - Size: `15px` (`--fs-author`), color: `#212529` (`--text-author`), font-weight: `400`.
- **Thumbs-Up Button (`.thumbs-up-button`):**
  - Semantic `<button type="button">` with zero border and transparent background by default.
  - Cursor: `pointer`, display: `inline-flex; align-items: center; gap: 6px;`.
  - Icon: FontAwesome solid thumbs up icon (`faThumbsUp`).
  - Color: Classic social blue `#1877f2` (`--thumbs-up-blue`), size `18px`.
  - Hover: Subtle background highlight (`rgba(24, 119, 242, 0.08)`) with `border-radius: 4px`.
  - Click Micro-Interaction: Triggers bounce animation:
    ```css
    @keyframes thumbs-bounce {
      0% { transform: scale(1); }
      35% { transform: scale(1.35) rotate(-12deg); }
      70% { transform: scale(0.92) rotate(4deg); }
      100% { transform: scale(1) rotate(0deg); }
    }
    ```
- **Like Count (`.thumbs-up-count`):**
  - Font size: `15px` (`--fs-count`), font-weight: `700`, color: `#1877f2`.
  - Starts initialized at `0`.
  - Increments by `+1` on every click without limit.

---

## 3. Responsive Adaptations

| Viewport Width | Layout Adjustment | Thumbnail Size |
| :--- | :--- | :--- |
| **Desktop (≥ 768px)** | Horizontal flex row (matches screenshot) | `240px × 160px` |
| **Tablet (480px – 767px)** | Horizontal flex row | `200px × 133px` |
| **Mobile (< 480px)** | Stacks thumbnail on top, author + thumbs-up below | Full width (`aspect-ratio: 3 / 2`) |

---

## 4. Accessibility & Semantics

- **Feed Container:** `role="feed"`, `aria-label="Photo gallery feed"`.
- **Articles:** `<article class="gallery-item-row" aria-label="Photo by {author}">`.
- **Image:** `<img src="..." alt="Photograph by {author}" loading="lazy" />`.
- **Thumbs-Up Button:**
  - `aria-label="Thumbs up photo by {author}. Currently {count} likes"`.
  - Visible keyboard focus ring: `:focus-visible { outline: 2px solid var(--thumbs-up-blue); outline-offset: 2px; }`.
