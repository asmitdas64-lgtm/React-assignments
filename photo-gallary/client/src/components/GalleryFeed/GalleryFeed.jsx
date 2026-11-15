import { usePicsumFeed } from '../../hooks/usePicsumFeed.js';
import { useGallery } from '../../context/useGallery.js';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll.js';
import { PhotoRow } from '../PhotoRow/PhotoRow.jsx';
import { SkeletonRow } from '../SkeletonRow/SkeletonRow.jsx';
import { UI_TEXT, SKELETON_ITEMS_COUNT } from '../../constants/gallery.js';
import './GalleryFeed.css';

export function GalleryFeed() {
  const {
    photos,
    isLoading,
    isInitialLoading,
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

  const showInitialSkeletons = photos.length === 0 && (isLoading || isInitialLoading);

  return (
    <div className="gallery-feed-container" role="feed" aria-label="Photo gallery feed">
      <div className="gallery-rows-list">
        {showInitialSkeletons
          ? Array.from({ length: SKELETON_ITEMS_COUNT }).map((_, index) => (
              <SkeletonRow key={`skeleton-initial-${index}`} />
            ))
          : photos.map((photo) => (
              <PhotoRow
                key={photo.id}
                photo={photo}
                likes={likesByPhotoId[photo.id] || 0}
                onLike={likePhoto}
              />
            ))}
      </div>

      {hasMore && !showInitialSkeletons && (
        <div
          ref={sentinelRef}
          className="gallery-sentinel"
          data-testid="infinite-scroll-sentinel"
          aria-hidden="true"
        />
      )}

      {/* Pagination skeleton loader when fetching subsequent pages */}
      {photos.length > 0 && isLoading && (
        <div className="gallery-pagination-skeleton">
          <SkeletonRow />
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
