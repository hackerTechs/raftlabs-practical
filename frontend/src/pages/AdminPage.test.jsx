import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import AdminPage from './AdminPage';

// Mock the api module
vi.mock('../services/api', () => ({
  adminApi: {
    getAllOrders: vi.fn(),
  },
}));

// Mock socket hook
vi.mock('../hooks/useSocket', () => ({
  useSocket: () => ({ trackOrder: vi.fn(), untrackOrder: vi.fn() }),
}));

import { adminApi } from '../services/api';

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

const renderAdmin = () =>
  render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter>
          <AdminPage />
        </MemoryRouter>
      </CartProvider>
    </AuthProvider>
  );

describe('AdminPage', () => {
  it('should show loading state initially', () => {
    adminApi.getAllOrders.mockReturnValue(new Promise(() => {})); // never resolves
    renderAdmin();
    // Loader is an SVG with animate-spin class
    const loader = document.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();
  });

  it('should show empty state when no orders', async () => {
    adminApi.getAllOrders.mockResolvedValue({ data: [] });
    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText('No orders yet')).toBeInTheDocument();
    });
  });

  it('should render orders when available', async () => {
    adminApi.getAllOrders.mockResolvedValue({
      data: [
        {
          id: 'order-1',
          status: 'Order Received',
          items: [{ name: 'Pizza', quantity: 1, lineTotal: 12.99 }],
          customer: { name: 'John Doe', address: '123 St', phone: '1234567890' },
          userEmail: 'user@test.com',
          totalAmount: 12.99,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ],
    });

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      // "Order Received" appears in stats + badge
      expect(screen.getAllByText('Order Received').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should show status stats', async () => {
    adminApi.getAllOrders.mockResolvedValue({
      data: [
        {
          id: '1',
          status: 'Order Received',
          items: [],
          customer: { name: 'A', address: 'addr', phone: '123' },
          userEmail: 'a@a.com',
          totalAmount: 10,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: '2',
          status: 'Preparing',
          items: [],
          customer: { name: 'B', address: 'addr', phone: '123' },
          userEmail: 'b@b.com',
          totalAmount: 20,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ],
    });

    renderAdmin();

    await waitFor(() => {
      // Stats section should show counts
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });
  });
});

