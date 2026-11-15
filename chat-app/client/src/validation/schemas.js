import { z } from 'zod';
import {
  user_list,
  MAX_MESSAGE_LENGTH,
  MAX_CHANNEL_NAME_LENGTH,
} from '../constants/users.js';

// Invisible / dangerous characters removed from user text:
// C0 + C1 control chars, zero-width space, LRM/RLM, bidi embeddings/overrides/isolates, BOM.
// ZWJ (U+200D) and variation selectors are KEPT because emoji sequences need them.
// eslint-disable-next-line no-control-regex
const UNSAFE_CHARS = /[\u0000-\u001F\u007F-\u009F\u200B\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

const cleanText = (value) => value.replace(UNSAFE_CHARS, '').trim();

// ---------- Field schemas ----------

export const messageTextSchema = z
  .string({ error: 'Message must be text' })
  .max(MAX_MESSAGE_LENGTH * 4, 'Message is too long')
  .transform(cleanText)
  .pipe(
    z
      .string()
      .min(1, "Message can't be empty")
      .max(MAX_MESSAGE_LENGTH, `Message can't exceed ${MAX_MESSAGE_LENGTH} characters`)
  );

export const channelNameSchema = z
  .string({ error: 'Channel name must be text' })
  .max(100, 'Channel name is too long')
  .transform((value) => cleanText(value).replace(/\s+/g, ' '))
  .pipe(
    z
      .string()
      .min(1, 'Channel name is required')
      .max(
        MAX_CHANNEL_NAME_LENGTH,
        `Channel name can't exceed ${MAX_CHANNEL_NAME_LENGTH} characters`
      )
      .regex(
        /^[A-Za-z0-9][A-Za-z0-9 _-]*$/,
        'Use letters, numbers, spaces, - or _ (must start with a letter or number)'
      )
  );

export const channelIdSchema = z
  .string()
  .max(40)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid channel');

export const messageIdSchema = z.uuid('Invalid message');

// ---------- Client → server payload schemas ----------

export const channelJoinSchema = z.strictObject({ channelId: channelIdSchema });

export const messageSendSchema = z.strictObject({
  channelId: channelIdSchema,
  text: messageTextSchema,
});

export const messageLikeSchema = z.strictObject({
  channelId: channelIdSchema,
  messageId: messageIdSchema,
});

export const channelCreateSchema = z.strictObject({ name: channelNameSchema });

// ---------- Server → client data schemas ----------

export const channelSchema = z.strictObject({
  id: channelIdSchema,
  name: z.string().min(1).max(MAX_CHANNEL_NAME_LENGTH),
  description: z.string().max(100),
});

export const messageSchema = z.strictObject({
  id: z.uuid(),
  channelId: channelIdSchema,
  text: z.string().min(1).max(MAX_MESSAGE_LENGTH),
  username: z.enum(user_list),
  timestamp: z.number().int().positive(),
  likes: z.number().int().min(0),
});

export const channelListSchema = z.array(channelSchema).max(100);

export const historySchema = z.strictObject({
  channelId: channelIdSchema,
  messages: z.array(messageSchema).max(1000),
});

export const messageUpdatedSchema = z.strictObject({
  channelId: channelIdSchema,
  messageId: z.uuid(),
  likes: z.number().int().min(0),
});

export const presenceCountSchema = z.number().int().min(0);

export const chatErrorSchema = z.strictObject({
  code: z.enum(['INVALID_INPUT', 'RATE_LIMITED', 'NOT_FOUND', 'SERVER_ERROR']),
  message: z.string().max(200),
});

// ---------- Helper ----------

export const firstError = (result) =>
  result.error?.issues?.[0]?.message ?? 'Invalid input';
