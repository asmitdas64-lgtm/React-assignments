import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddChannelForm from './AddChannelForm.jsx';
import { SEED_CHANNELS } from '../../constants/users.js';

describe('AddChannelForm [SIDEBAR] B2 & [SECURITY] F1', () => {
  it('renders input with placeholder, autofocus, and submit/cancel buttons', () => {
    render(
      <AddChannelForm
        existingChannels={SEED_CHANNELS}
        onAddChannel={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox', { name: /new channel name/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('placeholder', 'New channel name');
    expect(screen.getByRole('button', { name: /create channel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('submits valid channel name on Enter and calls onAddChannel', async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn().mockReturnValue({ ok: true });

    render(
      <AddChannelForm
        existingChannels={SEED_CHANNELS}
        onAddChannel={handleAdd}
        onCancel={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox', { name: /new channel name/i });
    await user.type(input, 'Engineering Team{enter}');

    expect(handleAdd).toHaveBeenCalledWith('Engineering Team');
  });

  it('displays Zod validation error alert when submitting empty input', async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn();

    render(
      <AddChannelForm
        existingChannels={SEED_CHANNELS}
        onAddChannel={handleAdd}
        onCancel={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox', { name: /new channel name/i });
    await user.type(input, '   {enter}');

    expect(handleAdd).not.toHaveBeenCalled();
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/channel name is required/i);
  });

  it('rejects duplicate channel names (case-insensitive & slug uniqueness)', async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn();

    render(
      <AddChannelForm
        existingChannels={SEED_CHANNELS} // contains Introductions
        onAddChannel={handleAdd}
        onCancel={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox', { name: /new channel name/i });
    await user.type(input, 'introductions{enter}');

    expect(handleAdd).not.toHaveBeenCalled();
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/channel already exists/i);
  });

  it('cancels and calls onCancel when pressing Escape', async () => {
    const user = userEvent.setup();
    const handleCancel = vi.fn();

    render(
      <AddChannelForm
        existingChannels={SEED_CHANNELS}
        onAddChannel={vi.fn()}
        onCancel={handleCancel}
      />
    );

    const input = screen.getByRole('textbox', { name: /new channel name/i });
    await user.type(input, '{escape}');

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
