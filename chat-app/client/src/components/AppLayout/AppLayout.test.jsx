import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppLayout from './AppLayout.jsx';
import { SEED_CHANNELS, CURRENT_USER } from '../../constants/users.js';

const mockMessages = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    channelId: 'introductions',
    text: 'Welcome to Team Chat! 👋',
    username: 'Alan',
    timestamp: Date.now() - 60000,
    likes: 2,
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    channelId: 'introductions',
    text: 'Hey everyone!',
    username: 'Bob',
    timestamp: Date.now(),
    likes: 0,
  },
];

describe('AppLayout (Phase 1 Static Layout)', () => {
  it('renders semantic sidebar and main chat panel landmarks', () => {
    render(
      <AppLayout
        channels={SEED_CHANNELS}
        activeChannelId="introductions"
        messages={mockMessages}
        onlineCount={1}
        connection="offline"
      />
    );

    expect(screen.getByRole('complementary', { name: /sidebar/i })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /conversations/i })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders display-only profile card, channels, header, thread, and input', () => {
    render(
      <AppLayout
        channels={SEED_CHANNELS}
        activeChannelId="introductions"
        messages={mockMessages}
        onlineCount={3}
        connection="connected"
      />
    );

    // Sidebar profile card
    expect(screen.getByText(CURRENT_USER.name)).toBeInTheDocument();
    expect(screen.getByText(CURRENT_USER.role)).toBeInTheDocument();

    // Conversations header + add button + seed channels
    expect(screen.getByText('Conversations')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add channel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /poland office/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /introductions/i })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('button', { name: /india office/i })).toBeInTheDocument();

    // Chat header
    expect(screen.getByRole('heading', { name: /introductions/i })).toBeInTheDocument();
    expect(screen.getByText('This Channel Is For Company Wide Chatter')).toBeInTheDocument();
    expect(screen.getByText('3 | 5')).toBeInTheDocument();

    // Message thread above input
    const log = screen.getByRole('log');
    const textbox = screen.getByRole('textbox');
    expect(log).toBeInTheDocument();
    expect(textbox).toBeInTheDocument();
    expect(log.compareDocumentPosition(textbox) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // Explicit Send button
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });
});
