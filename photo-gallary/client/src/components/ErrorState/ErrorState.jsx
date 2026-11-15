import { UI_TEXT } from '../../constants/gallery.js';
import './ErrorState.css';

export default function ErrorState({ message = '', onRetry }) {
  return (
    <div className="error-state-container" role="alert">
      <div className="error-state-content">
        <p className="error-state-message">{message || UI_TEXT.ERROR_FETCH}</p>
        {onRetry && (
          <button
            type="button"
            className="error-state-retry-button"
            onClick={onRetry}
            aria-label={UI_TEXT.RETRY_BUTTON}
          >
            {UI_TEXT.RETRY_BUTTON}
          </button>
        )}
      </div>
    </div>
  );
}
