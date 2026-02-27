import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import LoginPage from './LoginPage';

beforeEach(() => {
  localStorage.clear();
});

const renderLogin = () =>
  render(
    <AuthProvider>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthProvider>
  );

describe('LoginPage', () => {
  it('should render the login form', () => {
    renderLogin();
    expect(screen.getByText('RaftFoodLab')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  it('should show demo account info', () => {
    renderLogin();
    expect(screen.getByText(/admin@mail.com/)).toBeInTheDocument();
  });

  it('should show error for empty email', async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.click(screen.getByText('Continue'));
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('should show error for invalid email', async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Email Address'), 'not-valid');
    await user.click(screen.getByText('Continue'));

    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('should clear error when typing', async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.click(screen.getByText('Continue'));
    expect(screen.getByText('Email is required')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Email Address'), 'a');
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
  });

  it('should have email input with correct type', () => {
    renderLogin();
    const input = screen.getByLabelText('Email Address');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should store email in localStorage on valid submit', async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Email Address'), 'user@test.com');
    await user.click(screen.getByText('Continue'));

    expect(localStorage.getItem('RaftFoodLab_email')).toBe('user@test.com');
  });

  it('should not store email on invalid submit', async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Email Address'), 'bad-email');
    await user.click(screen.getByText('Continue'));

    expect(localStorage.getItem('RaftFoodLab_email')).toBeNull();
  });
});
