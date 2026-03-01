import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from './CartContext';

// Helper component to expose cart actions
function CartTestHarness() {
  const { items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalAmount } =
    useCart();

  const mockItem = { id: '1', name: 'Pizza', price: 12.99, image: 'test.jpg' };
  const mockItem2 = { id: '2', name: 'Burger', price: 10.99, image: 'test2.jpg' };

  return (
    <div>
      <span data-testid="total-items">{totalItems}</span>
      <span data-testid="total-amount">{totalAmount.toFixed(2)}</span>
      <span data-testid="item-count">{items.length}</span>
      {items.map((i) => (
        <span key={i.id} data-testid={`qty-${i.id}`}>
          {i.quantity}
        </span>
      ))}
      <button data-testid="add-pizza" onClick={() => addItem(mockItem)}>
        Add Pizza
      </button>
      <button data-testid="add-burger" onClick={() => addItem(mockItem2)}>
        Add Burger
      </button>
      <button data-testid="remove-1" onClick={() => removeItem('1')}>
        Remove 1
      </button>
      <button data-testid="update-qty" onClick={() => updateQuantity('1', 5)}>
        Set Qty 5
      </button>
      <button data-testid="update-qty-zero" onClick={() => updateQuantity('1', 0)}>
        Set Qty 0
      </button>
      <button data-testid="clear" onClick={() => clearCart()}>
        Clear
      </button>
    </div>
  );
}

const renderWithCart = () =>
  render(
    <CartProvider>
      <CartTestHarness />
    </CartProvider>
  );

describe('CartContext', () => {
  it('should start with empty cart', () => {
    renderWithCart();
    expect(screen.getByTestId('total-items')).toHaveTextContent('0');
    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
  });

  it('should add an item to cart', async () => {
    renderWithCart();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('add-pizza'));
    expect(screen.getByTestId('total-items')).toHaveTextContent('1');
    expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    expect(screen.getByTestId('total-amount')).toHaveTextContent('12.99');
  });

  it('should increment quantity when adding same item', async () => {
    renderWithCart();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('add-pizza'));
    await user.click(screen.getByTestId('add-pizza'));
    expect(screen.getByTestId('total-items')).toHaveTextContent('1');
    expect(screen.getByTestId('qty-1')).toHaveTextContent('2');
  });

  it('should add multiple different items', async () => {
    renderWithCart();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('add-pizza'));
    await user.click(screen.getByTestId('add-burger'));
    expect(screen.getByTestId('item-count')).toHaveTextContent('2');
    expect(screen.getByTestId('total-items')).toHaveTextContent('2');
  });

  it('should remove an item from cart', async () => {
    renderWithCart();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('add-pizza'));
    await user.click(screen.getByTestId('remove-1'));
    expect(screen.getByTestId('total-items')).toHaveTextContent('0');
    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
  });

  it('should update item quantity', async () => {
    renderWithCart();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('add-pizza'));
    await user.click(screen.getByTestId('update-qty'));
    expect(screen.getByTestId('qty-1')).toHaveTextContent('5');
    expect(screen.getByTestId('total-items')).toHaveTextContent('1');
  });

  it('should remove item when quantity set to 0', async () => {
    renderWithCart();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('add-pizza'));
    await user.click(screen.getByTestId('update-qty-zero'));
    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
  });

  it('should clear all items', async () => {
    renderWithCart();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('add-pizza'));
    await user.click(screen.getByTestId('add-burger'));
    await user.click(screen.getByTestId('clear'));
    expect(screen.getByTestId('total-items')).toHaveTextContent('0');
    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
  });

  it('should compute correct total amount with multiple items', async () => {
    renderWithCart();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('add-pizza')); // 12.99
    await user.click(screen.getByTestId('add-burger')); // 10.99
    expect(screen.getByTestId('total-amount')).toHaveTextContent('23.98');
  });

  it('should throw error when useCart is used outside CartProvider', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<CartTestHarness />)).toThrow(
      'useCart must be used within a CartProvider'
    );
    spy.mockRestore();
  });
});

