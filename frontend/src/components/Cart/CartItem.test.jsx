import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '../../context/CartContext';
import CartItem from './CartItem';

const mockItem = {
  id: '1',
  name: 'Margherita Pizza',
  price: 12.99,
  image: 'pizza.jpg',
  quantity: 2,
};

// Wrapper that pre-adds the item to cart
function CartItemWrapper({ item }) {
  return (
    <CartProvider>
      <CartItemInner item={item} />
    </CartProvider>
  );
}

function CartItemInner({ item }) {
  const { addItem, items } = useCart();

  // Initialize item in cart if not present
  if (items.length === 0) {
    // We need to add it. Using a ref to avoid infinite loop
    return (
      <button data-testid="init" onClick={() => addItem(item)}>
        Init
      </button>
    );
  }

  const cartItem = items.find((i) => i.id === item.id);
  // Adjust quantity if needed
  return <CartItem item={{ ...cartItem, quantity: item.quantity }} />;
}

describe('CartItem', () => {
  it('should render item name', async () => {
    render(<CartItemWrapper item={mockItem} />);
    const user = userEvent.setup();

    // Initialize
    await user.click(screen.getByTestId('init'));

    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
  });

  it('should render item price', async () => {
    render(<CartItemWrapper item={mockItem} />);
    const user = userEvent.setup();
    await user.click(screen.getByTestId('init'));

    expect(screen.getByText('$12.99 each')).toBeInTheDocument();
  });

  it('should render quantity', async () => {
    render(<CartItemWrapper item={mockItem} />);
    const user = userEvent.setup();
    await user.click(screen.getByTestId('init'));

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should have decrease and increase buttons', async () => {
    render(<CartItemWrapper item={mockItem} />);
    const user = userEvent.setup();
    await user.click(screen.getByTestId('init'));

    expect(screen.getByLabelText(/Decrease/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Increase/)).toBeInTheDocument();
  });

  it('should have remove button', async () => {
    render(<CartItemWrapper item={mockItem} />);
    const user = userEvent.setup();
    await user.click(screen.getByTestId('init'));

    expect(screen.getByLabelText(/Remove/)).toBeInTheDocument();
  });
});

