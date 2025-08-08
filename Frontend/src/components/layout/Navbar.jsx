import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { logout as logoutService } from '../../services/auth';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    logoutService();
    logout();
    navigate('/');
  }, [navigate, logout]);

  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-white">EventCart</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10">
            <Link to="/" className={`text-white hover:text-opacity-80 ${location.pathname === '/' ? 'font-medium' : ''}`}>
              Home
            </Link>
            <Link to="/events" className={`text-white hover:text-opacity-80 ${location.pathname === '/events' ? 'font-medium' : ''}`}>
              Events
            </Link>
            <Link to="/about" className={`text-white hover:text-opacity-80 ${location.pathname === '/about' ? 'font-medium' : ''}`}>
              About
            </Link>
            <Link to="/contact" className={`text-white hover:text-opacity-80 ${location.pathname === '/contact' ? 'font-medium' : ''}`}>
              Contact
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link to="/cart" className="p-2 rounded-full hover:bg-primary-dark transition-colors relative">
              <ShoppingCartIcon className="w-6 h-6 text-white" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-primary text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/profile" 
                  className="p-2 rounded-full hover:bg-primary-dark transition-colors"
                  title="Profile"
                >
                  <UserIcon className="w-6 h-6 text-white" />
                </Link>
                <Link 
                  to="/dashboard" 
                  className={`text-white hover:text-opacity-80 ${location.pathname === '/dashboard' ? 'font-medium' : ''}`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white text-primary rounded-md hover:bg-gray-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-white hover:text-opacity-80"
                  state={{ from: location.pathname }}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-white text-primary rounded-md hover:bg-gray-100 transition-colors"
                  state={{ from: location.pathname }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-white hover:text-opacity-80 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/events"
                className="text-white hover:text-opacity-80 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Events
              </Link>
              <Link
                to="/about"
                className="text-white hover:text-opacity-80 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-white hover:text-opacity-80 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <hr className="my-2 border-primary-dark" />

              <div className="flex flex-col space-y-4 w-full">
                <Link
                  to="/cart"
                  className="flex items-center text-white hover:text-opacity-80 transition-colors py-2 px-4 hover:bg-primary-dark rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCartIcon className="w-5 h-5 mr-2" />
                  Cart {itemCount > 0 && `(${itemCount})`}
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center text-white hover:text-opacity-80 transition-colors py-2 px-4 hover:bg-primary-dark rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserIcon className="w-5 h-5 mr-2" />
                      Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex items-center text-white hover:text-opacity-80 transition-colors py-2 px-4 hover:bg-primary-dark rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center text-left w-full text-white hover:text-red-200 transition-colors py-2 px-4 hover:bg-primary-dark rounded-md"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      state={{ from: location.pathname }}
                      className="flex items-center text-white hover:text-opacity-80 transition-colors py-2 px-4 hover:bg-primary-dark rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Login
                    </Link>
                    <Link
                      to="/register"
                      state={{ from: location.pathname }}
                      className="w-full px-4 py-2 bg-white text-primary rounded-md hover:bg-gray-100 text-center mt-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 