import { describe, it, expect } from 'vitest';
import {
  photoIdSchema,
  photoAuthorSchema,
  safeImageUrlSchema,
  photoItemSchema,
  photoFeedSchema,
  paginationQuerySchema,
  likeActionSchema,
} from './schemas.js';

describe('Validation Schemas (Zod v4)', () => {
  describe('photoIdSchema', () => {
    it('accepts string IDs', () => {
      expect(photoIdSchema.parse('10')).toBe('10');
      expect(photoIdSchema.parse('photo_123-abc')).toBe('photo_123-abc');
    });

    it('transforms numeric IDs to strings', () => {
      expect(photoIdSchema.parse(42)).toBe('42');
    });

    it('rejects empty, whitespace-only, or illegal IDs', () => {
      expect(() => photoIdSchema.parse('')).toThrow();
      expect(() => photoIdSchema.parse('   ')).toThrow();
      expect(() => photoIdSchema.parse('id with spaces')).toThrow();
      expect(() => photoIdSchema.parse('id<script>')).toThrow();
    });
  });

  describe('photoAuthorSchema', () => {
    it('cleans and trims valid author strings', () => {
      expect(photoAuthorSchema.parse('  Alejandro Escamilla  ')).toBe('Alejandro Escamilla');
    });

    it('strips invisible and dangerous control characters', () => {
      const contaminated = 'Vadim\u0000\u200B Sherbakov\uFEFF';
      expect(photoAuthorSchema.parse(contaminated)).toBe('Vadim Sherbakov');
    });

    it('rejects empty or whitespace-only author names', () => {
      expect(() => photoAuthorSchema.parse('')).toThrow();
      expect(() => photoAuthorSchema.parse('   ')).toThrow();
    });

    it('rejects non-string values', () => {
      expect(() => photoAuthorSchema.parse(12345)).toThrow();
      expect(() => photoAuthorSchema.parse(null)).toThrow();
    });
  });

  describe('safeImageUrlSchema', () => {
    it('accepts valid HTTPS URLs from picsum.photos and fastly.picsum.photos', () => {
      const validPicsum = 'https://picsum.photos/id/0/5616/3744';
      const validFastly = 'https://fastly.picsum.photos/id/10/2500/1667.jpg?hmac=J04WfyGtDuEm2akawMfUh4BpGExQlubaeLh9o3dPXyo';
      expect(safeImageUrlSchema.parse(validPicsum)).toBe(validPicsum);
      expect(safeImageUrlSchema.parse(validFastly)).toBe(validFastly);
    });

    it('accepts valid HTTPS URLs from unsplash.com', () => {
      const validUnsplash = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085';
      expect(safeImageUrlSchema.parse(validUnsplash)).toBe(validUnsplash);
    });

    it('rejects insecure HTTP URLs', () => {
      expect(() => safeImageUrlSchema.parse('http://picsum.photos/id/0/5616/3744')).toThrow();
    });

    it('rejects malicious or non-whitelisted domains', () => {
      expect(() => safeImageUrlSchema.parse('https://evil-site.com/image.jpg')).toThrow();
      expect(() => safeImageUrlSchema.parse('javascript:alert(1)')).toThrow();
      expect(() => safeImageUrlSchema.parse('data:image/png;base64,iVBORw0KGgo=')).toThrow();
    });
  });

  describe('photoItemSchema', () => {
    const validItem = {
      id: '0',
      author: 'Alejandro Escamilla',
      width: 5616,
      height: 3744,
      url: 'https://unsplash.com/photos/yC-YDelHvfQ',
      download_url: 'https://picsum.photos/id/0/5616/3744',
    };

    it('successfully parses a valid Picsum photo item', () => {
      const parsed = photoItemSchema.parse(validItem);
      expect(parsed).toEqual(validItem);
    });

    it('rejects items missing required fields', () => {
      const missingAuthor = { ...validItem };
      delete missingAuthor.author;
      expect(() => photoItemSchema.parse(missingAuthor)).toThrow();
    });

    it('rejects items with invalid dimensions', () => {
      expect(() => photoItemSchema.parse({ ...validItem, width: -100 })).toThrow();
      expect(() => photoItemSchema.parse({ ...validItem, height: 0 })).toThrow();
    });

    it('rejects unknown or injected properties (strictObject defense)', () => {
      const contaminated = { ...validItem, __proto__: { admin: true }, injected: 'payload' };
      expect(() => photoItemSchema.parse(contaminated)).toThrow();
    });
  });

  describe('photoFeedSchema', () => {
    const validItems = [
      {
        id: '1',
        author: 'Alejandro Escamilla',
        width: 5616,
        height: 3744,
        url: 'https://unsplash.com/photos/LNRyGwIJr5c',
        download_url: 'https://picsum.photos/id/1/5616/3744',
      },
      {
        id: '2',
        author: 'Paul Jarvis',
        width: 2500,
        height: 1667,
        url: 'https://unsplash.com/photos/KRefDhhvEnc',
        download_url: 'https://picsum.photos/id/2/2500/1667',
      },
    ];

    it('successfully validates an array of photo items', () => {
      expect(photoFeedSchema.parse(validItems)).toHaveLength(2);
    });

    it('accepts an empty array (end of feed representation)', () => {
      expect(photoFeedSchema.parse([])).toEqual([]);
    });

    it('rejects feeds where any item is invalid', () => {
      const corruptFeed = [...validItems, { id: '3', author: '' }];
      expect(() => photoFeedSchema.parse(corruptFeed)).toThrow();
    });
  });

  describe('paginationQuerySchema', () => {
    it('parses valid page and limit', () => {
      expect(paginationQuerySchema.parse({ page: 1, limit: 10 })).toEqual({ page: 1, limit: 10 });
    });

    it('applies default limit when omitted', () => {
      expect(paginationQuerySchema.parse({ page: 2 })).toEqual({ page: 2, limit: 10 });
    });

    it('rejects non-positive pages or pages exceeding MAX_ALLOWED_PAGES', () => {
      expect(() => paginationQuerySchema.parse({ page: 0 })).toThrow();
      expect(() => paginationQuerySchema.parse({ page: -5 })).toThrow();
      expect(() => paginationQuerySchema.parse({ page: 500 })).toThrow();
    });
  });

  describe('likeActionSchema', () => {
    it('parses valid photo ID and applies default increment', () => {
      expect(likeActionSchema.parse({ photoId: '10' })).toEqual({ photoId: '10', increment: 1 });
    });

    it('rejects negative or zero increment', () => {
      expect(() => likeActionSchema.parse({ photoId: '10', increment: 0 })).toThrow();
      expect(() => likeActionSchema.parse({ photoId: '10', increment: -1 })).toThrow();
    });
  });
});
