import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PhotoRow } from './PhotoRow.jsx';

describe('PhotoRow Component [CORE]', () => {
  const samplePhoto = {
    id: '0',
    author: 'Vadim Sherbakov',
    width: 5616,
    height: 3744,
    url: 'https://unsplash.com/photos/yC-YDelHvfQ',
    download_url: 'https://picsum.photos/id/0/5616/3744',
  };

  it('renders photo thumbnail on the left, author name on the right, and thumbs-up button', () => {
    render(<PhotoRow photo={samplePhoto} likes={0} onLike={vi.fn()} />);

    const article = screen.getByRole('article', { name: /photo by vadim sherbakov/i });
    expect(article).toBeInTheDocument();
    expect(article).toHaveClass('gallery-item-row');

    // Check image thumbnail
    const img = screen.getByRole('img', { name: /photograph by vadim sherbakov/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', expect.stringContaining('https://picsum.photos/id/0/'));

    // Check author text prefix
    expect(screen.getByText(/author:\s*vadim sherbakov/i)).toBeInTheDocument();

    // Check thumbs-up button presence
    const likeBtn = screen.getByRole('button', { name: /thumbs up/i });
    expect(likeBtn).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('safely renders author string without DOM injection (anti-XSS)', () => {
    const maliciousPhoto = {
      ...samplePhoto,
      id: 'malicious-1',
      author: '<img src=x onerror=alert(1)> Hacker',
    };

    render(<PhotoRow photo={maliciousPhoto} likes={2} onLike={vi.fn()} />);

    // Should render as literal plain text
    expect(screen.getByText(/author:\s*<img src=x onerror=alert\(1\)> Hacker/i)).toBeInTheDocument();
    // No injected img tag for hacker payload
    expect(document.querySelector('img[src="x"]')).not.toBeInTheDocument();
  });

  it('forwards onLike callback when thumbs up button is clicked', async () => {
    const handleLike = vi.fn();
    const user = userEvent.setup();

    render(<PhotoRow photo={samplePhoto} likes={4} onLike={handleLike} />);

    const likeBtn = screen.getByRole('button', { name: /thumbs up/i });
    await user.click(likeBtn);

    expect(handleLike).toHaveBeenCalledWith('0');
  });
});
