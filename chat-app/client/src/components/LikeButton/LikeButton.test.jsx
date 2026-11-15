import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LikeButton from './LikeButton.jsx';

describe('LikeButton', () => {
  it('displays initial count of 0 and accessible label', () => {
    render(<LikeButton count={0} onLike={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /like message, 0 likes/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('0');
    expect(btn).not.toHaveClass('like-button--active');
  });

  it('displays positive count and active class when count > 0', () => {
    render(<LikeButton count={5} onLike={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /like message, 5 likes/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('5');
    expect(btn).toHaveClass('like-button--active');
  });

  it('calls onLike when clicked by user', async () => {
    const user = userEvent.setup();
    const handleLike = vi.fn();
    render(<LikeButton count={1} onLike={handleLike} />);

    const btn = screen.getByRole('button', { name: /like message, 1 like/i });
    await user.click(btn);

    expect(handleLike).toHaveBeenCalledTimes(1);
  });

  it('triggers pop animation class when count increases', () => {
    const { rerender } = render(<LikeButton count={2} onLike={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /like message, 2 likes/i });
    expect(btn).not.toHaveClass('like-button--pop');

    // Rerender with increased count
    rerender(<LikeButton count={3} onLike={vi.fn()} />);
    expect(btn).toHaveClass('like-button--pop');
  });
});
