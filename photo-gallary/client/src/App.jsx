import { useState } from 'react';
import { SEED_PHOTOS } from './constants/gallery.js';
import { Header } from './components/Header/Header.jsx';
import { PhotoRow } from './components/PhotoRow/PhotoRow.jsx';
import './App.css';

export function App() {
  const [likes, setLikes] = useState({});

  const handleLike = (photoId) => {
    setLikes((prev) => ({
      ...prev,
      [photoId]: (prev[photoId] || 0) + 1,
    }));
  };

  return (
    <div className="gallery-app-root">
      <main className="gallery-main-container">
        <Header />
        <section className="gallery-stream" role="feed" aria-label="Photo gallery feed">
          {SEED_PHOTOS.map((photo) => (
            <PhotoRow
              key={photo.id}
              photo={photo}
              likes={likes[photo.id] || 0}
              onLike={handleLike}
            />
          ))}
        </section>
      </main>
    </div>
  );
}

export default App;
