import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderApi } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { formatCurrency } from '../utils/validators';
import Button from '../components/UI/Button';

const STATUS_BADGE = {
  'Order Received': 'bg-blue-100 text-blue-700',
  Preparing: 'bg-yellow-100 text-yellow-700',
  'Out for Delivery': 'bg-orange-100 text-orange-700',
  Delivered: 'bg-green-100 text-green-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleStatusUpdate = useCallback((data) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === data.orderId
          ? { ...o, status: data.status, updatedAt: data.updatedAt }
          : o
      )
    );
    toast.success(`Order updated: ${data.status}`, { icon: '📦' });
  }, []);

  useSocket(handleStatusUpdate);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderApi.getAll();
        setOrders(res.data);
      } catch (err) {
        toast.error(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <ClipboardList size={64} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
        <p className="text-gray-500 mb-6">Place your first order from the menu!</p>
        <Button to="/">
          Browse Menu
          <ArrowRight size={16} />
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h1>
      <div className="space-y-4">
        {orders
          .slice()
          .reverse()
          .map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-gray-400">
                  {order.id.slice(0, 8)}...
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-600'}`}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} •{' '}
                    {formatCurrency(order.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <ArrowRight size={16} className="text-gray-400" />
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}

