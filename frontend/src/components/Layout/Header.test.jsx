import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import { AuthProvider } from '../../context/AuthContext';
import Header from './Header';

beforeEach(() => {
  localStorage.clear();
});

const renderHeader = (initialRoute = '/') =>
  render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Header />
        </MemoryRouter>
      </CartProvider>
    </AuthProvider>
  );

const renderHeaderWithEmail = (email, initialRoute = '/') => {
  localStorage.setItem('RaftFoodLab_email', email);
  return render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Header />
        </MemoryRouter>
      </CartProvider>
    </AuthProvider>
  );
};

describe('Header', () => {
  it('should render the logo', () => {
    renderHeader();
    expect(screen.getByText('RaftFoodLab')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    renderHeader();
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  it('should not show Admin link for regular users', () => {
    renderHeaderWithEmail('user@test.com');
    expect(screen.queryByRole('link', { name: /admin/i })).not.toBeInTheDocument();
  });

  it('should show Admin link for admin users', () => {
    renderHeaderWithEmail('admin@mail.com');
    // Nav link "Admin" + badge "Admin" both present
    const adminElements = screen.getAllByText('Admin');
    expect(adminElements.length).toBeGreaterThanOrEqual(1);
  });

  it('should show user email when authenticated', () => {
    renderHeaderWithEmail('user@test.com');
    expect(screen.getByText('user@test.com')).toBeInTheDocument();
  });

  it('should show logout button when authenticated', () => {
    renderHeaderWithEmail('user@test.com');
    expect(screen.getByLabelText('Logout')).toBeInTheDocument();
  });

  it('should not show logout when not authenticated', () => {
    renderHeader();
    expect(screen.queryByLabelText('Logout')).not.toBeInTheDocument();
  });

  it('should show Admin badge for admin user', () => {
    renderHeaderWithEmail('admin@mail.com');
    const adminElements = screen.getAllByText('Admin');
    // Nav link + badge
    expect(adminElements.length).toBeGreaterThanOrEqual(2);
  });
});
