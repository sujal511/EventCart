import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  ShoppingCartIcon, 
  CalendarIcon, 
  CreditCardIcon, 
  ClockIcon,
  ChevronRightIcon,
  BellIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { orderAPI, wishlistAPI } from '../services/api';
import axios from 'axios';

// Create axios instance for dashboard API
const dashboardAPI = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add token
dashboardAPI.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor to handle 401 errors
dashboardAPI.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

// Dashboard API functions
const getDashboardStats = async () => {
  try {
    const response = await dashboardAPI.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Dashboard API Error:', error);
    throw error;
  }
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      console.log('Dashboard: Starting fetchDashboardData');
      console.log('Dashboard: Auth state:', { isAuthenticated, user: user?.email });
      console.log('Dashboard: Token in localStorage:', localStorage.getItem('token') ? 'present' : 'missing');
      
      setIsLoading(true);
      setError(null);
      
      try {
        // No need to verify auth here - ProtectedRoute already handles it
        // Just check if we're authenticated at this point
        if (!isAuthenticated) {
          console.log('Dashboard: User not authenticated, redirecting to login');
          navigate('/login', { 
            state: { 
              from: '/dashboard',
              message: 'Please log in to access your dashboard.'
            }
          });
          return;
        }

        // Fetch dashboard data
        console.log('Fetching dashboard data...');
        const response = await getDashboardStats();
        console.log('Dashboard response:', response);
        
        if (response.success && response.data) {
          setUserStats(response.data);
        } else {
          // Handle case where response structure is different
          setUserStats(response.data || response);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        
        if (err.response?.status === 401) {
          navigate('/login', { 
            state: { 
              from: '/dashboard',
              message: 'Your session has expired. Please log in again.'
            }
          });
          return;
        }
        
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load dashboard data';
        setError(`Error: ${errorMessage}. Please try again later.`);
        
        // If the API is not available yet, use empty data
        setUserStats({
          name: user ? `${user.first_name} ${user.last_name}` : 'User',
          email: user ? user.email : '',
          totalOrders: 0,
          pendingOrders: 0,
          totalSpent: 0,
          upcomingEvents: 0,
          wishlist: 0,
          recentActivity: [],
          upcomingEventsList: [],
          recentOrders: []
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [navigate, user, isAuthenticated]);

  // Fetch orders function
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const orderData = await orderAPI.getOrders();
      setOrders(orderData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Function to refresh dashboard stats
  const refreshDashboardStats = async () => {
    try {
      const response = await getDashboardStats();
      if (response.success && response.data) {
        setUserStats(response.data);
      } else {
        setUserStats(response.data || response);
      }
    } catch (error) {
      console.error('Error refreshing dashboard stats:', error);
    }
  };

  // Navigation items for dashboard
  const dashboardNavigation = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'orders', name: 'My Orders', icon: ShoppingCartIcon },
    { id: 'events', name: 'My Events', icon: CalendarIcon },
    { id: 'wishlist', name: 'Wishlist', icon: BellIcon },
    { id: 'profile', name: 'Profile Settings', icon: UserIcon }
  ];

  // Render loading state
    if (isLoading) {
      return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-2">Loading dashboard...</p>
        </div>
      );
    }

  // Render error state
  if (error) {
    return (
      <div className="py-10">
        <div className="container">
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-sm text-red-600 hover:text-red-500"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-500 text-sm">Total Orders</h3>
                  <ShoppingCartIcon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-semibold mt-2">{userStats?.totalOrders || 0}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-500 text-sm">Pending Orders</h3>
                  <ClockIcon className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-2xl font-semibold mt-2">{userStats?.pendingOrders || 0}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-500 text-sm">Total Spent</h3>
                  <CreditCardIcon className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-semibold mt-2">₹{userStats?.totalSpent || 0}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-500 text-sm">Upcoming Events</h3>
                  <CalendarIcon className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-semibold mt-2">{userStats?.upcomingEvents || 0}</p>
              </div>
            </div>
            
            {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {(userStats?.recentActivity || []).map((activity, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <ShoppingCartIcon className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{activity.action || activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.date || activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              </div>
              
            {/* Upcoming Events */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
                <div className="space-y-4">
                  {(userStats?.upcomingEventsList || []).map((event, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <CalendarIcon className="w-6 h-6 text-gray-600" />
                </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{event.name}</p>
                          <p className="text-sm text-gray-500">{event.date}</p>
                      </div>
                      </div>
                      <Link 
                        to={`/events/${event.id}`}
                        className="text-sm text-primary hover:text-primary/80"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
                <div className="space-y-4">
                  {(userStats?.recentOrders || []).map((order, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <ShoppingCartIcon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">Order #{order.id}</p>
                          <p className="text-sm text-gray-500">{order.date} • ₹{order.amount}</p>
                        </div>
              </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                    </div>
                    ))}
                </div>
              </div>
              <div className="p-4 border-t border-gray-100">
                <Link to="/orders" className="text-sm text-primary hover:text-primary/80 flex items-center">
                  View all orders
                  <ChevronRightIcon className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        );
        
      case 'orders':
        return <OrdersTab orders={orders} ordersLoading={ordersLoading} fetchOrders={fetchOrders} onOrderUpdate={refreshDashboardStats} />;
        
      case 'events':
        return <EventsTab />;
        
      case 'wishlist':
        return <WishlistTab />;
        
      case 'profile':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
            <div className="text-center py-8">
              <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Your Profile</h3>
              <p className="text-gray-600 mb-4">Update your personal information, password, and account settings</p>
              <Link 
                to="/profile" 
                className="btn btn-primary"
              >
                Go to Profile Settings
              </Link>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="py-10">
      <div className="container">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userStats?.name || user?.first_name || 'User'}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Dashboard Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <nav className="flex flex-col">
                {dashboardNavigation.map(item => (
                  <button
                    key={item.id}
                    className={`flex items-center px-4 py-3 text-left ${
                      activeTab === item.id
                        ? 'bg-primary/10 text-primary border-r-4 border-primary'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
          
          {/* Dashboard Content */}
          <div className="lg:col-span-4">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Orders Tab Component
const OrdersTab = ({ orders, ordersLoading, fetchOrders, onOrderUpdate }) => {
  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await orderAPI.cancelOrder(orderId);
        fetchOrders(); // Refresh orders list
        // Notify parent to refresh dashboard stats
        if (onOrderUpdate) {
          onOrderUpdate();
        }
        alert('Order cancelled successfully');
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order. Please try again.');
      }
    }
  };

  if (ordersLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-6">My Orders</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-6">My Orders</h2>
        <div className="text-center py-8">
          <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600 mb-4">You haven't placed any orders yet. Start shopping!</p>
          <Link 
            to="/events" 
            className="btn btn-primary"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold mb-6">My Orders</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">₹{order.total_amount?.toFixed(2)}</p>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="border-t pt-3">
              <h4 className="font-medium mb-2">Items:</h4>
              <div className="space-y-2">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.event_title} x{item.quantity}</span>
                    <span>₹{item.price?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p><strong>Payment:</strong> {order.payment_method?.toUpperCase()}</p>
                    <p><strong>Address:</strong> {order.shipping_address}, {order.shipping_city}</p>
                  {/* Status explanation */}
                  {order.status === 'pending' && (
                    <p className="text-yellow-600 mt-1">⏳ Order is being reviewed by our team</p>
                  )}
                  {order.status === 'confirmed' && (
                    <p className="text-blue-600 mt-1">✅ Order confirmed! We'll contact you soon</p>
                  )}
                  {order.status === 'delivered' && (
                    <p className="text-green-600 mt-1">🎉 Order completed successfully</p>
                  )}
                  {order.status === 'cancelled' && (
                    <p className="text-red-600 mt-1">❌ Order was cancelled</p>
                  )}
                  </div>
                <div className="flex space-x-2">
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => handleCancelOrder(order.id)}
                      className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Cancel Order
                    </button>
                  )}
                  <Link 
                    to={`/orders/${order.id}`} 
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Status Guide */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">📋 Order Status Guide:</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Pending:</strong> Your order is being reviewed by our admin team</p>
          <p><strong>Confirmed:</strong> Admin has confirmed your order - you'll be contacted soon with event details</p>
          <p><strong>Delivered:</strong> Event service has been completed successfully</p>
          <p><strong>Cancelled:</strong> Order was cancelled (either by you or admin)</p>
        </div>
        <div className="mt-3 p-3 bg-white rounded border-l-4 border-blue-400">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Our admin team reviews each order manually to ensure quality service. 
            You'll receive updates via email/phone when your order status changes.
          </p>
        </div>
      </div>
    </div>
  );
};

// Events Tab Component
const EventsTab = () => {
  const [userEvents, setUserEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    fetchUserEvents();
  }, []);

  const fetchUserEvents = async () => {
    try {
      // Get user's orders to find purchased events
      const orderData = await orderAPI.getOrders();
      
      // Extract events from orders that are not cancelled
      const eventsFromOrders = [];
      orderData.forEach(order => {
        if (order.status !== 'cancelled' && order.items) {
          order.items.forEach(item => {
            eventsFromOrders.push({
              id: item.event_id || Math.random(), // fallback for id
              event_title: item.event_title,
              event_id: item.event_id,
              quantity: item.quantity,
              price: item.price,
              order_id: order.id,
              order_number: order.order_number,
              order_status: order.status,
              order_date: order.created_at,
              event_date: item.event_date || 'TBA'
            });
          });
        }
      });
      
      setUserEvents(eventsFromOrders);
    } catch (error) {
      console.error('Error fetching user events:', error);
      setUserEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  if (eventsLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-6">My Events</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!userEvents || userEvents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-6">My Events</h2>
        <div className="text-center py-8">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events purchased</h3>
          <p className="text-gray-600 mb-4">You haven't purchased any event tickets yet. Explore our events!</p>
          <Link 
            to="/events" 
            className="btn btn-primary"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold mb-6">My Events ({userEvents.length} tickets)</h2>
      <div className="space-y-4">
        {userEvents.map((eventItem, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{eventItem.event_title}</h3>
                <p className="text-sm text-gray-600">
                  Quantity: {eventItem.quantity} tickets • Event Date: {eventItem.event_date}
                </p>
                <p className="text-sm text-gray-500">
                  From Order #{eventItem.order_number} • Ordered on {new Date(eventItem.order_date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">₹{eventItem.price?.toFixed(2)}</p>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  eventItem.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                  eventItem.order_status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                  eventItem.order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {eventItem.order_status?.charAt(0).toUpperCase() + eventItem.order_status?.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                {eventItem.order_status === 'pending' && (
                  <p className="text-yellow-600">⏳ Waiting for confirmation</p>
                )}
                {eventItem.order_status === 'confirmed' && (
                  <p className="text-blue-600">✅ Event confirmed - Check your email for details</p>
                )}
                {eventItem.order_status === 'delivered' && (
                  <p className="text-green-600">🎉 Event completed</p>
                )}
              </div>
              <div className="flex space-x-2">
                {eventItem.event_id && (
                  <Link 
                    to={`/events/${eventItem.event_id}`}
                    className="text-sm bg-primary text-white px-3 py-1 rounded hover:bg-primary/90"
                  >
                    View Event
                  </Link>
                )}
                <Link 
                  to={`/orders/${eventItem.order_id}`} 
                  className="text-sm text-primary hover:text-primary/80 px-3 py-1 border border-primary rounded"
                >
                  Order Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">📋 Order Status Guide:</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Pending:</strong> Your order is being reviewed by our team</p>
          <p><strong>Confirmed:</strong> Your event booking is confirmed! Check your email for event details</p>
          <p><strong>Delivered:</strong> Event has been completed successfully</p>
        </div>
      </div>
    </div>
  );
};

// Wishlist Tab Component
const WishlistTab = () => {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await wishlistAPI.getWishlist();
      // Backend returns {success: true, data: [...], message: "..."}
      setWishlist(response.data || response || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlist([]);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (eventId) => {
    try {
      await wishlistAPI.removeFromWishlist(eventId);
      // Remove the item from the current wishlist
      setWishlist(prev => (prev || []).filter(item => item.event_id !== eventId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  if (wishlistLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-6">My Wishlist</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!Array.isArray(wishlist) || wishlist.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-6">My Wishlist</h2>
        <div className="text-center py-8">
          <BellIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-4">Add events to your wishlist to save them for later!</p>
          <Link 
            to="/events" 
            className="btn btn-primary"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold mb-6">My Wishlist ({wishlist.length} items)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlist.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4">
            <img 
              src={item.event?.image_url || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622"} 
              alt={item.event?.title}
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
            <h3 className="font-semibold text-lg mb-2">{item.event?.title}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.event?.description}</p>
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-primary">₹{item.event?.price}</span>
              <div className="flex space-x-2">
                <Link 
                  to={`/events/${item.event_id}`}
                  className="text-sm bg-primary text-white px-3 py-1 rounded hover:bg-primary/90"
                >
                  View
                </Link>
                <button 
                  onClick={() => handleRemoveFromWishlist(item.event_id)}
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Added on {new Date(item.added_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage; 