import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App.jsx';

describe('AppLayout Responsive Sidebar Drawer [SIDEBAR] B4', () => {
  it('opens sidebar drawer on mobile hamburger button click', async () => {
    const user = userEvent.setup();
    render(<App />);

    const hamburgerBtn = screen.getByRole('button', { name: /open sidebar/i });
    expect(hamburgerBtn).toBeInTheDocument();
    expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'false');

    const sidebar = screen.getByRole('complementary', { name: /sidebar/i });
    expect(sidebar).not.toHaveClass('sidebar--open');

    // Click hamburger button to open drawer
    await user.click(hamburgerBtn);

    expect(sidebar).toHaveClass('sidebar--open');
    expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes sidebar drawer when pressing Escape', async () => {
    const user = userEvent.setup();
    render(<App />);

    const hamburgerBtn = screen.getByRole('button', { name: /open sidebar/i });
    const sidebar = screen.getByRole('complementary', { name: /sidebar/i });

    // Open drawer
    await user.click(hamburgerBtn);
    expect(sidebar).toHaveClass('sidebar--open');

    // Press Escape
    await user.keyboard('{escape}');

    expect(sidebar).not.toHaveClass('sidebar--open');
    expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes sidebar drawer when selecting a channel', async () => {
    const user = userEvent.setup();
    render(<App />);

    const hamburgerBtn = screen.getByRole('button', { name: /open sidebar/i });
    const sidebar = screen.getByRole('complementary', { name: /sidebar/i });

    // Open drawer
    await user.click(hamburgerBtn);
    expect(sidebar).toHaveClass('sidebar--open');

    // Select another channel
    const polandBtn = screen.getByRole('button', { name: /poland office/i });
    await user.click(polandBtn);

    expect(sidebar).not.toHaveClass('sidebar--open');
    expect(polandBtn).toHaveAttribute('aria-current', 'true');
  });
});
