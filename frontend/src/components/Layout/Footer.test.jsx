import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('should render the brand name', () => {
    render(<Footer />);
    expect(screen.getByText('RaftFoodLab')).toBeInTheDocument();
  });

  it('should render the copyright text', () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it('should mention RaftLabs', () => {
    render(<Footer />);
    expect(screen.getByText(/RaftLabs/)).toBeInTheDocument();
  });
});

