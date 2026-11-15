import { useState, useCallback } from 'react';
import { user_list } from '../constants/users.js';

export function useMentions() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [mentionRange, setMentionRange] = useState({ start: 0, end: 0 });

  // Filter user_list case-insensitively
  const matches = query
    ? user_list.filter((user) =>
        user.toLowerCase().startsWith(query.toLowerCase())
      )
    : user_list;

  const checkMention = useCallback((text, caretPos) => {
    // Look at text leading up to caret for @query
    const textBeforeCaret = text.slice(0, caretPos);
    const match = /(?:^|\s)@(\w*)$/.exec(textBeforeCaret);

    if (match) {
      const matchQuery = match[1];
      const matchStart = caretPos - matchQuery.length - 1; // index of '@'
      setQuery(matchQuery);
      setMentionRange({ start: matchStart, end: caretPos });
      setIsOpen(true);
      setActiveIndex(0);
    } else {
      setIsOpen(false);
      setQuery('');
    }
  }, []);

  const closeMentions = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(0);
  }, []);

  const selectNext = useCallback(() => {
    if (matches.length > 0) {
      setActiveIndex((prev) => (prev + 1) % matches.length);
    }
  }, [matches.length]);

  const selectPrev = useCallback(() => {
    if (matches.length > 0) {
      setActiveIndex((prev) => (prev - 1 + matches.length) % matches.length);
    }
  }, [matches.length]);

  return {
    isOpen,
    query,
    matches,
    activeIndex,
    mentionRange,
    checkMention,
    closeMentions,
    selectNext,
    selectPrev,
  };
}
