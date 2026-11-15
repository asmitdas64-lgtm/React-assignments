import { describe, it, expect } from 'vitest';
import { parseMentions } from './parseMentions.js';

describe('parseMentions utility [CORE+] D', () => {
  it('returns plain text node when no mentions are present', () => {
    const nodes = parseMentions('Hello world!');
    expect(nodes).toEqual([{ type: 'text', value: 'Hello world!' }]);
  });

  it('parses valid username mentions into structured mention nodes', () => {
    const nodes = parseMentions('Hi @Alan and @Bob, how are you?');
    expect(nodes).toEqual([
      { type: 'text', value: 'Hi ' },
      { type: 'mention', value: '@Alan' },
      { type: 'text', value: ' and ' },
      { type: 'mention', value: '@Bob' },
      { type: 'text', value: ', how are you?' },
    ]);
  });

  it('recognizes all 5 allowed users from user_list', () => {
    const text = '@Alan @Bob @Carol @Dean @Elin';
    const nodes = parseMentions(text);

    const mentions = nodes.filter((n) => n.type === 'mention').map((n) => n.value);
    expect(mentions).toEqual(['@Alan', '@Bob', '@Carol', '@Dean', '@Elin']);
  });

  it('ignores unknown handles and leaves them as plain text', () => {
    const nodes = parseMentions('Hello @Unknown and @Hacker!');
    expect(nodes).toEqual([{ type: 'text', value: 'Hello @Unknown and @Hacker!' }]);
  });

  it('does not parse email addresses as mentions', () => {
    const nodes = parseMentions('Send email to contact@Alan.com please');
    expect(nodes).toEqual([
      { type: 'text', value: 'Send email to contact@Alan.com please' },
    ]);
  });
});
