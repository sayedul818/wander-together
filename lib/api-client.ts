/**
 * API Client Helper
 * Centralizes all API calls with error handling and type safety
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface RequestOptions extends RequestInit {
  // Custom options
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Fetch wrapper with error handling
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data?.error || 'An error occurred',
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network error');
  }
}

/**
 * Authentication API
 */
export const authApi = {
  register: (email: string, password: string, name: string) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiCall('/auth/logout', { method: 'POST' }),

  getSession: () =>
    apiCall('/auth/session', { method: 'GET' }),
};

/**
 * Travel Plans API
 */
export const travelPlansApi = {
  list: (page = 1, limit = 10) =>
    apiCall(
      `/travel-plans?page=${page}&limit=${limit}`,
      { method: 'GET' }
    ),

  create: (data: any) =>
    apiCall('/travel-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (id: string) =>
    apiCall(`/travel-plans/${id}`, { method: 'GET' }),

  update: (id: string, data: any) =>
    apiCall(`/travel-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiCall(`/travel-plans/${id}`, { method: 'DELETE' }),

  join: (id: string) =>
    apiCall(`/travel-plans/${id}/join`, { method: 'POST' }),

  search: (query: string) =>
    apiCall(`/travel-plans/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    }),
};

/**
 * Users API
 */
export const usersApi = {
  get: (id: string) =>
    apiCall(`/users/${id}`, { method: 'GET' }),

  update: (id: string, data: any) =>
    apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  rate: (id: string, rating: number, comment: string) =>
    apiCall(`/users/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    }),

  search: (query: string) =>
    apiCall(`/users/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    }),
};

/**
 * Admin API
 */
export const adminApi = {
  users: {
    list: () => apiCall('/admin/users', { method: 'GET' }),
    delete: (id: string) =>
      apiCall(`/admin/users/${id}`, { method: 'DELETE' }),
  },

  travelPlans: {
    list: () => apiCall('/admin/travel-plans', { method: 'GET' }),
    delete: (id: string) =>
      apiCall(`/admin/travel-plans/${id}`, { method: 'DELETE' }),
  },
};

/**
 * Stripe API
 */
export const stripeApi = {
  createCheckoutSession: (priceId: string) =>
    apiCall('/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId }),
    }),
};
