import { user_list } from '../constants/users.js';

/**
 * Parses message text into an array of structured tokens:
 * [{ type: 'text' | 'mention', value: string }]
 *
 * Mentions must:
 * 1. Match @[Username] where Username is in user_list
 * 2. Preceded by start of string or whitespace
 * 3. Followed by end of string, whitespace, or punctuation
 */
export function parseMentions(text) {
  if (!text) return [];

  // Construct pattern for allowed usernames: @(Alan|Bob|Carol|Dean|Elin)
  const userPattern = user_list.join('|');
  const mentionRegex = new RegExp(`(^|\\s)(@(?:${userPattern}))(?=$|[\\s,;!?.:])`, 'g');

  const tokens = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const prefixWhitespace = match[1];
    const mention = match[2];
    const matchStart = match.index;

    // Push preceding text if any
    const textBefore = text.slice(lastIndex, matchStart) + prefixWhitespace;
    if (textBefore) {
      tokens.push({ type: 'text', value: textBefore });
    }

    // Push mention token
    tokens.push({ type: 'mention', value: mention });

    lastIndex = matchStart + fullMatch.length;
  }

  // Push remaining text after last mention
  const remainingText = text.slice(lastIndex);
  if (remainingText) {
    tokens.push({ type: 'text', value: remainingText });
  }

  return tokens.length > 0 ? tokens : [{ type: 'text', value: text }];
}
