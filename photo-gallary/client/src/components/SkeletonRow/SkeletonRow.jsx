import './SkeletonRow.css';

export function SkeletonRow() {
  return (
    <div
      className="skeleton-row"
      role="status"
      aria-label="Loading photograph placeholder"
      aria-busy="true"
    >
      <div className="skeleton-thumbnail" aria-hidden="true" />
      <div className="skeleton-meta" aria-hidden="true">
        <div className="skeleton-text" aria-hidden="true" />
        <div className="skeleton-button" aria-hidden="true" />
      </div>
    </div>
  );
}
