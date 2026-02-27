import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider } from '../../context/CartContext';
import MenuItem from './MenuItem';

const mockItem = {
  id: '1',
  name: 'Margherita Pizza',
  description: 'Classic pizza with fresh mozzarella',
  price: 12.99,
  image: 'https://example.com/pizza.jpg',
  category: 'Pizza',
};

const renderMenuItem = (item = mockItem) =>
  render(
    <CartProvider>
      <MenuItem item={item} />
    </CartProvider>
  );

describe('MenuItem', () => {
  it('should render item name', () => {
    renderMenuItem();
    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
  });

  it('should render item description', () => {
    renderMenuItem();
    expect(screen.getByText(/Classic pizza/)).toBeInTheDocument();
  });

  it('should render item price', () => {
    renderMenuItem();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
  });

  it('should render item category badge', () => {
    renderMenuItem();
    expect(screen.getByText('Pizza')).toBeInTheDocument();
  });

  it('should render item image with alt text', () => {
    renderMenuItem();
    const img = screen.getByAltText('Margherita Pizza');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', mockItem.image);
  });

  it('should show "Add" button initially', () => {
    renderMenuItem();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('should show quantity stepper after clicking add', async () => {
    renderMenuItem();
    const user = userEvent.setup();

    await user.click(screen.getByLabelText('Add Margherita Pizza to cart'));

    // Add button should be replaced by quantity stepper
    expect(screen.queryByText('Add')).not.toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByLabelText('Increase quantity of Margherita Pizza')).toBeInTheDocument();
    expect(screen.getByLabelText('Decrease quantity of Margherita Pizza')).toBeInTheDocument();
  });

  it('should increase quantity on + click', async () => {
    renderMenuItem();
    const user = userEvent.setup();

    await user.click(screen.getByLabelText('Add Margherita Pizza to cart'));
    expect(screen.getByText('1')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Increase quantity of Margherita Pizza'));
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should show Add button again when quantity is decreased to zero', async () => {
    renderMenuItem();
    const user = userEvent.setup();

    // Add item (quantity = 1)
    await user.click(screen.getByLabelText('Add Margherita Pizza to cart'));
    expect(screen.getByText('1')).toBeInTheDocument();

    // Decrease to 0 → should show Add button again
    await user.click(screen.getByLabelText('Decrease quantity of Margherita Pizza'));
    expect(screen.getByText('Add')).toBeInTheDocument();
    expect(screen.getByLabelText('Add Margherita Pizza to cart')).toBeInTheDocument();
  });

  it('should have accessible button label', () => {
    renderMenuItem();
    expect(screen.getByLabelText('Add Margherita Pizza to cart')).toBeInTheDocument();
  });
});

