import { lazy, Suspense, useEffect, useRef } from 'react';
import './EmojiPickerPopover.css';

// Lazy-load @emoji-mart/react
const Picker = lazy(() => import('@emoji-mart/react'));

export default function EmojiPickerPopover({
  isOpen,
  onEmojiSelect,
  onClose,
}) {
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };

    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        // Only close if click was not on the emoji toggle button itself
        if (!e.target.closest('.chat-input-emoji-btn')) {
          onClose?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="emoji-picker-popover"
      role="dialog"
      aria-label="Emoji picker"
    >
      <Suspense fallback={<div className="emoji-picker-loading">Loading emojis...</div>}>
        <Picker
          theme="dark"
          onEmojiSelect={onEmojiSelect}
          previewPosition="none"
          skinTonePosition="none"
        />
      </Suspense>
    </div>
  );
}
