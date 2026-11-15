import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MentionList from './MentionList.jsx';

describe('MentionList Component [CORE+] D', () => {
  const mockMatches = ['Alan', 'Carol'];

  it('renders listbox with matching usernames and correct ARIA attributes', () => {
    render(
      <MentionList
        matches={mockMatches}
        activeIndex={0}
        onSelectMention={vi.fn()}
      />
    );

    const listbox = screen.getByRole('listbox', { name: /user mentions/i });
    expect(listbox).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Alan');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).toHaveTextContent('Carol');
    expect(options[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('invokes onSelectMention when an option is clicked', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(
      <MentionList
        matches={mockMatches}
        activeIndex={0}
        onSelectMention={handleSelect}
      />
    );

    const carolOption = screen.getByRole('option', { name: /carol/i });
    await user.click(carolOption);

    expect(handleSelect).toHaveBeenCalledWith('Carol');
  });

  it('renders empty message when no matches are found', () => {
    render(
      <MentionList
        matches={[]}
        activeIndex={0}
        onSelectMention={vi.fn()}
      />
    );

    expect(screen.getByText(/no matching users/i)).toBeInTheDocument();
  });
});
