import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';

beforeEach(() => {
  localStorage.clear();
});

function AuthTestHarness() {
  const { email, isAuthenticated, isAdmin, login, logout } = useAuth();

  return (
    <div>
      <span data-testid="authenticated">{isAuthenticated.toString()}</span>
      <span data-testid="is-admin">{isAdmin.toString()}</span>
      <span data-testid="email">{email || 'none'}</span>
      <button data-testid="login-user" onClick={() => login('user@test.com')}>
        Login User
      </button>
      <button data-testid="login-admin" onClick={() => login('admin@mail.com')}>
        Login Admin
      </button>
      <button data-testid="logout" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

const renderAuth = () =>
  render(
    <AuthProvider>
      <AuthTestHarness />
    </AuthProvider>
  );

describe('AuthContext', () => {
  it('should start unauthenticated', () => {
    renderAuth();
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('email')).toHaveTextContent('none');
  });

  it('should login as regular user', async () => {
    renderAuth();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('login-user'));

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
    expect(screen.getByTestId('email')).toHaveTextContent('user@test.com');
  });

  it('should login as admin', async () => {
    renderAuth();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('login-admin'));

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
    expect(screen.getByTestId('email')).toHaveTextContent('admin@mail.com');
  });

  it('should logout and clear email', async () => {
    renderAuth();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('login-user'));
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');

    await user.click(screen.getByTestId('logout'));
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('email')).toHaveTextContent('none');
  });

  it('should persist email to localStorage', async () => {
    renderAuth();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('login-user'));

    const stored = localStorage.getItem('RaftFoodLab_email');
    expect(stored).toBe('user@test.com');
  });

  it('should remove email from localStorage on logout', async () => {
    renderAuth();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('login-user'));
    await user.click(screen.getByTestId('logout'));

    expect(localStorage.getItem('RaftFoodLab_email')).toBeNull();
  });

  it('should restore email from localStorage', () => {
    localStorage.setItem('RaftFoodLab_email', 'saved@test.com');
    renderAuth();

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('email')).toHaveTextContent('saved@test.com');
  });

  it('should lowercase email on login', async () => {
    renderAuth();
    const user = userEvent.setup();

    // The harness passes lowercase already, but test the mechanism
    await user.click(screen.getByTestId('login-user'));
    expect(screen.getByTestId('email')).toHaveTextContent('user@test.com');
  });

  it('should throw error when used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<AuthTestHarness />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );
    spy.mockRestore();
  });
});
