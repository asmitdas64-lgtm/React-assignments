import { useState } from 'react';
import { getOptimizedImageUrl, UI_TEXT } from '../../constants/gallery.js';
import { ThumbsUpButton } from '../ThumbsUpButton/ThumbsUpButton.jsx';
import './PhotoRow.css';

export function PhotoRow({ photo, likes = 0, onLike }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const optimizedSrc = getOptimizedImageUrl(photo.download_url, 240, 160);

  const handleLike = () => {
    if (typeof onLike === 'function') {
      onLike(photo.id);
    }
  };

  return (
    <article
      className="gallery-item-row"
      aria-label={`Photo by ${photo.author}`}
    >
      <div className={`photo-thumbnail-wrapper ${imageLoaded ? 'loaded' : ''}`}>
        {!imageError ? (
          <img
            src={optimizedSrc}
            alt={`Photograph by ${photo.author}`}
            className="photo-thumbnail-img"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="photo-thumbnail-fallback" aria-label="Image failed to load">
            <span>📷</span>
          </div>
        )}
      </div>

      <div className="photo-row-meta">
        <span className="photo-author-label">
          {UI_TEXT.AUTHOR_PREFIX}
          {photo.author}
        </span>
        <ThumbsUpButton
          author={photo.author}
          count={likes}
          onLike={handleLike}
        />
      </div>
    </article>
  );
}
