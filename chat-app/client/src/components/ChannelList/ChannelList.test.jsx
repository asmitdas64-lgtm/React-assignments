import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChannelList from './ChannelList.jsx';
import { SEED_CHANNELS } from '../../constants/users.js';

describe('ChannelList [SIDEBAR] B2', () => {
  it('renders all channels with active highlight and aria-current="true"', () => {
    render(
      <ChannelList
        channels={SEED_CHANNELS}
        activeChannelId="introductions"
        onSelectChannel={vi.fn()}
        onAddClick={vi.fn()}
      />
    );

    const introBtn = screen.getByRole('button', { name: /introductions/i });
    const polandBtn = screen.getByRole('button', { name: /poland office/i });

    expect(introBtn).toHaveAttribute('aria-current', 'true');
    expect(introBtn).toHaveClass('channel-item--active');
    expect(polandBtn).not.toHaveAttribute('aria-current');
    expect(polandBtn).not.toHaveClass('channel-item--active');
  });

  it('calls onSelectChannel with channel id when clicked', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(
      <ChannelList
        channels={SEED_CHANNELS}
        activeChannelId="introductions"
        onSelectChannel={handleSelect}
        onAddClick={vi.fn()}
      />
    );

    const polandBtn = screen.getByRole('button', { name: /poland office/i });
    await user.click(polandBtn);

    expect(handleSelect).toHaveBeenCalledWith('poland-office');
  });

  it('triggers onAddClick when "+" button is clicked', async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn();

    render(
      <ChannelList
        channels={SEED_CHANNELS}
        activeChannelId="introductions"
        onSelectChannel={vi.fn()}
        onAddClick={handleAdd}
      />
    );

    const addBtn = screen.getByRole('button', { name: /add channel/i });
    await user.click(addBtn);

    expect(handleAdd).toHaveBeenCalledTimes(1);
  });
});
