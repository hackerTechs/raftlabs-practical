import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OrderTracker from './OrderTracker';

describe('OrderTracker', () => {
  it('should render all status steps', () => {
    render(<OrderTracker currentStatus="Order Received" />);
    expect(screen.getByText('Order Received')).toBeInTheDocument();
    expect(screen.getByText('Preparing')).toBeInTheDocument();
    expect(screen.getByText('Out for Delivery')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('should show "Current" label at active step', () => {
    render(<OrderTracker currentStatus="Preparing" />);
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('should show "Current" on first step for Order Received', () => {
    render(<OrderTracker currentStatus="Order Received" />);
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('should show "Current" on last step for Delivered', () => {
    render(<OrderTracker currentStatus="Delivered" />);
    expect(screen.getByText('Current')).toBeInTheDocument();
  });
});

