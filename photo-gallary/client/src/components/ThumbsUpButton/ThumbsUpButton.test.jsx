import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ThumbsUpButton } from './ThumbsUpButton.jsx';

describe('ThumbsUpButton Component [CORE]', () => {
  it('renders a button with FontAwesome thumbs-up icon and initial count 0', () => {
    render(<ThumbsUpButton author="Vadim Sherbakov" count={0} onLike={vi.fn()} />);

    const button = screen.getByRole('button', {
      name: /thumbs up photo by vadim sherbakov\. currently 0 likes/i,
    });
    expect(button).toBeInTheDocument();

    // Check count text
    expect(screen.getByText('0')).toBeInTheDocument();

    // Verify SVG FontAwesome icon is present
    const svgIcon = button.querySelector('svg');
    expect(svgIcon).toBeInTheDocument();
    expect(svgIcon).toHaveClass('fa-thumbs-up');
  });

  it('renders dynamic count and updates accessible label', () => {
    render(<ThumbsUpButton author="Daniel Genser" count={7} onLike={vi.fn()} />);

    const button = screen.getByRole('button', {
      name: /thumbs up photo by daniel genser\. currently 7 likes/i,
    });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('calls onLike handler when clicked', async () => {
    const handleLike = vi.fn();
    const user = userEvent.setup();

    render(<ThumbsUpButton author="Alex" count={3} onLike={handleLike} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleLike).toHaveBeenCalledTimes(1);
  });
});
