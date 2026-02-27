import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

/**
 * Custom hook for Socket.io connection management.
 * Provides real-time order status updates and new order notifications.
 *
 * @param {Function} onStatusUpdate  Called when an existing order's status changes
 * @param {Function} [onNewOrder]    Called when a brand-new order is placed
 */
export function useSocket(onStatusUpdate, onNewOrder) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('orderStatusUpdate', (data) => {
      if (onStatusUpdate) onStatusUpdate(data);
    });

    socket.on('newOrder', (data) => {
      if (onNewOrder) onNewOrder(data);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [onStatusUpdate, onNewOrder]);

  const trackOrder = useCallback((orderId) => {
    if (socketRef.current) {
      socketRef.current.emit('trackOrder', orderId);
    }
  }, []);

  const untrackOrder = useCallback((orderId) => {
    if (socketRef.current) {
      socketRef.current.emit('untrackOrder', orderId);
    }
  }, []);

  return { trackOrder, untrackOrder, socket: socketRef };
}

