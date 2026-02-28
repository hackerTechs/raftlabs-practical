import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { orderApi } from '../services/api';

const IS_PRODUCTION = import.meta.env.PROD;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
const POLL_INTERVAL = 5000; // 5 seconds

/**
 * Custom hook for real-time order updates.
 *
 * - Development: uses Socket.io for instant push updates.
 * - Production:  uses HTTP polling (Vercel doesn't support WebSockets).
 *
 * @param {Function} onStatusUpdate  Called when an order's status changes
 * @param {Function} [onNewOrder]    Called when a new order is detected
 */
export function useSocket(onStatusUpdate, onNewOrder) {
  const socketRef = useRef(null);
  const pollTimersRef = useRef(new Map()); // orderId → intervalId
  const lastStatusRef = useRef(new Map()); // orderId → last known status

  // Keep callback refs in sync so intervals/socket always call the latest fn
  const onStatusUpdateRef = useRef(onStatusUpdate);
  const onNewOrderRef = useRef(onNewOrder);
  useEffect(() => {
    onStatusUpdateRef.current = onStatusUpdate;
    onNewOrderRef.current = onNewOrder;
  }, [onStatusUpdate, onNewOrder]);

  // ── Socket.io mode (development only) ─────────────────────────────────────
  useEffect(() => {
    if (IS_PRODUCTION) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('orderStatusUpdate', (data) => {
      onStatusUpdateRef.current?.(data);
    });

    socket.on('newOrder', (data) => {
      onNewOrderRef.current?.(data);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, []); // stable — callbacks accessed via refs

  // ── Polling: cleanup all timers on unmount ────────────────────────────────
  useEffect(() => {
    return () => {
      for (const timer of pollTimersRef.current.values()) {
        clearInterval(timer);
      }
      pollTimersRef.current.clear();
    };
  }, []);

  // ── trackOrder ────────────────────────────────────────────────────────────
  const trackOrder = useCallback((orderId) => {
    if (!IS_PRODUCTION) {
      // Socket.io mode: join the order room
      socketRef.current?.emit('trackOrder', orderId);
      return;
    }

    // Polling mode: start polling this specific order
    if (pollTimersRef.current.has(orderId)) return; // already tracking

    const poll = async () => {
      try {
        const res = await orderApi.getById(orderId);
        const order = res.data;
        const prevStatus = lastStatusRef.current.get(orderId);

        if (prevStatus && prevStatus !== order.status) {
          onStatusUpdateRef.current?.({
            orderId: order.id,
            status: order.status,
            updatedAt: order.updatedAt,
          });
        }

        lastStatusRef.current.set(orderId, order.status);
      } catch {
        // Order may have been deleted or network hiccup — skip
      }
    };

    poll(); // initial fetch to capture baseline status
    const timer = setInterval(poll, POLL_INTERVAL);
    pollTimersRef.current.set(orderId, timer);
  }, []);

  // ── untrackOrder ──────────────────────────────────────────────────────────
  const untrackOrder = useCallback((orderId) => {
    if (!IS_PRODUCTION) {
      socketRef.current?.emit('untrackOrder', orderId);
      return;
    }

    const timer = pollTimersRef.current.get(orderId);
    if (timer) {
      clearInterval(timer);
      pollTimersRef.current.delete(orderId);
      lastStatusRef.current.delete(orderId);
    }
  }, []);

  return { trackOrder, untrackOrder, socket: socketRef };
}
