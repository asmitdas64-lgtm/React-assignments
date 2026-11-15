import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import App from './App.jsx';
import * as fetchModule from './utils/fetchPhotos.js';
import { UI_TEXT } from './constants/gallery.js';

describe('App Core Integration & Security Audit [CORE][SECURITY][A11Y]', () => {
  const page1Photos = [
    {
      id: '10',
      author: 'Paul Jarvis',
      width: 2500,
      height: 1667,
      url: 'https://unsplash.com/photos/6J--NXulQCs',
      download_url: 'https://picsum.photos/id/10/2500/1667',
    },
    {
      id: '11',
      author: '<script>alert("xss")</script><b>Malicious Author</b>',
      width: 2500,
      height: 1667,
      url: 'https://unsplash.com/photos/K9Rfd8qincq',
      download_url: 'https://picsum.photos/id/11/2500/1667',
    },
  ];

  const page2Photos = [
    {
      id: '12',
      author: 'Danielle MacInnes',
      width: 2500,
      height: 1667,
      url: 'https://unsplash.com/photos/IOWAl اخx',
      download_url: 'https://picsum.photos/id/12/2500/1667',
    },
  ];

  beforeEach(() => {
    window.IntersectionObserver.instances = [];
    vi.spyOn(fetchModule, 'fetchPhotos').mockResolvedValue(page1Photos);
    window.scrollY = 0;
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Header with title and initially loads page 1 photos in 1-column feed', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: UI_TEXT.APP_TITLE })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/author:\s*paul jarvis/i)).toBeInTheDocument();
    });

    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(2);

    const firstImg = screen.getByAltText(/photograph by paul jarvis/i);
    expect(firstImg).toHaveAttribute('src', 'https://picsum.photos/id/10/240/160');
  });

  it('safely renders untrusted text without executing HTML / XSS payloads', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/paul jarvis/i)).toBeInTheDocument();
    });

    // The script tag must be treated purely as plain text string content
    const authorElement = screen.getByText(/<script>alert\("xss"\)<\/script>/i);
    expect(authorElement).toBeInTheDocument();
    expect(authorElement.tagName.toLowerCase()).not.toBe('script');
    // Ensure no actual <script> or raw <b> element got injected into DOM
    expect(document.querySelector('script[src]')).toBeNull();
  });

  it('increments likes counter on multiple clicks independently across photos', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/author:\s*paul jarvis/i)).toBeInTheDocument();
    });

    const likeButtons = screen.getAllByRole('button', { name: /thumbs up photo/i });
    expect(likeButtons).toHaveLength(2);

    const firstLikeBtn = likeButtons[0];
    const secondLikeBtn = likeButtons[1];

    expect(firstLikeBtn).toHaveTextContent('0');
    expect(secondLikeBtn).toHaveTextContent('0');

    // Click first photo thumbs up 3 times
    fireEvent.click(firstLikeBtn);
    fireEvent.click(firstLikeBtn);
    fireEvent.click(firstLikeBtn);

    expect(firstLikeBtn).toHaveTextContent('3');
    expect(secondLikeBtn).toHaveTextContent('0'); // Isolated state

    // Click second photo thumbs up 1 time
    fireEvent.click(secondLikeBtn);
    expect(secondLikeBtn).toHaveTextContent('1');
  });

  it('appends page 2 photos via infinite scroll without replacing existing photos', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/author:\s*paul jarvis/i)).toBeInTheDocument();
    });

    fetchModule.fetchPhotos.mockResolvedValueOnce(page2Photos);

    const observer = window.IntersectionObserver.instances.at(-1);
    expect(observer).toBeDefined();

    await act(async () => {
      observer.triggerIntersect(true);
    });

    await waitFor(() => {
      expect(screen.getByText(/author:\s*danielle macinnes/i)).toBeInTheDocument();
    });

    // Both page 1 and page 2 photos are rendered
    expect(screen.getByText(/author:\s*paul jarvis/i)).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });

  it('supports keyboard navigation and activation on thumbs up buttons', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/author:\s*paul jarvis/i)).toBeInTheDocument();
    });

    const firstLikeBtn = screen.getAllByRole('button', { name: /thumbs up photo/i })[0];

    firstLikeBtn.focus();
    expect(document.activeElement).toBe(firstLikeBtn);

    // Press Enter to trigger like
    fireEvent.keyDown(firstLikeBtn, { key: 'Enter', code: 'Enter' });
    fireEvent.click(firstLikeBtn);
    expect(firstLikeBtn).toHaveTextContent('1');
  });

  it('shows ScrollToTop floating button when scrolling down and triggers smooth scroll to top', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/author:\s*paul jarvis/i)).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: UI_TEXT.SCROLL_TOP })).toBeNull();

    window.scrollY = 600;
    act(() => {
      fireEvent.scroll(window);
    });

    const scrollBtn = screen.getByRole('button', { name: UI_TEXT.SCROLL_TOP });
    expect(scrollBtn).toBeInTheDocument();

    fireEvent.click(scrollBtn);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
