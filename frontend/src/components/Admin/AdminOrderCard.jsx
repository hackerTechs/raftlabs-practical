import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/api';
import { formatCurrency } from '../../utils/validators';
import Button from '../UI/Button';

const STATUS_FLOW = ['Order Received', 'Preparing', 'Out for Delivery', 'Delivered'];

const STATUS_COLORS = {
  'Order Received': 'bg-blue-100 text-blue-700',
  Preparing: 'bg-yellow-100 text-yellow-700',
  'Out for Delivery': 'bg-orange-100 text-orange-700',
  Delivered: 'bg-green-100 text-green-700',
};

export default function AdminOrderCard({ order, onStatusUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIndex + 1] : null;

  const handleAdvanceStatus = async () => {
    if (!nextStatus) return;
    setUpdating(true);
    try {
      const res = await adminApi.updateStatus(order.id, nextStatus);
      onStatusUpdate(res.data);
      toast.success(`Status updated to "${nextStatus}"`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    setDeleting(true);
    try {
      await adminApi.deleteOrder(order.id);
      onDelete(order.id);
      toast.success('Order deleted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-gray-400 shrink-0">
            {order.id.slice(0, 8)}
          </span>
          <span className="text-sm font-medium text-gray-900 truncate">
            {order.customer.name}
          </span>
          <span className="text-xs text-gray-400 hidden sm:inline">
            {order.userEmail}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}
          >
            {order.status}
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(order.totalAmount)}
          </span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Items */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</h4>
            <div className="space-y-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Delivery</h4>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p>{order.customer.name}</p>
              <p>{order.customer.address}</p>
              <p>{order.customer.phone}</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="text-xs text-gray-400">
            <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(order.updatedAt).toLocaleString()}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            {nextStatus ? (
              <Button size="sm" onClick={handleAdvanceStatus} loading={updating}>
                Advance to &ldquo;{nextStatus}&rdquo;
              </Button>
            ) : (
              <span className="text-sm text-green-600 font-medium">✅ Completed</span>
            )}

            <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
              {!deleting && <Trash2 size={14} />}
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

