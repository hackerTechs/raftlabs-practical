import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderApi } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import OrderStatusComponent from '../components/Order/OrderStatus';
import Button from '../components/UI/Button';

export default function OrderStatusPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleStatusUpdate = useCallback(
    (data) => {
      if (data.orderId === id) {
        setOrder((prev) =>
          prev
            ? { ...prev, status: data.status, updatedAt: data.updatedAt }
            : prev
        );
        toast.success(`Order status: ${data.status}`, {
          icon: '📦',
          duration: 3000,
        });
      }
    },
    [id]
  );

  const { trackOrder } = useSocket(handleStatusUpdate);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderApi.getById(id);
        setOrder(res.data);
        trackOrder(id);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, trackOrder]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Button to="/orders">
          View All Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Button to="/orders" variant="ghost" size="sm" className="mb-4">
        <ArrowLeft size={16} />
        All Orders
      </Button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Tracking</h1>
      <OrderStatusComponent order={order} />
    </div>
  );
}

