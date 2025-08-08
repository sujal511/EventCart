import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  UserGroupIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  TicketIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ArrowUpIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  EyeIcon

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

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    monthlyRevenue: [],
    topEvents: [],
    userGrowth: [],
    orderStats: {},
    categoryStats: {},
    revenueGrowth: 0,
    userGrowthRate: 0,
    orderGrowthRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.is_admin)) {
      navigate('/admin');
      return;
    }

    if (isAuthenticated && user?.is_admin) {
      fetchAnalytics();
    }
  }, [navigate, isAuthenticated, authLoading, user, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Get real analytics data from the backend
      const daysParam = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const response = await adminApi.get(`/admin/analytics?days=${daysParam}`);
      if (response.data) {
        const analyticsData = response.data;
        
        setAnalytics({
          totalRevenue: analyticsData.totalRevenue || 0,
          monthlyRevenue: analyticsData.monthlyRevenue || [],
          topEvents: analyticsData.topEvents || [],
          userGrowth: analyticsData.userGrowth || [],
          orderStats: analyticsData.orderStats || {},
          categoryStats: analyticsData.categoryStats || {},
          revenueGrowth: analyticsData.revenueGrowth || 0,
          userGrowthRate: analyticsData.userGrowthRate || 0,
          orderGrowthRate: analyticsData.orderGrowthRate || 0
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      if (error.response?.status === 401) {
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  };



  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin');
  };

  const sidebarItems = [
    { path: '/admin/dashboard', icon: ChartBarIcon, label: 'Dashboard' },
    { path: '/admin/users', icon: UserGroupIcon, label: 'Users' },
    { path: '/admin/orders', icon: ShoppingBagIcon, label: 'Orders' },
    { path: '/admin/events', icon: TicketIcon, label: 'Events' },
    { path: '/admin/analytics', icon: ChartBarIcon, label: 'Analytics' },
    { path: '/admin/settings', icon: CogIcon, label: 'Settings' }
  ];

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.is_admin) {
    return null;
  }

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
      <div className="ml-64 p-6 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
              <p className="text-gray-600">Detailed insights into your business performance</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Revenue Growth</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.revenueGrowth}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpIcon className="w-3 h-3 mr-1" />
                  vs last month
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">User Growth</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.userGrowthRate}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpIcon className="w-3 h-3 mr-1" />
                  vs last month
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
                <p className="text-sm text-gray-600 mb-1">Order Growth</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.orderGrowthRate}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpIcon className="w-3 h-3 mr-1" />
                  vs last month
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <ShoppingBagIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analytics.monthlyRevenue.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-blue-500 rounded-t w-full min-h-[20px] transition-all hover:bg-blue-600"
                    style={{
                      height: `${Math.max(20, (data.revenue / Math.max(...analytics.monthlyRevenue.map(d => d.revenue))) * 200)}px`
                    }}
                    title={`₹${data.revenue.toLocaleString()}`}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analytics.userGrowth.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-green-500 rounded-t w-full min-h-[20px] transition-all hover:bg-green-600"
                    style={{
                      height: `${Math.max(20, (data.users / Math.max(...analytics.userGrowth.map(d => d.users))) * 200)}px`
                    }}
                    title={`${data.users} users`}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Order Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
            <div className="space-y-3">
              {Object.entries(analytics.orderStats).map(([status, count]) => {
                const total = Object.values(analytics.orderStats).reduce((sum, val) => sum + val, 0);
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        status === 'delivered' ? 'bg-green-500' :
                        status === 'confirmed' ? 'bg-blue-500' :
                        status === 'pending' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <span className="text-gray-700 capitalize">{status}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            status === 'delivered' ? 'bg-green-500' :
                            status === 'confirmed' ? 'bg-blue-500' :
                            status === 'pending' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-gray-900 w-8 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
            <div className="space-y-3">
              {Object.entries(analytics.categoryStats).slice(0, 6).map(([category, data]) => {
                const orders = typeof data === 'object' ? data.orders : data;
                const revenue = typeof data === 'object' ? data.revenue : 0;
                const maxOrders = Math.max(...Object.values(analytics.categoryStats).map(d => typeof d === 'object' ? d.orders : d));
                const percentage = maxOrders > 0 ? Math.round((orders / maxOrders) * 100) : 0;
                
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-gray-700">{category}</span>
                      {typeof data === 'object' && (
                        <div className="text-xs text-gray-500">₹{revenue.toLocaleString()} revenue</div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-purple-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-gray-900 w-8 text-right">{orders}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Performing Events */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Events</h3>
            <Link to="/admin/events" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All Events
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Event</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Orders</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.topEvents.slice(0, 8).map((event, index) => {
                  const revenue = event.revenue || (event.price * (event.order_count || 0));
                  const maxRevenue = Math.max(...analytics.topEvents.slice(0, 8).map(e => e.revenue || (e.price * (e.order_count || 0))));
                  const performance = maxRevenue > 0 ? Math.round((revenue / maxRevenue) * 100) : 0;
                  
                  return (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{event.title}</p>
                          <p className="text-sm text-gray-500">{event.location}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {event.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{event.order_count || 0}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">₹{revenue.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: `${performance}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{performance}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics; 