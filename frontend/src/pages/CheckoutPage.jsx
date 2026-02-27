import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CheckoutForm from '../components/Checkout/CheckoutForm';
import Button from '../components/UI/Button';

export default function CheckoutPage() {
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Nothing to checkout</h2>
        <p className="text-gray-500 mb-6">Add items to your cart first.</p>
        <Button to="/">
          Browse Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Button to="/cart" variant="ghost" size="sm" className="mb-4">
        <ArrowLeft size={16} />
        Back to Cart
      </Button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}

