import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { UI_TEXT } from '../../constants/gallery.js';
import './ThumbsUpButton.css';

export function ThumbsUpButton({ author = '', count = 0, onLike }) {
  const label = UI_TEXT.LIKE_BUTTON_LABEL(author, count);

  return (
    <button
      type="button"
      className="thumbs-up-button"
      aria-label={label}
      onClick={onLike}
    >
      <FontAwesomeIcon icon={faThumbsUp} className="thumbs-up-icon" />
      <span className="thumbs-up-count">{count}</span>
    </button>
  );
}
