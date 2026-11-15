import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { UI_TEXT, LIKE_POP_DURATION_MS } from '../../constants/gallery.js';
import './ThumbsUpButton.css';

export function ThumbsUpButton({ author = '', count = 0, onLike }) {
  const [isBouncing, setIsBouncing] = useState(false);
  const prevCountRef = useRef(count);

  useEffect(() => {
    if (count > prevCountRef.current) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), LIKE_POP_DURATION_MS);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = count;
  }, [count]);

  const label = UI_TEXT.LIKE_BUTTON_LABEL(author, count);

  const handleClick = (e) => {
    setIsBouncing(true);
    if (typeof onLike === 'function') {
      onLike(e);
    }
  };

  const handleAnimationEnd = () => {
    setIsBouncing(false);
  };

  const classNames = [
    'thumbs-up-button',
    count > 0 ? 'has-likes' : '',
    isBouncing ? 'thumbs-up-bounce' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classNames}
      aria-label={label}
      onClick={handleClick}
      onAnimationEnd={handleAnimationEnd}
    >
      <FontAwesomeIcon icon={faThumbsUp} className="thumbs-up-icon" />
      <span className="thumbs-up-count">{count}</span>
    </button>
  );
}
