import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CartProvider } from '../../context/CartContext';
import MenuList from './MenuList';

const mockItems = [
  {
    id: '1',
    name: 'Pizza',
    description: 'Delicious pizza',
    price: 12.99,
    image: 'pizza.jpg',
    category: 'Pizza',
  },
  {
    id: '2',
    name: 'Burger',
    description: 'Tasty burger',
    price: 10.99,
    image: 'burger.jpg',
    category: 'Burgers',
  },
];

const renderList = (props) =>
  render(
    <CartProvider>
      <MenuList {...props} />
    </CartProvider>
  );

describe('MenuList', () => {
  it('should render loading skeletons when loading', () => {
    const { container } = renderList({ items: [], loading: true });
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render empty message when no items', () => {
    renderList({ items: [], loading: false });
    expect(screen.getByText(/No items found/)).toBeInTheDocument();
  });

  it('should render all menu items', () => {
    renderList({ items: mockItems, loading: false });
    expect(screen.getByText('Delicious pizza')).toBeInTheDocument();
    expect(screen.getByText('Tasty burger')).toBeInTheDocument();
  });

  it('should render correct number of items', () => {
    renderList({ items: mockItems, loading: false });
    const addButtons = screen.getAllByText('Add');
    expect(addButtons).toHaveLength(2);
  });
});

