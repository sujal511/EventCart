import api, { initializeAuth } from './api';

// Initialize axios auth header
export const initializeAxiosAuth = (token) => {
  initializeAuth(token);
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    
    if (response.data && response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      initializeAuth(response.data.access_token);
      return response.data;
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    console.log('Auth Service: Sending login request with credentials:', {
      email: credentials.email,
      passwordLength: credentials.password ? credentials.password.length : 0
    });
    
    // Attempt direct fetch for debugging
    try {
      const fetchResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      console.log('Auth Service: Direct fetch response status:', fetchResponse.status);
      
      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        console.log('Auth Service: Direct fetch successful:', data);
        
        // Store auth data
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        initializeAuth(data.access_token);
        
        return data;
      } else {
        console.error('Auth Service: Direct fetch failed with status:', fetchResponse.status);
        // Continue with axios as fallback
      }
    } catch (fetchError) {
      console.error('Auth Service: Direct fetch error:', fetchError);
      // Continue with axios as fallback
    }
    
    // Original axios implementation as fallback
    const response = await api.post('/auth/login', credentials);
    
    console.log('Auth Service: Axios login response:', response.data);
    
    if (!response.data) {
      throw new Error('No response data from server');
    }
    
    if (!response.data.access_token) {
      throw new Error('No access token in server response');
    }
    
    if (!response.data.user) {
      throw new Error('No user data in server response');
    }
    
    // Store the token and user data in localStorage
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // Initialize auth headers
    initializeAuth(response.data.access_token);
    
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    // Create a more descriptive error message
    if (error.response) {
      console.log('Auth Service: Error response status:', error.response.status);
      console.log('Auth Service: Error response data:', error.response.data);
      
      if (error.response.status === 0 || error.response.status === 404) {
        throw new Error('Cannot connect to the server. Please check if the backend is running.');
      } else if (error.response.status === 401) {
        throw new Error('Invalid email or password. Please try again.');
      } else if (error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
    }
    // If it's a network error (like CORS)
    if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your connection and ensure the server is running.');
    }
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    initializeAuth(null);
  }
};

export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    if (error.response?.status === 401) {
      // Token refresh is handled by the API interceptor
      return null;
    }
    return null;
  }
};

export const isAuthenticated = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found in localStorage');
      return false;
    }

    // Initialize auth headers
    initializeAuth(token);

    // Make sure we're sending JSON with the right content type
    const response = await api.post('/auth/verify-token', 
      { token }, 
      { 
        headers: { 
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Log response for debugging
    console.log('Token verification response:', response.data);
    
    return response.data && response.data.valid;
  } catch (error) {
    console.error('Error verifying token:', error);
    console.error('Response status:', error.response?.status);
    console.error('Response data:', error.response?.data);
    
    // Check if we need to refresh the token
    if (error.response?.status === 401) {
      try {
        console.log('Attempting to refresh token after 401');
        const refreshed = await refreshToken();
        if (refreshed) {
          console.log('Token refreshed successfully after 401');
          return true;
        }
      } catch (refreshError) {
        console.error('Token refresh failed during verification:', refreshError);
      }
    }
    return false;
  }
};

export const refreshToken = async () => {
  try {
    const oldToken = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!oldToken || !userData) {
      return false;
    }
    
    const user = JSON.parse(userData);
    
    const response = await api.post('/auth/refresh-token', {
      email: user.email,
      oldToken
    });
    
    if (response.data && response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      initializeAuth(response.data.access_token);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

export const updateProfile = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Profile update failed' };
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Password change failed' };
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/auth/request-password-reset', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Password reset request failed' };
  }
};

export const checkEmailAvailability = async (email) => {
  try {
    const response = await api.post('/auth/check-email', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Email check failed' };
  }
};

export const deleteAccount = async () => {
  try {
    await api.delete('/auth/delete-account');
    logout();
  } catch (error) {
    throw error.response?.data || { error: 'Account deletion failed' };
  }
}; 