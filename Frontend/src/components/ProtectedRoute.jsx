import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, loading, authChecked } = useAuth();
  const location = useLocation();
  const [checkComplete, setCheckComplete] = useState(false);

  useEffect(() => {
    // Simple delay to ensure auth state is stable
    const timer = setTimeout(() => {
      setCheckComplete(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  console.log("ProtectedRoute: ", {
    isAuthenticated,
    user: user ? user.email : 'null',
    loading,
    authChecked,
    checkComplete,
    adminOnly,
    userIsAdmin: user?.is_admin
  });

  // Show loading while authentication is being checked
  if (loading || !authChecked || !checkComplete) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    console.log("ProtectedRoute: Not authenticated, redirecting to /login");
    return <Navigate 
      to="/login"
      state={{ 
        from: location.pathname, 
        message: 'Please log in to access this page.' 
      }} 
      replace 
    />;
  }

  // Check admin access if required
  if (adminOnly && !user.is_admin) {
    console.log("ProtectedRoute: Admin access required but user is not admin");
    return <Navigate 
      to="/login" 
      state={{ 
        from: location.pathname, 
        message: 'Admin access required.' 
      }} 
      replace 
    />;
  }

  console.log("ProtectedRoute: Access granted");
  return children;
};

export default ProtectedRoute; 