import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { cartAPI } from '../services/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const lastFetchedUserId = useRef(null);
  const fetchTimeoutRef = useRef(null);

  // Fetch cart data
  const fetchCart = async () => {
    try {
      setLoading(true);
      const cartData = await cartAPI.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (eventId, quantity = 1, customPrice = null, customizedItems = null) => {
    try {
      await cartAPI.addToCart(eventId, quantity, customPrice, customizedItems);
      await fetchCart(); // Refresh cart data
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      await cartAPI.removeFromCart(itemId);
      await fetchCart(); // Refresh cart data
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCart(null);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  // Fetch cart on mount and when user changes, but only if user ID actually changed
  useEffect(() => {
    // Clear any pending timeouts
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    const currentUserId = user?.id;
    
    if (currentUserId && currentUserId !== lastFetchedUserId.current) {
      // User logged in or changed - fetch cart after a short delay to avoid rapid calls
      fetchTimeoutRef.current = setTimeout(() => {
        lastFetchedUserId.current = currentUserId;
        fetchCart();
      }, 100);
    } else if (!currentUserId && lastFetchedUserId.current) {
      // User logged out - clear cart immediately
      lastFetchedUserId.current = null;
      setCart(null);
      setLoading(false);
    } else if (!currentUserId) {
      // No user - ensure cart is clear
      setCart(null);
      setLoading(false);
    }

    // Cleanup timeout on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [user?.id]); // Only depend on user.id, not the entire user object

  // Calculate item count
  const itemCount = cart?.items?.length || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        addToCart,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 