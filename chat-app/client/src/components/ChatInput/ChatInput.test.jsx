import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInput from './ChatInput.jsx';

describe('ChatInput', () => {
  it('renders textbox, emoji trigger button, and explicit Send button', () => {
    render(<ChatInput channelName="Introductions" onSend={vi.fn()} />);

    const textbox = screen.getByRole('textbox', { name: /message #introductions/i });
    expect(textbox).toBeInTheDocument();
    expect(textbox).toHaveAttribute('placeholder', 'Type a message...');

    const emojiBtn = screen.getByRole('button', { name: /open emoji picker/i });
    expect(emojiBtn).toBeInTheDocument();

    const sendBtn = screen.getByRole('button', { name: /send message/i });
    expect(sendBtn).toBeInTheDocument();
    expect(sendBtn).toBeDisabled();
  });

  it('submits typed message on Send click and clears & refocused input', async () => {
    const user = userEvent.setup();
    const handleSend = vi.fn();
    render(<ChatInput channelName="Introductions" onSend={handleSend} />);

    const textbox = screen.getByRole('textbox', { name: /message #introductions/i });
    const sendBtn = screen.getByRole('button', { name: /send message/i });

    await user.type(textbox, '  Hello from test!  ');
    expect(sendBtn).not.toBeDisabled();

    await user.click(sendBtn);
    expect(handleSend).toHaveBeenCalledWith('Hello from test!');
    expect(textbox).toHaveValue('');
    expect(textbox).toHaveFocus();
  });

  it('submits on Enter keypress (without shiftKey)', async () => {
    const user = userEvent.setup();
    const handleSend = vi.fn();
    render(<ChatInput channelName="Introductions" onSend={handleSend} />);

    const textbox = screen.getByRole('textbox', { name: /message #introductions/i });
    await user.type(textbox, 'Enter submission{enter}');

    expect(handleSend).toHaveBeenCalledWith('Enter submission');
    expect(textbox).toHaveValue('');
  });

  it('does not send whitespace-only or empty messages', async () => {
    const user = userEvent.setup();
    const handleSend = vi.fn();
    render(<ChatInput channelName="Introductions" onSend={handleSend} />);

    const textbox = screen.getByRole('textbox', { name: /message #introductions/i });
    await user.type(textbox, '   {enter}');

    expect(handleSend).not.toHaveBeenCalled();
  });

  it('displays character counter when exceeding threshold (450 chars)', () => {
    render(<ChatInput channelName="Introductions" onSend={vi.fn()} />);

    const textbox = screen.getByRole('textbox', { name: /message #introductions/i });

    // Below threshold (400 chars) -> counter not visible
    fireEvent.change(textbox, { target: { value: 'a'.repeat(400) } });
    expect(screen.queryByText(/400 \/ 500/i)).not.toBeInTheDocument();

    // At threshold (450 chars) -> counter visible
    fireEvent.change(textbox, { target: { value: 'a'.repeat(450) } });
    expect(screen.getByText('450 / 500')).toBeInTheDocument();
  });
});
