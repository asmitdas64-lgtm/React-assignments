import { useState, useRef } from 'react';
import {
  MAX_MESSAGE_LENGTH,
  MESSAGE_COUNTER_THRESHOLD,
} from '../../constants/users.js';
import { messageTextSchema, firstError } from '../../validation/schemas.js';
import { insertAtCaret } from '../../utils/insertAtCaret.js';
import { useMentions } from '../../hooks/useMentions.js';
import MentionList from './MentionList.jsx';
import EmojiPickerPopover from './EmojiPickerPopover.jsx';
import './ChatInput.css';

export default function ChatInput({ channelName = 'Introductions', onSend }) {
  const [text, setText] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const inputRef = useRef(null);

  const {
    isOpen: isMentionsOpen,
    matches,
    activeIndex,
    mentionRange,
    checkMention,
    closeMentions,
    selectNext,
    selectPrev,
  } = useMentions();

  const trimmedLength = text.trim().length;
  const isOverThreshold = text.length >= MESSAGE_COUNTER_THRESHOLD;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isMentionsOpen) return;

    setValidationError('');

    const parseResult = messageTextSchema.safeParse(text);
    if (!parseResult.success) {
      setValidationError(firstError(parseResult));
      return;
    }

    onSend?.(parseResult.data);
    setText('');
    setValidationError('');
    setIsEmojiPickerOpen(false);
    closeMentions();
    inputRef.current?.focus();
  };

  const handleChange = (e) => {
    const newText = e.target.value;
    const caretPos = e.target.selectionStart || newText.length;
    setText(newText);
    if (validationError) setValidationError('');

    // Check for @mention trigger
    checkMention(newText, caretPos);
  };

  const handleKeyDown = (e) => {
    if (isMentionsOpen && matches.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectPrev();
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleSelectMention(matches[activeIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeMentions();
      }
    }
  };

  const handleSelectMention = (username) => {
    const input = inputRef.current;
    const caret = input ? input.selectionStart : text.length;

    // Replace @query with @Username + space
    const before = text.slice(0, mentionRange.start);
    const after = text.slice(caret);
    const replacement = `@${username} `;
    const updated = before + replacement + after;

    setText(updated);
    closeMentions();

    // Restore caret position
    const newCaret = before.length + replacement.length;
    requestAnimationFrame(() => {
      if (input) {
        input.focus();
        input.setSelectionRange(newCaret, newCaret);
      }
    });
  };

  const handleEmojiSelect = (emojiData) => {
    const input = inputRef.current;
    const start = input ? input.selectionStart : text.length;
    const end = input ? input.selectionEnd : text.length;
    const emojiChar = emojiData.native || emojiData.shortcodes || '';

    const { text: updatedText, caretPosition } = insertAtCaret(
      text,
      emojiChar,
      start,
      end
    );

    setText(updatedText);

    requestAnimationFrame(() => {
      if (input) {
        input.focus();
        input.setSelectionRange(caretPosition, caretPosition);
      }
    });
  };

  const toggleEmojiPicker = () => {
    if (!isEmojiPickerOpen) {
      closeMentions(); // Mutual exclusion
    }
    setIsEmojiPickerOpen((prev) => !prev);
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      {/* Mention autocomplete popover */}
      {isMentionsOpen && (
        <MentionList
          matches={matches}
          activeIndex={activeIndex}
          onSelectMention={handleSelectMention}
        />
      )}

      {/* Emoji picker popover */}
      <EmojiPickerPopover
        isOpen={isEmojiPickerOpen}
        onEmojiSelect={handleEmojiSelect}
        onClose={() => setIsEmojiPickerOpen(false)}
      />

      {validationError && (
        <div className="chat-input-alert" role="alert">
          {validationError}
        </div>
      )}

      {isOverThreshold && (
        <div
          className={`chat-input-counter ${text.length >= MAX_MESSAGE_LENGTH ? 'chat-input-counter--limit' : ''}`}
          aria-live="polite"
        >
          {`${text.length} / ${MAX_MESSAGE_LENGTH}`}
        </div>
      )}

      <div className="chat-input-row">
        <div className="chat-input-pill-wrapper">
          <label htmlFor="chat-message-input" className="sr-only">
            {`Message #${channelName}`}
          </label>
          <input
            id="chat-message-input"
            ref={inputRef}
            type="text"
            className="chat-input-pill"
            placeholder="Type a message..."
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={MAX_MESSAGE_LENGTH}
            aria-expanded={isMentionsOpen || isEmojiPickerOpen}
            aria-autocomplete={isMentionsOpen ? 'list' : 'none'}
          />
          <button
            type="button"
            className={`chat-input-emoji-btn ${isEmojiPickerOpen ? 'chat-input-emoji-btn--active' : ''}`}
            onClick={toggleEmojiPicker}
            aria-label="Open emoji picker"
            aria-expanded={isEmojiPickerOpen}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9.5" />
              <path d="M8 14.5s1.5 2 4 2 4-2 4-2" />
              <circle cx="9" cy="10" r=".8" fill="currentColor" />
              <circle cx="15" cy="10" r=".8" fill="currentColor" />
            </svg>
          </button>
        </div>

        <button
          type="submit"
          className="chat-input-send-btn"
          aria-label="Send message"
          disabled={trimmedLength === 0}
        >
          <span className="chat-input-send-btn__label">Send</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </form>
  );
}
