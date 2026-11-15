import { useState, useEffect, useRef } from 'react';
import './LikeButton.css';

export default function LikeButton({ count = 0, onLike }) {
  const [isPopping, setIsPopping] = useState(false);
  const prevCountRef = useRef(count);
  const isActive = count > 0;

  useEffect(() => {
    if (count > prevCountRef.current) {
      setIsPopping(true);
      const timer = setTimeout(() => setIsPopping(false), 300);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = count;
  }, [count]);

  const popClass = isPopping ? 'like-button--pop' : '';
  const activeClass = isActive ? 'like-button--active' : '';

  return (
    <button
      type="button"
      className={`like-button ${activeClass} ${popClass}`.trim()}
      onClick={onLike}
      aria-label={`Like message, ${count} ${count === 1 ? 'like' : 'likes'}`}
    >
      <svg
        className="like-button__icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={isActive ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
      <span className="like-button__count">{count}</span>
    </button>
  );
}
