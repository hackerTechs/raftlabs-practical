const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const STORAGE_KEY = 'RaftFoodLab_email';

/**
 * Get stored email from localStorage.
 */
function getEmail() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored.trim().length > 0) return stored.trim().toLowerCase();
  } catch {
    // ignore
  }
  return null;
}

/**
 * Generic fetch wrapper. Sends X-User-Email header when requireAuth is true.
 */
async function request(endpoint, options = {}, requireAuth = true) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json' };

  if (requireAuth) {
    const email = getEmail();
    if (email) {
      headers['X-User-Email'] = email;
    }
  }

  const config = { headers, ...options };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

// ── Menu API (public, no auth required) ─────────────────────────────────────
export const menuApi = {
  getAll: (category) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return request(`/menu${query}`, {}, false);
  },
  getById: (id) => request(`/menu/${id}`, {}, false),
  getCategories: () => request('/menu/categories', {}, false),
};

// ── Order API (user, requires auth) ─────────────────────────────────────────
export const orderApi = {
  getAll: () => request('/orders'),
  getById: (id) => request(`/orders/${id}`),
  create: (orderData) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
};

// ── Admin API (admin only) ──────────────────────────────────────────────────
export const adminApi = {
  getAllOrders: () => request('/admin/orders'),
  getOrder: (id) => request(`/admin/orders/${id}`),
  updateStatus: (id, status) =>
    request(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteOrder: (id) =>
    request(`/admin/orders/${id}`, { method: 'DELETE' }),
};
