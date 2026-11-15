import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { UI_TEXT, SCROLL_TOP_THRESHOLD_PX } from '../../constants/gallery.js';
import './ScrollToTop.css';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
      setIsVisible(currentScrollY > SCROLL_TOP_THRESHOLD_PX);
    };

    // Check once on mount
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      className="scroll-to-top-button"
      onClick={handleClick}
      aria-label={UI_TEXT.SCROLL_TOP}
      title={UI_TEXT.SCROLL_TOP}
    >
      <FontAwesomeIcon icon={faArrowUp} className="scroll-to-top-icon" aria-hidden="true" />
    </button>
  );
}
