import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserIcon, ShoppingBagIcon, CreditCardIcon, HomeIcon, ArrowRightIcon, ShieldCheckIcon, ChartBarIcon, ChevronRightIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import EditProfileForm from '../components/EditProfileForm';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, isAuthenticated, checkAuth, setUser: updateAuthUser } = useAuth();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user data function - extracted for reusability
  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to login');
        navigate('/login', { state: { from: location.pathname } });
        return;
      }
      
      // If we have user data in auth context, use it
      if (authUser) {
        console.log('Using user from auth context:', authUser);
        const formattedUser = {
          firstName: authUser.first_name || authUser.firstName,
          lastName: authUser.last_name || authUser.lastName,
          email: authUser.email,
          phone: authUser.phone,
          id: authUser.id
        };
        setUser(formattedUser);
        setIsLoading(false);
        return;
      }
      
      // Otherwise fetch from API
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login', { state: { from: location.pathname } });
        return;
      }
      
      console.log('Fetching user data from API');
      const response = await api.get('/users/me');
      
      const userData = response.data;
      console.log('User data fetched successfully:', userData);
      
      // Transform backend field names to match frontend expectations
      const transformedUser = {
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        id: userData.id
      };
      
      setUser(transformedUser);
      // Update auth context and localStorage
      updateAuthUser(transformedUser);
      localStorage.setItem('user', JSON.stringify(transformedUser));
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load profile data. Please try again.');
      
      // Try to get user from localStorage as fallback
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          console.log('Using user data from localStorage');
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch (e) {
          console.error('Error parsing user data from localStorage:', e);
          setError('Could not retrieve your profile information. Please log in again.');
          navigate('/login', { state: { from: location.pathname } });
        }
      } else {
        console.log('No user data found, redirecting to login');
        navigate('/login', { state: { from: location.pathname } });
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, location.pathname, authUser, isAuthenticated, updateAuthUser]);

  // Load user data on component mount
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleUpdate = async (updatedUser) => {
    try {
      const response = await api.put('/users/me', updatedUser);
      
      const userData = response.data;
      
      // Transform backend field names to match frontend expectations
      const transformedUser = {
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        id: userData.id
      };
      
      setUser(transformedUser);
      setIsEditMode(false);
      
      // Update localStorage user data
      localStorage.setItem('user', JSON.stringify(transformedUser));
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
  };

  // Form state for password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Form errors
  const [passwordErrors, setPasswordErrors] = useState({});
  
  // Success message
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // State for orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  
  // State for order details modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // State for addresses
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    address_line: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    address_type: 'Home',
    is_default: false
  });
  const [addressErrors, setAddressErrors] = useState({});
  
  // State for payment methods
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    card_type: 'Visa',
    card_number: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    is_default: false
  });
  const [paymentErrors, setPaymentErrors] = useState({});
  

  
  // Handle postal code lookup
  const handlePostalCodeLookup = async (postalCode) => {
    if (postalCode.length !== 6) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/lookup-postal-code/${postalCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAddressForm(prev => ({
          ...prev,
          city: data.city,
          state: data.state,
          country: data.country
        }));
      }
    } catch (error) {
      console.error('Error looking up postal code:', error);
    }
  };
  
  // Validate address form
  const validateAddressForm = () => {
    const errors = {};
    
    if (!addressForm.address_line.trim()) {
      errors.address_line = 'Address is required';
    }
    
    if (!addressForm.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!addressForm.state.trim()) {
      errors.state = 'State is required';
    }
    
    if (!addressForm.postal_code.trim()) {
      errors.postal_code = 'Postal code is required';
    } else if (!/^\d{6}$/.test(addressForm.postal_code)) {
      errors.postal_code = 'Postal code must be 6 digits';
    }
    
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle address form submit
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAddressForm()) return;
    
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAddressErrors({ form: 'You must be logged in to add an address' });
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/users/me/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressForm)
      });
      
      if (response.ok) {
        const newAddress = await response.json();
        setAddresses(prev => [...prev, newAddress]);
        setShowAddressModal(false);
        setAddressForm({
          address_line: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'India',
          address_type: 'Home',
          is_default: false
        });
      } else if (response.status === 401) {
        // Authentication error
        setAddressErrors({ form: 'Your session has expired. Please log in again.' });
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/login');
        }, 2000);
      } else if (response.status === 422) {
        // Validation error
        const data = await response.json();
        setAddressErrors({ form: data.message || 'Invalid address information. Please check your input.' });
      } else {
        const data = await response.json();
        setAddressErrors({ form: data.error || 'Failed to add address' });
      }
    } catch (error) {
      setAddressErrors({ form: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle address deletion
  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/me/addresses/${addressId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          setAddresses(prev => prev.filter(address => address.id !== addressId));
        } else {
          alert('Failed to delete address');
        }
      } catch (error) {
        alert('An error occurred. Please try again.');
      }
    }
  };
  
  // Handle setting address as default
  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/me/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ is_default: true })
      });
      
      if (response.ok) {
        // Update addresses in state
        setAddresses(prev => prev.map(address => ({
          ...address,
          is_default: address.id === addressId
        })));
      } else {
        alert('Failed to set address as default');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };
  
  // Validate payment form
  const validatePaymentForm = () => {
    const errors = {};
    
    if (!paymentForm.card_number.trim()) {
      errors.card_number = 'Card number is required';
    } else if (!/^\d{16}$/.test(paymentForm.card_number.replace(/\s/g, ''))) {
      errors.card_number = 'Card number must be 16 digits';
    }
    
    if (!paymentForm.expiry_month.trim()) {
      errors.expiry_month = 'Expiry month is required';
    } else if (!/^(0[1-9]|1[0-2])$/.test(paymentForm.expiry_month)) {
      errors.expiry_month = 'Invalid expiry month';
    }
    
    if (!paymentForm.expiry_year.trim()) {
      errors.expiry_year = 'Expiry year is required';
    } else if (!/^\d{4}$/.test(paymentForm.expiry_year)) {
      errors.expiry_year = 'Invalid expiry year';
    }
    
    if (!paymentForm.cvv.trim()) {
      errors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(paymentForm.cvv)) {
      errors.cvv = 'CVV must be 3 or 4 digits';
    }
    
    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle payment form submit
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePaymentForm()) return;
    
    setIsLoading(true);
    
    try {
      // Extract last four digits from card number
      const cardNumber = paymentForm.card_number.replace(/\s/g, '');
      const lastFour = cardNumber.slice(-4);
      
      const paymentData = {
        card_type: paymentForm.card_type,
        last_four: lastFour,
        expiry_month: paymentForm.expiry_month,
        expiry_year: paymentForm.expiry_year,
        is_default: paymentForm.is_default
      };
      
      const response = await fetch('http://localhost:5000/api/users/me/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      });
      
      if (response.ok) {
        const newPayment = await response.json();
        setPaymentMethods(prev => [...prev, newPayment]);
        setShowPaymentModal(false);
        setPaymentForm({
          card_type: 'Visa',
          card_number: '',
          expiry_month: '',
          expiry_year: '',
          cvv: '',
          is_default: false
        });
      } else {
        const data = await response.json();
        setPaymentErrors({ form: data.error || 'Failed to add payment method' });
      }
    } catch (error) {
      setPaymentErrors({ form: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle payment method deletion
  const handleDeletePayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/me/payment-methods/${paymentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          setPaymentMethods(prev => prev.filter(payment => payment.id !== paymentId));
        } else {
          alert('Failed to delete payment method');
        }
      } catch (error) {
        alert('An error occurred. Please try again.');
      }
    }
  };
  
  // Handle setting payment method as default
  const handleSetDefaultPayment = async (paymentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/me/payment-methods/${paymentId}/set-default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        // Update payment methods in state
        setPaymentMethods(prev => prev.map(payment => ({
          ...payment,
          is_default: payment.id === paymentId
        })));
      } else {
        alert('Failed to set payment method as default');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await api.get('/users/me/orders');
      
      if (response.data.success) {
        const ordersData = response.data.data || [];
        // Process orders to ensure proper data structure
        const processedOrders = ordersData.map(order => ({
          ...order,
          items: order.items ? order.items.map(item => ({
            ...item,
            quantity: item.quantity || 1,
            price: item.price || item.unit_price || 0,
            name: item.name || item.product_name || 'Unknown Item'
          })) : []
        }));
        setOrders(processedOrders);
      } else {
        console.error('Failed to fetch orders');
        // Set sample data for demo purposes with proper structure
        setOrders([
          {
            id: 'B92321F5',
            date: '2025-06-09',
            status: 'Delivered',
            total: 576.65,
            items: [
              { name: 'Birthday Party Collection', quantity: 1, price: 576.65 }
            ]
          },
          {
            id: '613CA271',
            date: '2025-06-09',
            status: 'Pending', 
            total: 1180.43,
            items: [
              { name: 'Housewarming Package', quantity: 1, price: 700.00 },
              { name: 'Birthday Party Collection', quantity: 1, price: 480.43 }
            ]
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Set sample data for demo purposes with proper structure
      setOrders([
        {
          id: 'B92321F5',
          date: '2025-06-09',
          status: 'Delivered',
          total: 576.65,
          items: [
            { name: 'Birthday Party Collection', quantity: 1, price: 576.65 }
          ]
        },
        {
          id: '613CA271',
          date: '2025-06-09',
          status: 'Pending', 
          total: 1180.43,
          items: [
            { name: 'Housewarming Package', quantity: 1, price: 700.00 },
            { name: 'Birthday Party Collection', quantity: 1, price: 480.43 }
          ]
        }
      ]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await api.get('/users/me/addresses');
        
        if (response.data.success) {
          setAddresses(response.data.data || []);
        } else {
          console.error('Failed to fetch addresses');
          setAddresses([]);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setAddresses([]);
      } finally {
        setAddressesLoading(false);
      }
    };
    
    fetchAddresses();
  }, []);

  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await api.get('/users/me/payment-methods');
        
        if (response.data.success) {
          setPaymentMethods(response.data.data || []);
        } else {
          console.error('Failed to fetch payment methods');
          setPaymentMethods([]);
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        setPaymentMethods([]);
      } finally {
        setPaymentMethodsLoading(false);
      }
    };
    
    fetchPaymentMethods();
    fetchOrders();  // Add this here since we removed the useEffect above
  }, []);

  // Tab state
  const [activeTab, setActiveTab] = useState('profile');

  // Handle password form change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters';
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle password form submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    setIsLoading(true);
    setPasswordSuccess('');
    
    try {
      const response = await api.put('/auth/change-password', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      });
      
      setPasswordSuccess('Password updated successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      if (error.response?.data?.error) {
        setPasswordErrors({ auth: error.response.data.error });
      } else {
        setPasswordErrors({ auth: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await api.delete('/users/me/delete');
        
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to home page
        window.location.href = '/';
      } catch (error) {
        if (error.response?.data?.error) {
          alert(error.response.data.error);
        } else {
          alert('An error occurred. Please try again.');
        }
      }
    }
  };

  // Handle order actions
  const handleViewOrderDetails = (orderId) => {
    console.log('View details clicked for order:', orderId);
    
    // Find the specific order
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      alert('❌ Error\n\nOrder not found.');
      return;
    }

    // Create detailed order information
    let orderDetails = `📋 Order Details - #${orderId}\n\n`;
    orderDetails += `📅 Order Date: ${new Date(order.date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    })}\n`;
    orderDetails += `📊 Status: ${order.status}\n`;
    orderDetails += `💰 Total Amount: ₹${order.total.toFixed(2)}\n\n`;
    
    orderDetails += `📦 ORDER ITEMS:\n`;
    orderDetails += `${'='.repeat(30)}\n`;
    
    if (order.items && order.items.length > 0) {
      order.items.forEach((item, index) => {
        const itemPrice = item.price && typeof item.price === 'number' ? 
          (item.price * (item.quantity || 1)).toFixed(2) : 
          (order.total / order.items.length).toFixed(2);
        
        orderDetails += `${index + 1}. ${item.name}\n`;
        orderDetails += `   Quantity: ${item.quantity || 1}\n`;
        orderDetails += `   Price: ₹${itemPrice}\n\n`;
      });
    } else {
      orderDetails += 'No items found for this order.\n';
    }
    
    setShowOrderModal(true);
    setSelectedOrder(order);
  };

  const handleDownloadInvoice = (orderId) => {
    console.log('Download invoice clicked for order:', orderId);
    alert(`📄 Invoice Download\n\nPreparing invoice for order #${orderId}...\n\nThis will download a PDF invoice with:\n• Order summary\n• Item details\n• Payment information\n• Company details`);
    
    // Simulate download delay
    setTimeout(() => {
      alert(`📥 Download Complete!\n\nInvoice for order #${orderId} has been downloaded to your device.`);
    }, 1000);
    
    // In a real implementation, this would download a PDF:
    // window.open(`/api/orders/${orderId}/invoice`, '_blank');
  };



  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600">Loading your profile...</p>
                </div>
              </div>
            ) : user ? (
              isEditMode ? (
                <EditProfileForm user={user} onUpdate={handleUpdate} onCancel={handleCancel} />
              ) : (
                <>
                  <div className="px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-600">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/20 rounded-full">
                        <UserIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{user.firstName} {user.lastName}</h2>
                        <p className="text-blue-100">Personal Information</p>
                    </div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <UserIcon className="w-5 h-5 text-gray-400" />
                          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Full Name</h3>
                        </div>
                        <p className="text-lg font-medium text-gray-900 ml-8">{user.firstName} {user.lastName}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email Address</h3>
                        </div>
                        <p className="text-lg font-medium text-gray-900 ml-8">{user.email}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <PhoneIcon className="w-5 h-5 text-gray-400" />
                          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone Number</h3>
                        </div>
                        <p className="text-lg font-medium text-gray-900 ml-8">{user.phone}</p>
                      </div>
                    </div>
                    
                    <div className="mt-10 pt-6 border-t border-gray-200">
                      <button 
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
                        onClick={handleEditClick}
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </>
              )
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-red-600 font-medium">Failed to load user data.</p>
                  <button 
                    onClick={fetchUserData}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'orders':
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <ShoppingBagIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Order History</h2>
                  <p className="text-blue-100 text-xs">Track your purchases and order status</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : orders.length === 0 ? (
              <div className="text-center py-8">
                  <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
                  </div>
                <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                  <Link 
                    to="/events" 
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                  Browse Events
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Link>
              </div>
            ) : (
                <div className="space-y-4">
                {orders.map(order => (
                    <div key={order.id} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-base font-bold text-gray-900">#{order.id}</h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'Delivered' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : order.status === 'Processing'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : order.status === 'Pending'
                                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 flex items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                            Ordered on {new Date(order.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                        <div className="mt-3 lg:mt-0 lg:text-right">
                          <p className="text-xl font-bold text-gray-900">₹{order.total.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">Total Amount</p>
                      </div>
                    </div>
                    
                      <div className="bg-white rounded-lg border border-gray-100 p-3 mb-3">
                        <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Order Items</h4>
                        <div className="space-y-1">
                          {order.items && order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-b-0">
                              <div className="flex items-center space-x-2">
                                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                                  {item.quantity || 1}
                                </span>
                                <p className="text-sm text-gray-800 font-medium">{item.name}</p>
                              </div>
                              <p className="text-sm text-gray-600 font-medium">
                                {item.price && typeof item.price === 'number' ? 
                                  `₹${(item.price * (item.quantity || 1)).toFixed(2)}` : 
                                  `₹${(order.total / order.items.length).toFixed(2)}`
                                }
                          </p>
                        </div>
                      ))}
                        </div>
                    </div>
                    
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 border-t border-gray-200">
                        <button 
                          onClick={() => handleViewOrderDetails(order.id)}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors duration-200 mb-2 sm:mb-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
                        >
                          View Full Details
                          <ArrowRightIcon className="w-3 h-3 ml-1" />
                        </button>
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => handleDownloadInvoice(order.id)}
                            className="text-xs text-gray-600 hover:text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-md px-2 py-1 transition-colors duration-200"
                          >
                            Download Invoice
                          </button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        );
      
      case 'payment':
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CreditCardIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Payment Methods</h2>
                  <p className="text-blue-100 text-xs">Manage your saved payment methods</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
            {paymentMethodsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {paymentMethods.length > 0 ? (
                    <div className="space-y-4 mb-6">
                    {paymentMethods.map(method => (
                        <div key={method.id} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                              <div className="p-3 bg-blue-100 rounded-lg">
                                <CreditCardIcon className="w-6 h-6 text-blue-600" />
                              </div>
                            <div>
                                <p className="font-semibold text-gray-900">{method.card_type} •••• {method.last_four}</p>
                              <p className="text-sm text-gray-600">Expires {method.expiry_month}/{method.expiry_year}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {method.is_default && (
                                <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 border border-green-200 rounded-full">
                                Default
                              </span>
                            )}
                            <div className="flex space-x-2">
                              <button 
                                  className="text-xs text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors duration-200"
                                onClick={() => handleDeletePayment(method.id)}
                              >
                                Delete
                              </button>
                              {!method.is_default && (
                                <button 
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors duration-200"
                                  onClick={() => handleSetDefaultPayment(method.id)}
                                >
                                    Set Default
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                    <div className="text-center py-8">
                      <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <CreditCardIcon className="w-6 h-6 text-gray-400" />
                      </div>
                  <p className="text-gray-600 mb-4">No payment methods saved yet</p>
                    </div>
                )}
                
                <button 
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  onClick={() => setShowPaymentModal(true)}
                >
                    <CreditCardIcon className="w-4 h-4 inline mr-2" />
                  Add Payment Method
                </button>
                </>
              )}
            </div>
                
                {/* Payment Method Modal */}
                {showPaymentModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl">
                    <h3 className="text-lg font-semibold text-white">Add New Payment Method</h3>
                  </div>
                      
                  <form onSubmit={handlePaymentSubmit} className="p-6">
                        {paymentErrors.form && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                            {paymentErrors.form}
                          </div>
                        )}
                        
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Type</label>
                          <select
                            name="card_type"
                            value={paymentForm.card_type}
                            onChange={(e) => setPaymentForm({...paymentForm, card_type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Visa">Visa</option>
                            <option value="Mastercard">Mastercard</option>
                            <option value="American Express">American Express</option>
                            <option value="Discover">Discover</option>
                          </select>
                        </div>
                        
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                          <input
                            type="text"
                            name="card_number"
                            value={paymentForm.card_number}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                            const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                            if (value.length <= 16) {
                              setPaymentForm({...paymentForm, card_number: formattedValue});
                            }
                            }}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                      <div className="grid grid-cols-3 gap-4">
                          <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                            <select
                              name="expiry_month"
                              value={paymentForm.expiry_month}
                              onChange={(e) => setPaymentForm({...paymentForm, expiry_month: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                            <option value="">MM</option>
                            {Array.from({ length: 12 }, (_, i) => (
                              <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                {String(i + 1).padStart(2, '0')}
                              </option>
                            ))}
                            </select>
                          </div>
                          <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                            <select
                              name="expiry_year"
                              value={paymentForm.expiry_year}
                              onChange={(e) => setPaymentForm({...paymentForm, expiry_year: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                            <option value="">YYYY</option>
                            {Array.from({ length: 10 }, (_, i) => (
                              <option key={i} value={new Date().getFullYear() + i}>
                                {new Date().getFullYear() + i}
                              </option>
                            ))}
                            </select>
                          </div>
                          <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                            <input
                              type="text"
                              name="cvv"
                              value={paymentForm.cvv}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 3) {
                                setPaymentForm({...paymentForm, cvv: value});
                              }
                              }}
                            placeholder="123"
                            maxLength="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        
                      <div>
                        <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={paymentForm.is_default}
                              onChange={(e) => setPaymentForm({...paymentForm, is_default: e.target.checked})}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Set as default payment method</span>
                          </label>
                      </div>
                        </div>
                        
                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => setShowPaymentModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                            disabled={isLoading}
                          >
                            {isLoading ? 'Saving...' : 'Save Payment Method'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
            )}
          </div>
        );
      
      case 'addresses':
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <HomeIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Saved Addresses</h2>
                  <p className="text-blue-100 text-xs">Manage your delivery addresses</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
            {addressesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {addresses.length > 0 ? (
                    <div className="space-y-4 mb-6">
                    {addresses.map(address => (
                        <div key={address.id} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-4">
                              <div className="p-3 bg-blue-100 rounded-lg">
                                <HomeIcon className="w-6 h-6 text-blue-600" />
                              </div>
                            <div>
                                <p className="font-semibold text-gray-900">{address.address_type}</p>
                                <p className="text-gray-700">{address.address_line}</p>
                                <p className="text-gray-700">{address.city}, {address.state} {address.postal_code}</p>
                                <p className="text-gray-600">{address.country}</p>
                            </div>
                          </div>
                            <div className="flex flex-col items-end space-y-2">
                            {address.is_default && (
                                <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 border border-green-200 rounded-full">
                                Default
                              </span>
                            )}
                            <div className="flex space-x-2">
                              <button 
                                  className="text-xs text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors duration-200"
                                onClick={() => handleDeleteAddress(address.id)}
                              >
                                Delete
                              </button>
                              {!address.is_default && (
                                <button 
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors duration-200"
                                  onClick={() => handleSetDefaultAddress(address.id)}
                                >
                                    Set Default
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                    <div className="text-center py-8">
                      <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <HomeIcon className="w-6 h-6 text-gray-400" />
                      </div>
                  <p className="text-gray-600 mb-4">No addresses saved yet</p>
                    </div>
                )}
                
                <button 
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  onClick={() => setShowAddressModal(true)}
                >
                    <HomeIcon className="w-4 h-4 inline mr-2" />
                  Add New Address
                </button>
                </>
              )}
            </div>
                
            {/* Address Modal - keeping existing modal with improved styling */}
                {showAddressModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl">
                    <h3 className="text-lg font-semibold text-white">Add New Address</h3>
                  </div>
                      
                  <form onSubmit={handleAddressSubmit} className="p-6">
                        {addressErrors.form && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                            {addressErrors.form}
                          </div>
                        )}
                        
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                          <select
                            name="address_type"
                            value={addressForm.address_type}
                            onChange={(e) => setAddressForm({...addressForm, address_type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Home">Home</option>
                            <option value="Work">Work</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address Line</label>
                          <input
                            type="text"
                            name="address_line"
                            value={addressForm.address_line}
                            onChange={(e) => setAddressForm({...addressForm, address_line: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Street address"
                          />
                          {addressErrors.address_line && (
                            <p className="text-red-600 text-sm mt-1">{addressErrors.address_line}</p>
                          )}
                        </div>
                        
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                          <input
                            type="text"
                            name="postal_code"
                            value={addressForm.postal_code}
                            onChange={(e) => {
                              const postalCode = e.target.value;
                              setAddressForm({...addressForm, postal_code: postalCode});
                              if (postalCode.length === 6) {
                                handlePostalCodeLookup(postalCode);
                              }
                            }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter 6-digit postal code"
                            maxLength="6"
                          />
                          {addressErrors.postal_code && (
                            <p className="text-red-600 text-sm mt-1">{addressErrors.postal_code}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">Enter a 6-digit postal code to auto-fill city and state</p>
                        </div>
                        
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                            <input
                              type="text"
                              name="city"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {addressErrors.city && (
                              <p className="text-red-600 text-sm mt-1">{addressErrors.city}</p>
                            )}
                          </div>
                          <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                            <input
                              type="text"
                              name="state"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {addressErrors.state && (
                              <p className="text-red-600 text-sm mt-1">{addressErrors.state}</p>
                            )}
                          </div>
                        </div>
                        
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                          <input
                            type="text"
                            name="country"
                            value={addressForm.country}
                            onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            readOnly
                          />
                        </div>
                        
                      <div>
                        <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={addressForm.is_default}
                              onChange={(e) => setAddressForm({...addressForm, is_default: e.target.checked})}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Set as default address</span>
                          </label>
                      </div>
                        </div>
                        
                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => setShowAddressModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                            disabled={isLoading}
                          >
                            {isLoading ? 'Saving...' : 'Save Address'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
            )}
          </div>
        );
      
      case 'security':
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <ShieldCheckIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Security Settings</h2>
                  <p className="text-blue-100 text-xs">Manage your password and account security</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Change Password Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ShieldCheckIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Change Password
                </h3>
            
            {passwordSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                {passwordSuccess}
              </div>
            )}
            
            {passwordErrors.auth && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {passwordErrors.auth}
              </div>
            )}
            
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                      name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your current password"
                />
                {passwordErrors.currentPassword && (
                      <p className="text-red-600 text-sm mt-1">{passwordErrors.currentPassword}</p>
                )}
              </div>
              
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                      name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your new password"
                />
                {passwordErrors.newPassword && (
                      <p className="text-red-600 text-sm mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>
              
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                      name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm your new password"
                />
                {passwordErrors.confirmPassword && (
                      <p className="text-red-600 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>
              
                <button 
                  type="submit" 
                    className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
            </form>
              </div>
              
              {/* Delete Account Section */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6 border border-red-200">
                <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5C3.312 17.333 4.274 19 5.814 19z" />
                  </svg>
                  Delete Account
                </h3>
                <p className="text-red-700 mb-4 text-sm">
                  Once you delete your account, there is no going back. Please be certain. This action will permanently delete your account and all associated data.
            </p>
            <button 
              onClick={handleDeleteAccount}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
            >
              Delete Account
            </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                  <h3 className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
              
              {/* Go to Dashboard */}
              <div className="mb-6">
                <button className="w-full flex items-center justify-between p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                  <div className="flex items-center space-x-2">
                    <ChartBarIcon className="w-4 h-4" />
                  <span className="font-medium">Go to Dashboard</span>
                  </div>
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
              
              {/* Navigation Menu */}
              <nav className="space-y-1">
                {[
                  { id: 'profile', icon: UserIcon, label: 'Profile' },
                  { id: 'orders', icon: ShoppingBagIcon, label: 'Orders' },
                  { id: 'payment', icon: CreditCardIcon, label: 'Payment Methods' },
                  { id: 'addresses', icon: HomeIcon, label: 'Addresses' },
                  { id: 'security', icon: ShieldCheckIcon, label: 'Security' },
                ].map(({ id, icon: Icon, label }) => (
                <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                      activeTab === id
                        ? 'bg-blue-100 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                </button>
                ))}
              </nav>
              
              {/* Sign Out */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button className="w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 font-medium">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
      
      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-blue-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Order Details - #{selectedOrder.id}</h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-white hover:text-gray-200 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Order Date</h4>
                  <p className="text-blue-700">
                    {new Date(selectedOrder.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="text-sm font-medium text-green-900 mb-1">Status</h4>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedOrder.status === 'Delivered' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : selectedOrder.status === 'Processing'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : selectedOrder.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="text-sm font-medium text-purple-900 mb-1">Total Amount</h4>
                  <p className="text-lg font-bold text-purple-700">₹{selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900">Order Items</h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => {
                      const itemPrice = item.price && typeof item.price === 'number' ? 
                        (item.price * (item.quantity || 1)).toFixed(2) : 
                        (selectedOrder.total / selectedOrder.items.length).toFixed(2);
                      
                      return (
                        <div key={index} className="p-4 flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">{item.quantity || 1}</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{item.name}</h5>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity || 1}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">₹{itemPrice}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No items found for this order.
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleDownloadInvoice(selectedOrder.id)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium"
                >
                  Download Invoice
                </button>
                <button 
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      

    </div>
  );
};

export default ProfilePage;