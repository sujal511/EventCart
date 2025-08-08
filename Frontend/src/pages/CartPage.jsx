import { Link } from 'react-router-dom';
import { TrashIcon, ArrowLeftIcon, ShoppingBagIcon, StarIcon, TagIcon, TruckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { HeartIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { cart, loading, removeFromCart } = useCart();
  const [notification, setNotification] = useState({ show: false, message: '' });
  
  // Handle remove item from cart
  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
    setNotification({ show: true, message: 'Item removed from cart!' });
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
  };

  // Loading state with enhanced UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-16">
        <div className="container">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-6"></div>
              <ShoppingBagIcon className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Loading your cart</h2>
            <p className="text-gray-600">Please wait while we fetch your items...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Cart is empty state with enhanced UI
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-16">
        <div className="container">
          <div className="text-center max-w-lg mx-auto">
            <div className="relative mb-8">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg">
                <ShoppingBagIcon className="w-16 h-16 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Ready to plan something amazing? Explore our curated event packages and create unforgettable memories.
            </p>
            <div className="space-y-4">
              <Link 
                to="/events" 
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <SparklesIcon className="w-5 h-5 mr-2" />
                Explore Event Packages
              </Link>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Free consultation
                </div>
                <div className="flex items-center">
                  <TruckIcon className="w-4 h-4 mr-1" />
                  Fast delivery
                </div>
                <div className="flex items-center">
                  <StarIcon className="w-4 h-4 mr-1" />
                  Top-rated service
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 relative">
      {/* Enhanced notification */}
      {notification.show && (
        <div className="fixed top-6 right-6 bg-white border-l-4 border-green-500 shadow-xl px-6 py-4 rounded-lg z-50 transition-all duration-300 transform">
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
            <span className="text-gray-800 font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="container">
        {/* Enhanced header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 bg-white rounded-2xl p-6 shadow-sm">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Cart</h1>
            <p className="text-gray-600">
              {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} ready for checkout
            </p>
          </div>
          <Link 
            to="/events" 
            className="inline-flex items-center text-primary hover:text-primary-dark font-semibold transition-colors group mt-4 md:mt-0"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Enhanced cart items */}
          <div className="xl:col-span-2 space-y-6">
            {cart.items.map((cartItem, index) => (
              <div key={cartItem.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                <div className="p-8">
                  {/* Enhanced cart item header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start space-x-6">
                      <div className="relative">
                        <img 
                          src={cartItem.customized_items && JSON.parse(cartItem.customized_items).length > 0 
                            ? JSON.parse(cartItem.customized_items)[0].image_url || cartItem.event?.image_url || '/images/event-placeholder.jpg'
                            : cartItem.event?.image_url || '/images/event-placeholder.jpg'
                          } 
                          alt={cartItem.event?.title || 'Event'}
                          className="w-24 h-24 object-cover rounded-xl shadow-md" 
                          onError={(e) => {
                            e.target.src = '/images/event-placeholder.jpg';
                            e.target.onerror = null;
                          }}
                        />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{cartItem.event?.title || 'Event'}</h3>
                        <div className="flex flex-wrap items-center gap-4 mb-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <TagIcon className="w-4 h-4 mr-1" />
                            Quantity: {cartItem.quantity}
                          </div>
                          <div className="text-sm font-semibold text-primary">
                            ₹{cartItem.price?.toFixed(2)} each
                          </div>
                        </div>
                        {cartItem.customized_items && (
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border border-orange-200">
                            <SparklesIcon className="w-4 h-4 mr-1" />
                            Customized Package
                            <span className="ml-2 px-2 py-0.5 bg-orange-200 rounded-full text-xs">
                              {JSON.parse(cartItem.customized_items).length} items
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(cartItem.id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                      aria-label="Remove item"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Enhanced customized items details */}
                  {cartItem.customized_items && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <SparklesIcon className="w-5 h-5 text-primary mr-2" />
                        Your Customized Items
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {JSON.parse(cartItem.customized_items).map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                            <div className="flex items-center space-x-3">
                              {item.image_url && (
                                <img 
                                  src={item.image_url} 
                                  alt={item.name}
                                  className="w-10 h-10 object-cover rounded-md"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                              <div>
                                <span className="font-medium text-gray-900">{item.name}</span>
                                <div className="text-sm text-gray-500">Qty: {item.customQuantity}</div>
                              </div>
                            </div>
                            <span className="font-semibold text-primary">₹{(item.price * item.customQuantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                    <Link 
                      to={`/events/${cartItem.event_id}`}
                      className="inline-flex items-center text-primary hover:text-primary-dark font-semibold transition-colors group"
                    >
                      View Event Details
                      <ArrowLeftIcon className="w-4 h-4 ml-1 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Item Total</div>
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{cartItem.total?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced order summary */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-8 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <ShoppingBagIcon className="w-6 h-6 mr-2 text-primary" />
                Order Summary
              </h2>
              
              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-lg font-semibold text-gray-900">₹{cart.total?.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <TruckIcon className="w-4 h-4 mr-1 text-green-500" />
                    <span className="text-gray-600">Delivery</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-green-600">FREE</span>
                    <div className="text-xs text-gray-500">For orders above ₹999</div>
                  </div>
                </div>
                
                                                 
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-primary">₹{cart.total?.toFixed(2)}</span>
                      <div className="text-sm text-gray-500">All inclusive</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Link 
                  to="/checkout" 
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
                >
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Proceed to Checkout
                </Link>
                
                <Link 
                  to="/events" 
                  className="w-full border-2 border-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:border-primary hover:text-primary transition-all duration-200 flex items-center justify-center group"
                >
                  <SparklesIcon className="w-5 h-5 mr-2 group-hover:text-primary" />
                  Continue Shopping
                </Link>
              </div>

              {/* Trust signals */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto mb-1" />
                    <div className="text-xs text-gray-600">Secure Payment</div>
                  </div>
                  <div>
                    <TruckIcon className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <div className="text-xs text-gray-600">Fast Delivery</div>
                  </div>
                  <div>
                    <HeartIcon className="w-6 h-6 text-red-500 mx-auto mb-1" />
                    <div className="text-xs text-gray-600">100% Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 