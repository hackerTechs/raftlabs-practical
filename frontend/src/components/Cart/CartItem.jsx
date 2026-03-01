import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/validators';
import Button from '../UI/Button';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      {/* Image */}
      <img
        src={item.image}
        alt={item.name}
        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
        <p className="text-sm text-gray-500">{formatCurrency(item.price)} each</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="xs"
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="w-8 h-8"
          aria-label={`Decrease quantity of ${item.name}`}
        >
          <Minus size={14} />
        </Button>
        <span className="w-8 text-center font-semibold text-gray-900">{item.quantity}</span>
        <Button
          variant="secondary"
          size="xs"
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          disabled={item.quantity >= 99}
          className="w-8 h-8"
          aria-label={`Increase quantity of ${item.name}`}
        >
          <Plus size={14} />
        </Button>
      </div>

      {/* Line Total */}
      <div className="text-right min-w-[80px]">
        <p className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
      </div>

      {/* Remove */}
      <Button
        variant="danger"
        size="xs"
        onClick={() => removeItem(item.id)}
        className="p-1"
        aria-label={`Remove ${item.name} from cart`}
      >
        <Trash2 size={18} />
      </Button>
    </div>
  );
}

