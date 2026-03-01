import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { orderApi } from '../../services/api';
import { validateCheckoutForm, formatCurrency, formatPhoneInput } from '../../utils/validators';
import Button from '../UI/Button';

export default function CheckoutForm() {
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-format phone field as user types
    if (name === 'phone') {
      const formatted = formatPhoneInput(value);
      setForm((prev) => ({ ...prev, phone: formatted }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const validationErrors = validateCheckoutForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
        customer: {
          name: form.name.trim(),
          address: form.address.trim(),
          phone: form.phone.trim(),
        },
      };

      const response = await orderApi.create(orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${response.data.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
    } focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Order Summary */}
      <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
        <h3 className="font-semibold text-orange-800 mb-2">Order Summary</h3>
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-orange-700">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <hr className="my-2 border-orange-200" />
        <div className="flex justify-between font-bold text-orange-900">
          <span>Total</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {/* Customer Details */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Details</h3>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={inputClass('name')}
              autoComplete="name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500" role="alert">{errors.name}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Address
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={form.address}
              onChange={handleChange}
              placeholder="123 Main Street, Apt 4, City"
              className={inputClass('address')}
              autoComplete="street-address"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-500" role="alert">{errors.address}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 XXXXX XXXXX"
              className={inputClass('phone')}
              autoComplete="tel"
              maxLength={16}
            />
            <p className="mt-1 text-xs text-gray-400">
              Format: +91 XXXXX XXXXX
            </p>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500" role="alert">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" fullWidth loading={submitting}>
        {submitting ? 'Placing Order...' : `Place Order — ${formatCurrency(totalAmount)}`}
      </Button>
    </form>
  );
}
