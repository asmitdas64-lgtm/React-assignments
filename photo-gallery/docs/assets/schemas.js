// Zod validation schemas (zod v4). Single source of truth for input & API validation.
// Copy this file to:
//   - client/src/validation/schemas.js -> change constants import to "../constants/gallery.js"
//
// Security notes:
// - Validation != HTML escaping. React escapes text on output. Never use dangerouslySetInnerHTML.
// - URL sanitization: ensure download_url and url start strictly with https:// and belong to trusted domains.
// - External API payloads are strictly validated before being injected into state.

import { z } from "zod";
import { MAX_ALLOWED_PAGES } from "./constants.js";

// Invisible / dangerous control characters removed from author strings
// eslint-disable-next-line no-control-regex
const UNSAFE_CHARS = /[\u0000-\u001F\u007F-\u009F\u200B\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

const cleanAuthor = (value) => (typeof value === "string" ? value.replace(UNSAFE_CHARS, "").trim() : "");

// Allowed image hostnames
const ALLOWED_IMAGE_HOSTS = ["picsum.photos", "fastly.picsum.photos", "images.unsplash.com", "unsplash.com"];

const isValidHttpsImageUrl = (urlStr) => {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "https:") return false;
    return ALLOWED_IMAGE_HOSTS.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
};

// ---------- Single Photo Schema ----------
export const photoIdSchema = z
  .union([z.string(), z.number()])
  .transform((val) => String(val).trim())
  .pipe(z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/, "Invalid photo ID"));

export const photoAuthorSchema = z
  .string({ error: "Author must be text" })
  .transform(cleanAuthor)
  .pipe(z.string().min(1, "Author name cannot be empty").max(100, "Author name is too long"));

export const safeImageUrlSchema = z
  .string({ error: "Image URL must be a valid string" })
  .min(10)
  .max(2000)
  .refine(isValidHttpsImageUrl, {
    message: "Image URL must be a valid secure HTTPS URL from trusted photography hosts",
  });

export const photoItemSchema = z.strictObject({
  id: photoIdSchema,
  author: photoAuthorSchema,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  url: z.string().url().max(2000),
  download_url: safeImageUrlSchema,
});

// ---------- Feed List Schema ----------
export const photoFeedSchema = z.array(photoItemSchema).max(100);

// ---------- Pagination Query Schema ----------
export const paginationQuerySchema = z.strictObject({
  page: z.number().int().min(1).max(MAX_ALLOWED_PAGES),
  limit: z.number().int().min(1).max(100).default(10),
});

// ---------- Like Action Schema ----------
export const likeActionSchema = z.strictObject({
  photoId: photoIdSchema,
  increment: z.number().int().positive().default(1),
});
