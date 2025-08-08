// Centralized API configuration for EventCart
import axios from 'axios';

// Use 127.0.0.1 instead of localhost to avoid potential CORS issues
const API_URL = 'http://127.0.0.1:5000/api';

// Create a single axios instance for all API calls
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false  // Set to false to avoid CORS preflight issues
});

// Flag to track if a token refresh is in progress
let isRefreshing = false;
let refreshSubscribers = [];

// Function to add callbacks to be executed after token refresh
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Function to execute all subscribers when token is refreshed
const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Initialize axios auth header
export const initializeAuth = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('API: Authorization header set with token');
  } else {
    delete api.defaults.headers.common['Authorization'];
    console.log('API: Authorization header removed');
  }
};

// Add request interceptor
api.interceptors.request.use(
  config => {
    // Make sure Content-Type is set correctly for all requests with data
    if (config.data) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, {
      headers: {
        'Content-Type': config.headers['Content-Type'],
        'Authorization': config.headers['Authorization'] ? 'Bearer [REDACTED]' : 'None'
      }
    });
    
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    console.log('API Error:', error.response?.status, error.config?.url);
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Unauthorized request detected, attempting to refresh token');
      
      if (isRefreshing) {
        console.log('Token refresh already in progress, queueing request');
        // If refresh already in progress, wait for the new token
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            console.log('Using refreshed token for queued request');
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Get user data from localStorage
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userStr || !token) {
          throw new Error('No user data or token found');
        }
        
        const user = JSON.parse(userStr);
        
        console.log('Attempting to refresh token for user:', user.email);
        
        // Try to refresh the token
        const response = await api.post('/auth/refresh-token', {
          email: user.email,
          oldToken: token
        });
        
        if (response.data?.access_token) {
          const newToken = response.data.access_token;
          console.log('Token refreshed successfully');
          
          // Update token in localStorage
          localStorage.setItem('token', newToken);
          
          // Update Authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          
          // Notify all subscribers about the new token
          onTokenRefreshed(newToken);
          isRefreshing = false;
          
          // Retry the original request
          return api(originalRequest);
        } else {
          console.error('No token in refresh response');
          throw new Error('No token in refresh response');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear auth state and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        isRefreshing = false;
        window.location.href = '/login?expired=true';
        return Promise.reject(error);
      }
    }
    
    // Handle 415 Unsupported Media Type errors
    if (error.response?.status === 415) {
      console.error('Content type error detected. This could be due to missing or incorrect Content-Type header');
      console.log('Request headers:', originalRequest?.headers);
      console.log('Request data:', originalRequest?.data);
    }
    
    return Promise.reject(error);
  }
);

// Event API functions
export const eventAPI = {
  getEvents: async (category = null) => {
    try {
      const queryString = category && category !== 'all' ? `?category=${category}` : '';
      console.log(`Getting events${category ? ` with category filter: ${category}` : ''}`);
      const response = await api.get(`/events${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error getting events:', error);
      throw error;
    }
  },
  
  getEventById: async (eventId) => {
    try {
      if (!eventId || isNaN(parseInt(eventId))) {
        throw new Error('Invalid event ID');
      }
      
      const response = await api.get(`/events/${eventId}`);
      
      if (response.data) {
        const eventData = response.data;
        
        // Ensure categories exist
        if (!eventData.categories || !Array.isArray(eventData.categories)) {
          eventData.categories = [{
            id: 'default',
            name: 'All Items',
            items: eventData.items || []
          }];
        }
        
        // Ensure delivery options exist
        if (!eventData.delivery_options || !Array.isArray(eventData.delivery_options)) {
          eventData.delivery_options = [
            { id: 'delivery', name: 'Local Delivery', price: 19.99, time: '2-3 days' },
            { id: 'express', name: 'Express Delivery', price: 34.99, time: '24 hours' },
            { id: 'pickup', name: 'Self Pickup', price: 0, time: 'Same day' }
          ];
        }
        
        return eventData;
      }
      
      throw new Error('Failed to fetch event details');
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },
  
  getEventsByCategory: async (category) => {
    if (!category) {
      throw new Error('Category is required');
    }
    const response = await api.get(`/events?category=${category}`);
    return response.data;
  }
};

// Cart API functions
export const cartAPI = {
  getCart: async () => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      console.error('Error getting cart:', error);
      throw error;
    }
  },
  
  addToCart: async (eventId, quantity = 1, customPrice = null, customizedItems = null) => {
    try {
      const payload = {
        event_id: eventId,
        quantity: quantity
      };
      
      // Add custom price if provided
      if (customPrice !== null) {
        payload.custom_price = customPrice;
      }
      
      // Add customized items if provided
      if (customizedItems !== null) {
        payload.customized_items = customizedItems;
      }
      
      const response = await api.post('/cart/add', payload);
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },
  
  removeFromCart: async (itemId) => {
    try {
      const response = await api.delete(`/cart/remove/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },
  
  clearCart: async () => {
    try {
      const response = await api.delete('/cart/clear');
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
};

// Order API functions
export const orderAPI = {
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
  
  getOrders: async () => {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  },
  
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  },
  
  cancelOrder: async (orderId) => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }
};

// Wishlist API functions
export const wishlistAPI = {
  getWishlist: async () => {
    try {
      const response = await api.get('/users/me/wishlist');
      return response.data;
    } catch (error) {
      console.error('Error getting wishlist:', error);
      throw error;
    }
  },
  
  addToWishlist: async (eventId) => {
    try {
      const response = await api.post('/users/me/wishlist', {
        event_id: eventId
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },
  
  removeFromWishlist: async (eventId) => {
    try {
      const response = await api.delete(`/users/me/wishlist/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }
};

export default api;
