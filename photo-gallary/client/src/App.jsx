import { GalleryProvider } from './context/GalleryContext.jsx';
import { Header } from './components/Header/Header.jsx';
import { GalleryFeed } from './components/GalleryFeed/GalleryFeed.jsx';
import ScrollToTop from './components/ScrollToTop/ScrollToTop.jsx';
import './App.css';

export function App() {
  return (
    <GalleryProvider>
      <div className="gallery-app-root">
        <main className="gallery-main-container">
          <Header />
          <GalleryFeed />
        </main>
        <ScrollToTop />
      </div>
    </GalleryProvider>
  );
}

export default App;
