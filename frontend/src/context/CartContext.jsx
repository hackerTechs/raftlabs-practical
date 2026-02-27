import { createContext, useContext, useReducer, useCallback } from 'react';

const CartContext = createContext(null);

// ── Actions ─────────────────────────────────────────────────────────────────
const ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
};

// ── Reducer ─────────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_ITEM: {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.payload.id
              ? { ...i, quantity: Math.min(i.quantity + 1, 99) }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }

    case ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload),
      };

    case ACTIONS.UPDATE_QUANTITY: {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.id !== id) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === id ? { ...i, quantity: Math.min(quantity, 99) } : i
        ),
      };
    }

    case ACTIONS.CLEAR_CART:
      return { ...state, items: [] };

    default:
      return state;
  }
}

// ── Provider ────────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addItem = useCallback(
    (item) => dispatch({ type: ACTIONS.ADD_ITEM, payload: item }),
    []
  );

  const removeItem = useCallback(
    (id) => dispatch({ type: ACTIONS.REMOVE_ITEM, payload: id }),
    []
  );

  const updateQuantity = useCallback(
    (id, quantity) =>
      dispatch({ type: ACTIONS.UPDATE_QUANTITY, payload: { id, quantity } }),
    []
  );

  const clearCart = useCallback(
    () => dispatch({ type: ACTIONS.CLEAR_CART }),
    []
  );

  // const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalItems = state.items.length
  const totalAmount = state.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

