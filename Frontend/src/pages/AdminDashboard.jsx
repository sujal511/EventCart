import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  UserGroupIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  TicketIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Create axios instance with default config
const adminApi = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add token
adminApi.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalEvents: 0,
    totalRevenue: 0,
    recentOrders: [],
    recentUsers: [],
    monthlyStats: {},
    ordersByStatus: {},
    topEvents: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    // If authentication check is complete and user is not authenticated, redirect to login
    if (!authLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    // If user is authenticated but not an admin, redirect to home
    if (!authLoading && isAuthenticated && user && !user.is_admin) {
      console.log('User is not an admin, redirecting to home');
      navigate('/');
      return;
    }

    // Only fetch stats if user is authenticated and is an admin
    if (isAuthenticated && user?.is_admin) {
      fetchDashboardData();
    }
  }, [navigate, isAuthenticated, authLoading, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/admin/dashboard');
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const { logout } = useAuth();

  const handleLogout = () => {
    logout(); // This clears user state and localStorage
    navigate('/'); // Redirect to landing page after logout
  };

  // Show loading state while checking authentication
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated or not admin, the useEffect will handle redirect
  if (!isAuthenticated || !user?.is_admin) {
    return null;
  }

  const sidebarItems = [
    { path: '/admin/dashboard', icon: ChartBarIcon, label: 'Dashboard' },
    { path: '/admin/users', icon: UserGroupIcon, label: 'Users' },
    { path: '/admin/orders', icon: ShoppingBagIcon, label: 'Orders' },
    { path: '/admin/events', icon: TicketIcon, label: 'Events' },
    { path: '/admin/analytics', icon: ChartBarIcon, label: 'Analytics' },
    { path: '/admin/settings', icon: CogIcon, label: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-30">
        <div className="flex items-center justify-center h-16 border-b bg-blue-600">
          <h1 className="text-xl font-bold text-white">EventCart Admin</h1>
        </div>
        <nav className="mt-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back, {user?.first_name}! Here's what's happening with EventCart.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpIcon className="w-3 h-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <UserGroupIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpIcon className="w-3 h-3 mr-1" />
                  +8% from last month
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ShoppingBagIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvents || 0}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <CalendarDaysIcon className="w-3 h-3 mr-1" />
                  Active events
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TicketIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpIcon className="w-3 h-3 mr-1" />
                  +15% from last month
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <CurrencyDollarIcon className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {stats.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">#{order.order_number}</p>
                      <p className="text-sm text-gray-600">{order.user?.first_name} {order.user?.last_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{order.total_amount}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent orders</p>
              )}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h2>
            <div className="space-y-3">
              {stats.ordersByStatus && Object.entries(stats.ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      status === 'delivered' ? 'bg-green-500' :
                      status === 'confirmed' ? 'bg-blue-500' :
                      status === 'pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="text-gray-700 capitalize">{status}</span>
                  </div>
                  <span className="font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Events */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Popular Events</h2>
            <Link to="/admin/events" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Manage Events
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.topEvents && stats.topEvents.length > 0 ? (
              stats.topEvents.slice(0, 6).map((event) => (
                <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
                    <span className="text-sm text-gray-500">₹{event.price}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{event.location}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{event.category}</span>
                    <span>{event.order_count || 0} orders</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4 col-span-full">No events data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
