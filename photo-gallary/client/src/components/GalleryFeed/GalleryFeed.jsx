import { usePicsumFeed } from '../../hooks/usePicsumFeed.js';
import { useGallery } from '../../context/useGallery.js';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll.js';
import { PhotoRow } from '../PhotoRow/PhotoRow.jsx';
import { UI_TEXT } from '../../constants/gallery.js';
import './GalleryFeed.css';

export function GalleryFeed() {
  const {
    photos,
    isLoading,
    hasMore,
    error,
    loadNextPage,
    retry,
  } = usePicsumFeed();

  const { likesByPhotoId, likePhoto } = useGallery();

  const sentinelRef = useInfiniteScroll({
    onIntersect: loadNextPage,
    enabled: !isLoading && hasMore,
  });

  return (
    <div className="gallery-feed-container" role="feed" aria-label="Photo gallery feed">
      <div className="gallery-rows-list">
        {photos.map((photo) => (
          <PhotoRow
            key={photo.id}
            photo={photo}
            likes={likesByPhotoId[photo.id] || 0}
            onLike={likePhoto}
          />
        ))}
      </div>

      {hasMore && (
        <div
          ref={sentinelRef}
          className="gallery-sentinel"
          data-testid="infinite-scroll-sentinel"
          aria-hidden="true"
        />
      )}

      {isLoading && (
        <div className="gallery-feed-loading" role="status" aria-live="polite">
          <span className="loading-spinner" aria-hidden="true"></span>
          <span>{UI_TEXT.LOADING_MORE}</span>
        </div>
      )}

      {!hasMore && photos.length > 0 && (
        <div className="gallery-feed-end" role="status">
          <p>{UI_TEXT.END_OF_FEED}</p>
        </div>
      )}

      {error && (
        <div className="gallery-feed-error" role="alert">
          <p className="error-message">{error}</p>
          <button type="button" onClick={retry} className="error-retry-button">
            {UI_TEXT.RETRY_BUTTON}
          </button>
        </div>
      )}
    </div>
  );
}
