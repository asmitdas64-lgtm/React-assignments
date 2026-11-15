import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { GalleryProvider } from '../../context/GalleryContext.jsx';
import { useGallery } from '../../context/useGallery.js';
import { ThumbsUpButton } from './ThumbsUpButton.jsx';

function ConnectedThumbsUpButton({ photoId, author }) {
  const { likesByPhotoId, likePhoto } = useGallery();
  const count = likesByPhotoId[photoId] || 0;

  return (
    <ThumbsUpButton
      photoId={photoId}
      author={author}
      count={count}
      onLike={() => likePhoto(photoId)}
    />
  );
}

describe('ThumbsUpButton Component & Micro-Interactions [CORE]', () => {
  it('renders a button with FontAwesome thumbs-up icon and initial count 0', () => {
    render(<ThumbsUpButton author="Vadim Sherbakov" count={0} onLike={vi.fn()} />);

    const button = screen.getByRole('button', {
      name: /thumbs up photo by vadim sherbakov\. currently 0 likes/i,
    });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();

    const svgIcon = button.querySelector('svg');
    expect(svgIcon).toBeInTheDocument();
    expect(svgIcon).toHaveClass('fa-thumbs-up');
  });

  it('updates accessible aria-label dynamically with current count and author', () => {
    const { rerender } = render(
      <ThumbsUpButton author="Daniel Genser" count={0} onLike={vi.fn()} />
    );
    expect(
      screen.getByRole('button', {
        name: /thumbs up photo by daniel genser\. currently 0 likes/i,
      })
    ).toBeInTheDocument();

    rerender(<ThumbsUpButton author="Daniel Genser" count={5} onLike={vi.fn()} />);
    expect(
      screen.getByRole('button', {
        name: /thumbs up photo by daniel genser\. currently 5 likes/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('applies has-likes class when count is greater than 0', () => {
    const { rerender } = render(
      <ThumbsUpButton author="Alex" count={0} onLike={vi.fn()} />
    );
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('has-likes');

    rerender(<ThumbsUpButton author="Alex" count={1} onLike={vi.fn()} />);
    expect(button).toHaveClass('has-likes');
  });

  it('triggers bounce animation on click and resets on animationend', async () => {
    const user = userEvent.setup();
    render(<ThumbsUpButton author="Justin Leibow" count={0} onLike={vi.fn()} />);

    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('thumbs-up-bounce');

    await user.click(button);
    expect(button).toHaveClass('thumbs-up-bounce');

    // Simulate CSS animation completion
    fireEvent.animationEnd(button);
    expect(button).not.toHaveClass('thumbs-up-bounce');
  });

  it('supports unlimited clicks and increments count continuously in GalleryProvider', async () => {
    const user = userEvent.setup();

    render(
      <GalleryProvider>
        <ConnectedThumbsUpButton photoId="test-1" author="Alexander Shustov" />
      </GalleryProvider>
    );

    const button = screen.getByRole('button');
    expect(screen.getByText('0')).toBeInTheDocument();

    // Click 5 consecutive times
    await user.click(button);
    expect(screen.getByText('1')).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByText('2')).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByText('3')).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByText('4')).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByText('5')).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /thumbs up photo by alexander shustov\. currently 5 likes/i,
      })
    ).toBeInTheDocument();
  });

  it('handles keyboard navigation with Enter and Space keys', async () => {
    const handleLike = vi.fn();
    const user = userEvent.setup();

    render(<ThumbsUpButton author="Paul Jarvis" count={2} onLike={handleLike} />);

    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();

    // Trigger with Enter key
    await user.keyboard('{Enter}');
    expect(handleLike).toHaveBeenCalledTimes(1);

    // Trigger with Space key
    await user.keyboard(' ');
    expect(handleLike).toHaveBeenCalledTimes(2);
  });
});
