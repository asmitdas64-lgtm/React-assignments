import { useContext } from 'react';
import { GalleryContext } from './galleryContextDef.js';

export function useGallery() {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
}
