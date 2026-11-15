import { SEED_PHOTOS } from './constants/gallery.js';
import { GalleryProvider } from './context/GalleryContext.jsx';
import { useGallery } from './context/useGallery.js';
import { Header } from './components/Header/Header.jsx';
import { PhotoRow } from './components/PhotoRow/PhotoRow.jsx';
import './App.css';

function GalleryStream() {
  const { photos, likesByPhotoId, likePhoto } = useGallery();

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
    </section>
  );
}

export function App() {
  return (
    <GalleryProvider initialPhotos={SEED_PHOTOS}>
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
