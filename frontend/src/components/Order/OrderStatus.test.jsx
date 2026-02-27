import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OrderStatus from './OrderStatus';

const mockOrder = {
  id: 'abc-123-def',
  status: 'Preparing',
  items: [
    { name: 'Pizza', quantity: 2, price: 12.99, lineTotal: 25.98 },
    { name: 'Burger', quantity: 1, price: 10.99, lineTotal: 10.99 },
  ],
  totalAmount: 36.97,
  customer: {
    name: 'John Doe',
    address: '123 Main St',
    phone: '1234567890',
  },
  createdAt: '2026-01-01T12:00:00.000Z',
  updatedAt: '2026-01-01T12:05:00.000Z',
};

describe('OrderStatus', () => {
  it('should render nothing when no order', () => {
    const { container } = render(<OrderStatus order={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render order ID', () => {
    render(<OrderStatus order={mockOrder} />);
    expect(screen.getByText('abc-123-def')).toBeInTheDocument();
  });

  it('should render order items', () => {
    render(<OrderStatus order={mockOrder} />);
    expect(screen.getByText(/Pizza × 2/)).toBeInTheDocument();
    expect(screen.getByText(/Burger × 1/)).toBeInTheDocument();
  });

  it('should render total amount', () => {
    render(<OrderStatus order={mockOrder} />);
    expect(screen.getByText('$36.97')).toBeInTheDocument();
  });

  it('should render customer details', () => {
    render(<OrderStatus order={mockOrder} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
  });

  it('should render order tracker with current status', () => {
    render(<OrderStatus order={mockOrder} />);
    expect(screen.getByText('Current')).toBeInTheDocument();
  });
});

