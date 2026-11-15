import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Header } from './Header.jsx';

describe('Header Component [CORE]', () => {
  it('renders banner landmark and "Photo gallery" title', () => {
    render(<Header />);

    const banner = screen.getByRole('banner');
    expect(banner).toBeInTheDocument();

    const title = screen.getByRole('heading', { level: 1, name: /photo gallery/i });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Photo gallery');
  });

  it('applies the serif heading class', () => {
    render(<Header />);
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('gallery-header-title');
  });
});
