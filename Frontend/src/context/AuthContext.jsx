import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getCurrentUser, isAuthenticated as checkAuth, refreshToken, initializeAxiosAuth } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Clear auth state on logout
  const clearAuthState = useCallback(() => {
    console.log("AuthContext: Clearing auth state");
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    initializeAxiosAuth(null);
  }, []);

  // Update auth state
  const updateAuthState = useCallback((newUser, newToken = null) => {
    console.log("AuthContext: Updating auth state", { 
      user: newUser ? `${newUser.email} (${newUser.id})` : 'null',
      token: newToken ? `${newToken.substring(0, 15)}...` : 'unchanged'
    });

    if (!newUser) {
      clearAuthState();
      return;
    }
    
    // Update user state
    setUser(newUser);
    
    // Update localStorage and axios headers if we have a new token
    if (newToken) {
      console.log("AuthContext: Setting token in localStorage and initializing axios auth");
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      initializeAxiosAuth(newToken);
    }
  }, [clearAuthState]);

  // Function to check authentication status
  const verifyAuth = useCallback(async () => {
    console.log("Verifying authentication status...");
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        console.log("Found token and user data in localStorage");
        const parsedUser = JSON.parse(userData);
        
        // Set user immediately from localStorage (optimistic update)
        console.log("AuthContext: Setting user from localStorage:", parsedUser.email);
        setUser(parsedUser);
        
        // Initialize axios with the token
        console.log("AuthContext: Initializing axios with token");
        initializeAxiosAuth(token);
        
        // Then verify token in background
        console.log("Checking auth with backend...");
        const isValid = await checkAuth();
        console.log("Auth check result:", isValid);
        
        if (!isValid) {
          console.log("Token not valid, attempting to refresh...");
          const refreshed = await refreshToken();
          if (!refreshed) {
            console.log("Token refresh failed, clearing auth state");
            clearAuthState();
            return false;
          }
          console.log("Token refreshed successfully");
          // Update axios headers with new token after refresh
          const newToken = localStorage.getItem('token');
          console.log("AuthContext: Updating axios with new token after refresh");
          initializeAxiosAuth(newToken);
        }
        
        return true;
      } catch (error) {
        console.error('Error verifying auth:', error);
        clearAuthState();
        return false;
      }
    } else {
      console.log("No token or user data found in localStorage");
      clearAuthState();
      return false;
    }
  }, [clearAuthState]);

  // Check authentication once on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log("AuthContext: Initial auth check on mount");
      try {
        // First try to get user from localStorage
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (userData && token) {
          console.log("Found user data and token in localStorage");
          try {
            const parsedUser = JSON.parse(userData);
            console.log("AuthContext: Setting initial user from localStorage:", parsedUser.email);
            setUser(parsedUser);
            initializeAxiosAuth(token);
          } catch (parseError) {
            console.error("Error parsing user data from localStorage:", parseError);
            clearAuthState();
          }
        } else {
          console.log("No stored auth data found on mount");
        }
        
        // Then verify in background
        const authResult = await verifyAuth();
        console.log("Auth verification result:", authResult);
      } catch (error) {
        console.error('Error checking auth status:', error);
        clearAuthState();
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    checkAuthStatus();
  }, [verifyAuth, clearAuthState]);

  // Function to handle login
  const login = useCallback((userData, token) => {
    console.log("AuthContext: Login called with user:", userData.email);
    
    // Ensure we have valid data
    if (!userData || !token) {
      console.error("AuthContext: Invalid login data provided");
      return;
    }
    
    // Update localStorage directly for safety
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Initialize axios with the token
    initializeAxiosAuth(token);
    
    // Update state
    setUser(userData);
    
    console.log("AuthContext: Login complete, user state and localStorage updated");
    
    // Return success
    return true;
  }, []);

  // Computed authentication status
  const isAuthenticated = !!user && !!localStorage.getItem('token');
  
  console.log("AuthContext: Current auth state:", { 
    isAuthenticated, 
    user: user ? `${user.email} (${user.id})` : 'null',
    token: localStorage.getItem('token') ? 'present' : 'null'
  });

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated,
        loading,
        authChecked,
        login,
        logout: clearAuthState,
        refreshAuth: verifyAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 