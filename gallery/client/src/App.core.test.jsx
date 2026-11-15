import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
      author: '<script>alert("xss")</script><img src=x onerror=alert(1)>',
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
      url: 'https://unsplash.com/photos/IOWAlاخx',
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

  it('renders Header and loads page 1 photos in a 1-column layout matching reference design', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: UI_TEXT.APP_TITLE })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/author:\s*paul jarvis/i)).toBeInTheDocument();
    });

    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(2);

    const firstImg = screen.getByAltText(/photograph by paul jarvis/i);
    expect(firstImg).toHaveAttribute('src', 'https://picsum.photos/id/10/240/160');

    // Initial like counters must start at 0
    const buttons = screen.getAllByRole('button', { name: /thumbs up photo/i });
    expect(buttons[0]).toHaveTextContent('0');
    expect(buttons[1]).toHaveTextContent('0');
  });

  it('safely renders untrusted text without executing HTML or XSS injection vectors', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/paul jarvis/i)).toBeInTheDocument();
    });

    // Malicious script tag payload must be treated purely as string text
    const authorElement = screen.getByText(/<script>alert\("xss"\)<\/script>/i);
    expect(authorElement).toBeInTheDocument();
    expect(authorElement.tagName.toLowerCase()).not.toBe('script');
    expect(document.querySelector('script[src]')).toBeNull();
  });

  it('supports unlimited thumbs-up clicks and increments count independently per photo', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/author:\s*paul jarvis/i)).toBeInTheDocument();
    });

    const [firstLikeBtn, secondLikeBtn] = screen.getAllByRole('button', { name: /thumbs up photo/i });
    expect(firstLikeBtn).toHaveTextContent('0');
    expect(secondLikeBtn).toHaveTextContent('0');

    // Click first photo 5 times
    for (let i = 0; i < 5; i++) {
      fireEvent.click(firstLikeBtn);
    }

    expect(firstLikeBtn).toHaveTextContent('5');
    // Sibling like count remains strictly isolated
    expect(secondLikeBtn).toHaveTextContent('0');

    // Click second photo once
    fireEvent.click(secondLikeBtn);
    expect(secondLikeBtn).toHaveTextContent('1');
  });

  it('appends page 2 photos via infinite scroll without replacing existing photos and terminates gracefully on empty page', async () => {
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

    // Verify all 3 items coexist in DOM without drop
    expect(screen.getByText(/author:\s*paul jarvis/i)).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(3);

    // Now test graceful termination when API returns empty array []
    fetchModule.fetchPhotos.mockResolvedValueOnce([]);

    await act(async () => {
      observer.triggerIntersect(true);
    });

    await waitFor(() => {
      expect(screen.getByText(UI_TEXT.END_OF_FEED)).toBeInTheDocument();
    });

    expect(screen.queryByTestId('infinite-scroll-sentinel')).not.toBeInTheDocument();
  });

  it('full keyboard navigation audit: Tab, Shift+Tab, Enter, Space across buttons and controls', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/author:\s*paul jarvis/i)).toBeInTheDocument();
    });

    const [firstLikeBtn, secondLikeBtn] = screen.getAllByRole('button', { name: /thumbs up photo/i });

    // 1. Tab into first thumbs-up button and activate with Space
    await user.tab();
    expect(document.activeElement).toBe(firstLikeBtn);
    await user.keyboard(' ');
    expect(firstLikeBtn).toHaveTextContent('1');

    // 2. Tab into second thumbs-up button and activate with Enter
    await user.tab();
    expect(document.activeElement).toBe(secondLikeBtn);
    await user.keyboard('{Enter}');
    expect(secondLikeBtn).toHaveTextContent('1');

    // 3. Shift+Tab back to first thumbs-up button and activate again
    await user.keyboard('{Shift>}[Tab]{/Shift}');
    expect(document.activeElement).toBe(firstLikeBtn);
    await user.keyboard(' ');
    expect(firstLikeBtn).toHaveTextContent('2');

    // 4. Test ScrollToTop keyboard accessibility
    window.scrollY = 600;
    act(() => {
      fireEvent.scroll(window);
    });

    const scrollBtn = screen.getByRole('button', { name: UI_TEXT.SCROLL_TOP });
    expect(scrollBtn).toBeInTheDocument();

    // Tabbing from first button traverses to second button, then to the floating scroll-to-top button
    await user.tab();
    expect(document.activeElement).toBe(secondLikeBtn);
    await user.tab();
    expect(document.activeElement).toBe(scrollBtn);
    await user.keyboard('{Enter}');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('recovers from pagination failure with keyboard navigation and retains existing feed', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/author:\s*paul jarvis/i)).toBeInTheDocument();
    });

    // Simulate network error on page 2
    fetchModule.fetchPhotos.mockRejectedValueOnce(new Error('Network disconnected'));

    const observer = window.IntersectionObserver.instances.at(-1);
    await act(async () => {
      observer.triggerIntersect(true);
    });

    const retryButton = await screen.findByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();

    // Verify existing photos are intact
    expect(screen.getByText(/author:\s*paul jarvis/i)).toBeInTheDocument();

    // Retry with keyboard activation (Tab + Enter)
    fetchModule.fetchPhotos.mockResolvedValueOnce(page2Photos);
    retryButton.focus();
    expect(document.activeElement).toBe(retryButton);

    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText(/author:\s*danielle macinnes/i)).toBeInTheDocument();
    });
  });
});
