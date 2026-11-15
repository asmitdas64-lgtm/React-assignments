import { describe, it, expect } from 'vitest';
import { insertAtCaret } from './insertAtCaret.js';

describe('insertAtCaret utility [CORE+] C', () => {
  it('inserts text at the beginning of a string', () => {
    const result = insertAtCaret('world', 'Hello ', 0, 0);
    expect(result.text).toBe('Hello world');
    expect(result.caretPosition).toBe(6);
  });

  it('inserts text in the middle of a string at caret position', () => {
    const result = insertAtCaret('Hi Bob!', '👋 ', 3, 3);
    expect(result.text).toBe('Hi 👋 Bob!');
    expect(result.caretPosition).toBe(6);
  });

  it('inserts text at the end of a string', () => {
    const result = insertAtCaret('Good morning', ' ☀️', 12, 12);
    expect(result.text).toBe('Good morning ☀️');
    expect(result.caretPosition).toBe(15);
  });

  it('replaces a selected text range between selectionStart and selectionEnd', () => {
    const result = insertAtCaret('Hello REPLACE world', 'there', 6, 13);
    expect(result.text).toBe('Hello there world');
    expect(result.caretPosition).toBe(11);
  });

  it('handles empty input string gracefully', () => {
    const result = insertAtCaret('', '🎉', 0, 0);
    expect(result.text).toBe('🎉');
    expect(result.caretPosition).toBe(2);
  });
});
