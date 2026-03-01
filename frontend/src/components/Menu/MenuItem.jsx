import { Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/validators';
import Button from '../UI/Button';

export default function MenuItem({ item }) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-full text-gray-700">
          {item.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
        <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2 max-h-10">{item.description}</p>

        <div className="flex items-center justify-between min-h-10">
          <span className="text-xl font-bold text-gray-900 min-h-8">
            {formatCurrency(item.price)}
          </span>

          {quantity > 0 ? (
            /* Quantity stepper */
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="xs"
                onClick={() => updateQuantity(item.id, quantity - 1)}
                className="w-8 h-8"
                aria-label={`Decrease quantity of ${item.name}`}
              >
                <Minus size={14} />
              </Button>
              <span className="w-6 text-center font-semibold text-gray-900 text-sm">
                {quantity}
              </span>
              <Button
                variant="secondary"
                size="xs"
                onClick={() => addItem(item)}
                disabled={quantity >= 99}
                className="w-8 h-8"
                aria-label={`Increase quantity of ${item.name}`}
              >
                <Plus size={14} />
              </Button>
            </div>
          ) : (
            /* Add button */
            <Button
              size="md"
              onClick={() => addItem(item)}
              aria-label={`Add ${item.name} to cart`}
            >
              <Plus size={16} />
              <span>Add</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

