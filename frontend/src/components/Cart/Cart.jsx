import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/validators';
import CartItem from './CartItem';
import Button from '../UI/Button';

export default function Cart() {
  const { items, clearCart, totalAmount } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingBag size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some delicious items from our menu!</p>
        <Button to="/">
          Browse Menu
          <ArrowRight size={16} />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {items.length} item{items.length !== 1 ? 's' : ''} in cart
        </h2>
        <Button variant="danger" size="sm" onClick={clearCart}>
          <Trash2 size={14} />
          Clear All
        </Button>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold">{formatCurrency(totalAmount)}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-semibold text-green-600">Free</span>
        </div>
        <hr className="my-4" />
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(totalAmount)}
          </span>
        </div>
        <Button to="/checkout" fullWidth>
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}

