import { formatCurrency } from '../../utils/validators';
import OrderTracker from './OrderTracker';

export default function OrderStatus({ order }) {
  if (!order) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm opacity-80">Order ID</p>
            <p className="font-mono text-sm mt-1">{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Placed at</p>
            <p className="text-sm mt-1">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tracker */}
      <div className="px-6 py-4">
        <OrderTracker currentStatus={order.status} />
      </div>

      {/* Items */}
      <div className="px-6 pb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Items Ordered</h3>
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(item.lineTotal)}
              </span>
            </div>
          ))}
        </div>
        <hr className="my-3" />
        <div className="flex justify-between">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-bold text-gray-900">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-gray-50 px-6 py-4">
        <h3 className="font-semibold text-gray-900 mb-2">Delivery Details</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <span className="font-medium">Name:</span> {order.customer.name}
          </p>
          <p>
            <span className="font-medium">Address:</span> {order.customer.address}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {order.customer.phone}
          </p>
        </div>
      </div>
    </div>
  );
}

