import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ErrorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, clearAuth } = useAuth();
  
  // Get error details from location state or use defaults
  const error = location.state?.error || {
    status: 500,
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again later.'
  };

  // Handle authentication errors
  useEffect(() => {
    if (error.status === 401 || error.status === 403) {
      // Clear auth state and redirect to login if not already on login page
      if (location.pathname !== '/login') {
        clearAuth();
        navigate('/login', { 
          state: { 
            from: location.pathname,
            error: 'Your session has expired. Please log in again.'
          } 
        });
      }
    }
  }, [error.status, location.pathname, navigate, clearAuth]);

  // Don't render anything if we're redirecting
  if (error.status === 401 || error.status === 403) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-md p-8 text-center">
        {/* Error Status */}
        <div className="text-8xl font-bold text-primary mb-4">
          {error.status || 'Oops!'}
        </div>
        
        {/* Error Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {error.title}
        </h1>
        
        {/* Error Message */}
        <p className="text-lg text-gray-600 mb-8">
          {error.message}
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/" 
            className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
          >
            Back to Home
          </Link>
          
          {isAuthenticated ? (
            <Link 
              to="/dashboard" 
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link 
              to="/login" 
              state={{ from: location.pathname }}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Log In
            </Link>
          )}
        </div>
        
        {/* Technical Details (only in development) */}
        {process.env.NODE_ENV === 'development' && error.stack && (
          <div className="mt-8 p-4 bg-gray-50 rounded-md text-left overflow-auto max-h-60">
            <pre className="text-sm text-gray-600">
              {error.stack}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorPage;
