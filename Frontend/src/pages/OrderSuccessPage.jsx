import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, DevicePhoneMobileIcon, TruckIcon, CalendarIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  
  useEffect(() => {
    console.log('OrderSuccessPage - location.state:', location.state);
    
    // Get order details from navigation state
    if (location.state?.orderDetails) {
      console.log('Order details found:', location.state.orderDetails);
      setOrderDetails(location.state.orderDetails);
    } else {
      console.log('No order details found, redirecting to home in 3 seconds...');
      // Give it a few seconds before redirecting in case of timing issues
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  }, [location, navigate]);

  if (!orderDetails) {
    return (
      <div className="py-16">
        <div className="container">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  const estimatedDeliveryDate = new Date();
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 3);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600">Thank you for your order. Your payment has been processed successfully.</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium text-gray-900">{orderDetails.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-green-600">₹{orderDetails.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <div className="flex items-center">
                    {orderDetails.paymentMethod === 'upi' ? (
                      <>
                        <DevicePhoneMobileIcon className="w-4 h-4 mr-1 text-blue-500" />
                        <span className="font-medium text-gray-900">UPI Payment</span>
                      </>
                    ) : (
                      <>
                        <BuildingStorefrontIcon className="w-4 h-4 mr-1 text-orange-500" />
                        <span className="font-medium text-gray-900">Pay at Pickup</span>
                      </>
                    )}
                  </div>
                </div>
                {orderDetails.paymentMethod === 'upi' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">UPI ID:</span>
                      <span className="font-medium text-gray-900">{orderDetails.upiId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className="font-medium text-green-600">✓ Successful</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium text-gray-900">TXN{Date.now().toString().slice(-8)}</span>
                    </div>
                  </>
                )}
                {orderDetails.paymentMethod === 'pickup' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className="font-medium text-orange-600">Pay on Delivery</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Due:</span>
                      <span className="font-medium text-gray-900">₹{orderDetails.total?.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Delivery Address:</h3>
                <p className="text-gray-600">{orderDetails.deliveryAddress}</p>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <CalendarIcon className="w-4 h-4 mr-1 text-blue-500" />
                  <h3 className="font-medium text-gray-700">Estimated Delivery:</h3>
                </div>
                <p className="text-gray-600">{estimatedDeliveryDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                <p className="text-xs text-gray-500 mt-1">2-3 business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {orderDetails.items?.map((item, index) => (
              <div key={item.id || index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <img 
                    src={item.event?.image_url || '/images/event-placeholder.jpg'} 
                    alt={item.event?.title}
                    className="w-16 h-16 object-cover rounded-md mr-4" 
                    onError={(e) => {
                      e.target.src = '/images/event-placeholder.jpg';
                      e.target.onerror = null;
                    }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{item.event?.title}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">₹{item.total?.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex">
            <TruckIcon className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You'll receive an order confirmation email shortly</li>
                <li>• We'll start preparing your event package</li>
                <li>• You'll get tracking details once your order is dispatched</li>
                <li>• Our team will contact you before delivery</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/events" 
            className="btn btn-primary py-3 px-8 text-center"
          >
            Continue Shopping
          </Link>
          <Link 
            to="/dashboard" 
            className="btn btn-outline py-3 px-8 text-center"
          >
            View All Orders
          </Link>
          <button 
            onClick={() => window.print()} 
            className="btn btn-outline py-3 px-8"
          >
            Print Receipt
          </button>
        </div>

        {/* Support Information */}
        <div className="text-center mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-2">
            Need help with your order?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="text-primary hover:text-primary/80 text-sm font-medium">
              Contact Support
            </Link>
            <span className="hidden sm:inline text-gray-300">•</span>
            <a href="tel:+911234567890" className="text-primary hover:text-primary/80 text-sm font-medium">
              Call: +91 12345 67890
            </a>
            <span className="hidden sm:inline text-gray-300">•</span>
            <a href="mailto:support@eventcart.com" className="text-primary hover:text-primary/80 text-sm font-medium">
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage; 