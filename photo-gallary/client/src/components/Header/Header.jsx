import './Header.css';
import { UI_TEXT } from '../../constants/gallery.js';

export function Header() {
  return (
    <header className="gallery-header" role="banner">
      <h1 className="gallery-header-title">{UI_TEXT.APP_TITLE}</h1>
    </header>
  );
}
