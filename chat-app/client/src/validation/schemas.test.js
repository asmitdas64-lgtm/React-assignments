import { describe, it, expect } from 'vitest';
import {
  messageTextSchema,
  channelNameSchema,
  messageSendSchema,
  messageSchema,
  firstError,
} from './schemas.js';

describe('Validation Schemas (Zod v4)', () => {
  describe('messageTextSchema', () => {
    it('accepts valid text and trims whitespace', () => {
      const res = messageTextSchema.safeParse('  Hello world!  ');
      expect(res.success).toBe(true);
      expect(res.data).toBe('Hello world!');
    });

    it('preserves emoji with ZWJ sequences', () => {
      const res = messageTextSchema.safeParse('👨‍👩‍👧 Family emoji');
      expect(res.success).toBe(true);
      expect(res.data).toBe('👨‍👩‍👧 Family emoji');
    });

    it('rejects empty or whitespace-only messages', () => {
      const res = messageTextSchema.safeParse('    ');
      expect(res.success).toBe(false);
      expect(firstError(res)).toMatch(/empty/i);
    });

    it('strips invisible/dangerous control characters and rejects if empty', () => {
      const res = messageTextSchema.safeParse('\u202E\u200B');
      expect(res.success).toBe(false);
    });

    it('rejects messages longer than 500 characters', () => {
      const longText = 'a'.repeat(501);
      const res = messageTextSchema.safeParse(longText);
      expect(res.success).toBe(false);
      expect(firstError(res)).toMatch(/500 characters/i);
    });

    it('allows text containing harmless HTML/SQL characters as pure text', () => {
      const res = messageTextSchema.safeParse("<script>alert('xss')</script> '; DROP TABLE;");
      expect(res.success).toBe(true);
    });
  });

  describe('channelNameSchema', () => {
    it('accepts valid channel names and collapses multiple spaces', () => {
      const res = channelNameSchema.safeParse('  Design   Team  ');
      expect(res.success).toBe(true);
      expect(res.data).toBe('Design Team');
    });

    it('rejects channel names starting with special characters', () => {
      const res = channelNameSchema.safeParse('_Team');
      expect(res.success).toBe(false);
      expect(firstError(res)).toMatch(/Use letters, numbers/i);
    });

    it('rejects names longer than 30 characters', () => {
      const res = channelNameSchema.safeParse('A'.repeat(31));
      expect(res.success).toBe(false);
      expect(firstError(res)).toMatch(/30 characters/i);
    });
  });

  describe('Payload Strictness (Anti-Injection)', () => {
    it('rejects payloads with unexpected extra fields', () => {
      const res = messageSendSchema.safeParse({
        channelId: 'introductions',
        text: 'Hello',
        username: 'Alan', // Injected field
      });
      expect(res.success).toBe(false);
    });

    it('rejects payloads where text is an object/operator', () => {
      const res = messageSendSchema.safeParse({
        channelId: 'introductions',
        text: { $gt: '' }, // NoSQL style injection
      });
      expect(res.success).toBe(false);
    });
  });

  describe('messageSchema (Server to Client data)', () => {
    it('validates a correct message object', () => {
      const validMsg = {
        id: crypto.randomUUID(),
        channelId: 'introductions',
        text: 'Welcome!',
        username: 'Bob',
        timestamp: Date.now(),
        likes: 0,
      };
      const res = messageSchema.safeParse(validMsg);
      expect(res.success).toBe(true);
    });

    it('rejects an unauthorized username outside user_list', () => {
      const invalidMsg = {
        id: crypto.randomUUID(),
        channelId: 'introductions',
        text: 'Welcome!',
        username: 'Mallory', // Not in ["Alan", "Bob", "Carol", "Dean", "Elin"]
        timestamp: Date.now(),
        likes: 0,
      };
      const res = messageSchema.safeParse(invalidMsg);
      expect(res.success).toBe(false);
    });
  });
});
