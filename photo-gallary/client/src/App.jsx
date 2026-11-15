import { GalleryProvider } from './context/GalleryContext.jsx';
import { usePicsumFeed } from './hooks/usePicsumFeed.js';
import { useGallery } from './context/useGallery.js';
import { Header } from './components/Header/Header.jsx';
import { PhotoRow } from './components/PhotoRow/PhotoRow.jsx';
import './App.css';

function GalleryStream() {
  const { photos, isLoading, error } = usePicsumFeed();
  const { likesByPhotoId, likePhoto } = useGallery();

  return (
    <section className="gallery-stream" role="feed" aria-label="Photo gallery feed">
      {photos.map((photo) => (
        <PhotoRow
          key={photo.id}
          photo={photo}
          likes={likesByPhotoId[photo.id] || 0}
          onLike={likePhoto}
        />
      ))}
      {isLoading && (
        <div className="gallery-loading" role="status" aria-live="polite">
          Loading photographs…
        </div>
      )}
      {error && (
        <div className="gallery-error" role="alert">
          {error}
        </div>
      )}
    </section>
  );
}

export function App() {
  return (
    <GalleryProvider>
      <div className="gallery-app-root">
        <main className="gallery-main-container">
          <Header />
          <GalleryStream />
        </main>
      </div>
    </GalleryProvider>
  );
}

export default App;
