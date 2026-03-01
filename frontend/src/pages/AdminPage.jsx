import { useState, useEffect, useCallback } from 'react';
import { Shield, Loader2, ClipboardList, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import AdminOrderCard from '../components/Admin/AdminOrderCard';
import Button from '../components/UI/Button';

export default function AdminPage() {
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
  }, []);

  const handleNewOrder = useCallback((order) => {
    setOrders((prev) => {
      // Avoid duplicates (e.g. if admin placed the order themselves)
      if (prev.some((o) => o.id === order.id)) return prev;
      return [order, ...prev];
    });
    toast.success(`New order from ${order.customer?.name || order.userEmail}`, {
      icon: '🔔',
      duration: 4000,
    });
  }, []);

  useSocket(handleStatusUpdate, handleNewOrder);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await adminApi.getAllOrders();
        setOrders(res.data);
      } catch (err) {
        toast.error(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Production polling: refetch orders periodically (no WebSocket on Vercel)
  useEffect(() => {
    if (!import.meta.env.PROD) return;

    const interval = setInterval(async () => {
      try {
        const res = await adminApi.getAllOrders();
        setOrders((prev) => {
          // Detect new orders that weren't in the previous list
          const prevIds = new Set(prev.map((o) => o.id));
          const incoming = res.data;
          for (const order of incoming) {
            if (!prevIds.has(order.id)) {
              toast.success(
                `New order from ${order.customer?.name || order.userEmail}`,
                { icon: '🔔', duration: 4000 }
              );
            }
          }
          return incoming;
        });
      } catch {
        // ignore — next poll will retry
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleOrderStatusUpdate = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
  };

  const handleOrderDelete = (orderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500">Manage all orders across users</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardList size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Orders from all users will appear here.</p>
          <Button to="/">
            Browse Menu
            <ArrowRight size={16} />
          </Button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {['Order Received', 'Preparing', 'Out for Delivery', 'Delivered'].map(
              (status) => {
                const count = orders.filter((o) => o.status === status).length;
                return (
                  <div
                    key={status}
                    className="bg-white rounded-xl border border-gray-100 p-4 text-center"
                  >
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-xs text-gray-500 mt-1">{status}</p>
                  </div>
                );
              }
            )}
          </div>

          {/* Order list */}
          <div className="space-y-3">
            {orders
              .slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((order) => (
                <AdminOrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={handleOrderStatusUpdate}
                  onDelete={handleOrderDelete}
                />
              ))}
          </div>
        </>
      )}
    </div>
  );
}

