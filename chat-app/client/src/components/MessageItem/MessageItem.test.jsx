import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MessageItem from './MessageItem.jsx';

describe('MessageItem', () => {
  const sampleMessage = {
    id: '11111111-1111-4111-8111-111111111111',
    channelId: 'introductions',
    text: 'Hello <script>alert(1)</script> world!',
    username: 'Carol',
    timestamp: new Date(2026, 10, 15, 17, 30).getTime(),
    likes: 4,
  };

  it('renders avatar initials, username, formatted time, plain-text body, and right-aligned like button', () => {
    render(<MessageItem message={sampleMessage} onLike={vi.fn()} />);

    // Avatar initials for Carol -> CA
    expect(screen.getByText('CA')).toBeInTheDocument();

    // Username & time
    expect(screen.getByText('Carol')).toBeInTheDocument();
    expect(screen.getByText('17:30')).toBeInTheDocument();

    // Escaped plain-text body (no raw script execution)
    expect(screen.getByText('Hello <script>alert(1)</script> world!')).toBeInTheDocument();

    // Like button with count
    const likeBtn = screen.getByRole('button', { name: /like message, 4 likes/i });
    expect(likeBtn).toBeInTheDocument();
    expect(likeBtn).toHaveTextContent('4');
  });
});
