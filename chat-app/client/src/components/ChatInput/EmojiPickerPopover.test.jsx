import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmojiPickerPopover from './EmojiPickerPopover.jsx';

describe('EmojiPickerPopover Component [CORE+] C', () => {
  it('renders emoji picker dialog container', () => {
    render(
      <EmojiPickerPopover
        isOpen={true}
        onEmojiSelect={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const dialog = screen.getByRole('dialog', { name: /emoji picker/i });
    expect(dialog).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <EmojiPickerPopover
        isOpen={false}
        onEmojiSelect={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByRole('dialog', { name: /emoji picker/i })).not.toBeInTheDocument();
  });

  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <EmojiPickerPopover
        isOpen={true}
        onEmojiSelect={vi.fn()}
        onClose={handleClose}
      />
    );

    await user.keyboard('{escape}');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
