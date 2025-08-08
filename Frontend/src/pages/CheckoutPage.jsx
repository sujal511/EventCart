import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, DevicePhoneMobileIcon, BuildingStorefrontIcon, TruckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useCart } from "../context/CartContext";
import { orderAPI } from '../services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { cart, loading, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    
    // Check if cart is empty
    if (!loading && (!cart || !cart.items || cart.items.length === 0)) {
      navigate('/cart');
      return;
    }
  }, [isAuthenticated, cart, loading, navigate]);

  // State for checkout form
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'upi',
    upiId: '',
    mobileNumber: ''
  });

  // Mock order summary data
  const orderSummary = {
    subtotal: 249.99,
    deliveryFee: 19.99,
    total: 269.98,
    items: 6
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Processing payment:', formData);
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Prepare order data for database
      const orderData = {
        items: cart.items.map(item => ({
          event_id: item.event_id,
          quantity: item.quantity
        })),
        shipping_address: formData.address,
        shipping_city: formData.city,
        shipping_state: formData.state,
        shipping_pincode: formData.zipCode,
        payment_method: formData.paymentMethod,
        total_amount: cart.total
      };
      
      console.log('Creating order in database:', orderData);
      
      // Create order in database
      const createdOrder = await orderAPI.createOrder(orderData);
      
      console.log('Order created successfully:', createdOrder);
      
      // Prepare order details for success page
      const orderDetails = {
        orderId: createdOrder.order_number || `ORD${createdOrder.id}`,
        total: cart.total,
        items: cart.items,
        paymentMethod: formData.paymentMethod,
        upiId: formData.upiId,
        deliveryAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
        dbOrderId: createdOrder.id
      };
      
      console.log('Navigating to order success with details:', orderDetails);
      
      // Navigate to success page with order details
      navigate('/order-success', {
        state: { orderDetails },
        replace: true
      });
      
      // Note: Not clearing cart here to avoid redirect conflicts
      // Cart will be cleared when user logs out or manually clears it
      
    } catch (error) {
      console.error('Payment failed:', error);
      setError('Payment failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="py-16">
        <div className="container">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart redirect
  if (!cart || !cart.items || cart.items.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Professional Header */}
        <div className="mb-8">
          <Link 
            to="/cart" 
            className="inline-flex items-center text-primary hover:text-primary/80 font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
          <div className="mt-6 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Secure Checkout</h1>
            <p className="text-lg text-gray-600">Complete your order safely and securely</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8 shadow-sm">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-red-600 text-sm font-bold">!</span>
              </div>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form - Left Side */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold">1</span>
                    </div>
                    Contact Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full border-2 border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full border-2 border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full border-2 border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        placeholder="Enter your email address"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full border-2 border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold">2</span>
                    </div>
                    Delivery Address
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full border-2 border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                        placeholder="Enter your complete address"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          className="w-full border-2 border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                          placeholder="Enter city"
                        />
                      </div>
                      <div>
                        <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                          className="w-full border-2 border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                          placeholder="Enter state"
                        />
                      </div>
                      <div>
                        <label htmlFor="zipCode" className="block text-sm font-semibold text-gray-700 mb-2">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          required
                          className="w-full border-2 border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                          placeholder="Enter ZIP code"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold">3</span>
                    </div>
                    Payment Method
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* UPI Payment Option */}
                    <div 
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                        formData.paymentMethod === 'upi' 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'upi' }))}
                    >
                      <div className="flex items-center mb-3">
                        <input
                          type="radio"
                          id="upi"
                          name="paymentMethod"
                          value="upi"
                          checked={formData.paymentMethod === 'upi'}
                          onChange={handleChange}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <DevicePhoneMobileIcon className="w-6 h-6 text-blue-500 ml-3 mr-2" />
                        <label htmlFor="upi" className="font-semibold text-gray-900">UPI Payment</label>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Pay instantly using UPI</p>
                      {formData.paymentMethod === 'upi' && (
                        <div>
                          <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">
                            UPI ID *
                          </label>
                          <input
                            type="text"
                            id="upiId"
                            name="upiId"
                            value={formData.upiId}
                            onChange={handleChange}
                            required={formData.paymentMethod === 'upi'}
                            className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="Enter your UPI ID"
                          />
                        </div>
                      )}
                    </div>

                    {/* Pay at Pickup Option */}
                    <div 
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                        formData.paymentMethod === 'pickup' 
                          ? 'border-orange-400 bg-orange-50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'pickup' }))}
                    >
                      <div className="flex items-center mb-3">
                        <input
                          type="radio"
                          id="pickup"
                          name="paymentMethod"
                          value="pickup"
                          checked={formData.paymentMethod === 'pickup'}
                          onChange={handleChange}
                          className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                        />
                        <BuildingStorefrontIcon className="w-6 h-6 text-orange-500 ml-3 mr-2" />
                        <label htmlFor="pickup" className="font-semibold text-gray-900">Pay at Pickup</label>
                      </div>
                      <p className="text-sm text-gray-600">Pay when you receive your order</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-3"></div>
                      Processing...
                    </div>
                  ) : (
                    `Complete Order • ₹${cart.total?.toFixed(2)}`
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Order Summary</h2>
              </div>
              <div className="p-6">
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {cart.items?.map((item, index) => (
                    <div key={item.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center">
                        <img 
                          src={item.event?.image_url || '/images/event-placeholder.jpg'} 
                          alt={item.event?.title}
                          className="w-12 h-12 object-cover rounded-lg mr-3 shadow-sm"
                          onError={(e) => {
                            e.target.src = '/images/event-placeholder.jpg';
                            e.target.onerror = null;
                          }}
                        />
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm leading-tight">
                            {item.event?.title}
                          </h3>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{item.total?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{cart.total?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-primary">₹{cart.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <TruckIcon className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-blue-900">Delivery Information</h3>
                  </div>
                  <p className="text-sm text-blue-800">
                    Your order will be delivered within 2-3 business days after processing.
                  </p>
                </div>

                {/* Security Badge */}
                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Secure & Encrypted Checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Privacy */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            By placing your order, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:text-primary/80 font-medium">
              Terms of Service
            </Link>
            {" "}and{" "}
            <Link to="/privacy" className="text-primary hover:text-primary/80 font-medium">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 