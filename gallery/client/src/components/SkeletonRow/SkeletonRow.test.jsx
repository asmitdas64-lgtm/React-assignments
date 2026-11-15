import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SkeletonRow } from './SkeletonRow.jsx';

describe('SkeletonRow Component [UX+]', () => {
  it('renders a shimmer row with aria-busy="true" and decorative aria-hidden elements', () => {
    render(<SkeletonRow />);

    const skeleton = screen.getByRole('status', { name: /loading photograph placeholder/i });
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
    expect(skeleton).toHaveClass('skeleton-row');

    // Verify thumbnail placeholder
    const thumbPlaceholder = skeleton.querySelector('.skeleton-thumbnail');
    expect(thumbPlaceholder).toBeInTheDocument();
    expect(thumbPlaceholder).toHaveAttribute('aria-hidden', 'true');

    // Verify text placeholder
    const textPlaceholder = skeleton.querySelector('.skeleton-text');
    expect(textPlaceholder).toBeInTheDocument();
    expect(textPlaceholder).toHaveAttribute('aria-hidden', 'true');

    // Verify button placeholder
    const btnPlaceholder = skeleton.querySelector('.skeleton-button');
    expect(btnPlaceholder).toBeInTheDocument();
    expect(btnPlaceholder).toHaveAttribute('aria-hidden', 'true');
  });
});
