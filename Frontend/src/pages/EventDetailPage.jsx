import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCartIcon, ArrowLeftIcon, TruckIcon, ClockIcon, HeartIcon, PlusIcon, MinusIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, SparklesIcon } from '@heroicons/react/24/solid';
import { eventAPI, wishlistAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

const EventDetailPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  
  // Define all state variables at the top level
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDelivery, setSelectedDelivery] = useState('');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  // Customizable items state
  const [customizedItems, setCustomizedItems] = useState({});
  
  // Fetch event data from API
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    const fetchEventData = async () => {
      try {
        const data = await eventAPI.getEventById(eventId);
        if (isMounted) {
          console.log('Event details fetched successfully:', data);
          setEvent(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        if (isMounted) {
          setError('Failed to load event details. Please try again later.');
          setIsLoading(false);
          
          // For demo purposes, fall back to sample data if API fails
          const fallbackEvent = {
            id: eventId,
            name: 'Birthday Party - Premium',
            description: 'Everything you need for a memorable birthday celebration. This package includes decorations, tableware, food and drink containers, and party favors for up to 25 people.',
            image: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
            price: 249.99,
            category: 'birthday',
            items: 42,
            people: '15-25',
            deliveryOptions: [
              { id: 'delivery', name: 'Local Delivery', price: 19.99, time: '2-3 days' },
              { id: 'express', name: 'Express Delivery', price: 34.99, time: '24 hours' },
              { id: 'pickup', name: 'Self Pickup', price: 0, time: 'Same day' }
            ],
            categories: [
              {
                id: 'decorations',
                name: 'Decorations',
                items: [
                  { id: 1, name: 'Balloons (Set of 50)', quantity: 1, price: 24.99 },
                  { id: 2, name: 'Birthday Banner', quantity: 1, price: 12.99 },
                  { id: 3, name: 'Table Confetti', quantity: 2, price: 4.99 },
                  { id: 4, name: 'Birthday Centerpiece', quantity: 3, price: 8.99 },
                  { id: 5, name: 'LED String Lights', quantity: 2, price: 15.99 }
                ]
              },
              {
                id: 'tableware',
                name: 'Tableware',
                items: [
                  { id: 6, name: 'Disposable Plates (25 pcs)', quantity: 2, price: 9.99 },
                  { id: 7, name: 'Disposable Cups (25 pcs)', quantity: 2, price: 7.99 },
                  { id: 8, name: 'Napkins (50 pcs)', quantity: 1, price: 5.99 },
                  { id: 9, name: 'Plastic Cutlery Set (25 sets)', quantity: 2, price: 8.99 },
                  { id: 10, name: 'Table Cloths', quantity: 3, price: 12.99 }
                ]
              },
              {
                id: 'food',
                name: 'Food & Drink Containers',
                items: [
                  { id: 11, name: 'Serving Platters', quantity: 4, price: 6.99 },
                  { id: 12, name: 'Drink Dispenser (2 Gal)', quantity: 1, price: 19.99 },
                  { id: 13, name: 'Ice Bucket', quantity: 1, price: 14.99 },
                  { id: 14, name: 'Food Storage Containers', quantity: 5, price: 4.99 }
                ]
              },
              {
                id: 'favors',
                name: 'Party Favors',
                items: [
                  { id: 15, name: 'Gift Bags (Set of 10)', quantity: 3, price: 12.99 },
                  { id: 16, name: 'Party Whistles (10 pcs)', quantity: 2, price: 6.99 },
                  { id: 17, name: 'Party Hats (10 pcs)', quantity: 2, price: 8.99 }
                ]
              }
            ]
          };
          setEvent(fallbackEvent);
        }
      }
    };
    
    fetchEventData();
    
    return () => {
      isMounted = false;
    };
  }, [eventId]);
  
  // Update state values once we have the event data
  useEffect(() => {
    if (event) {
      // Set default delivery option
      if (event.delivery_options?.length > 0) {
        setSelectedDelivery(event.delivery_options[0].id);
      }
      
      // Check if event is in wishlist
      checkWishlistStatus();
    }
  }, [event]);

  // Check if current event is in wishlist
  const checkWishlistStatus = async () => {
    try {
      const response = await wishlistAPI.getWishlist();
      const wishlistItems = response.data || response || [];
      const isInList = wishlistItems.some(item => item.event_id === parseInt(eventId));
      setIsInWishlist(isInList);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      // Don't show error to user, just assume not in wishlist
      setIsInWishlist(false);
    }
  };

  // Initialize customized items when event data loads
  useEffect(() => {
    if (event && event.categories) {
      const initialItems = {};
      event.categories.forEach(category => {
        category.items?.forEach(item => {
          initialItems[item.id] = {
            ...item,
            customQuantity: item.quantity,
            included: true
          };
        });
      });
      setCustomizedItems(initialItems);
    }
  }, [event]);

  // Calculate package price based on customized items
  const calculatePackagePrice = () => {
    let total = 0;
    Object.values(customizedItems).forEach(item => {
      if (item.included && item.customQuantity > 0) {
        total += (item.price || 0) * item.customQuantity;
      }
    });
    return total;
  };

  // Update item quantity
  const updateItemQuantity = (itemId, newQuantity) => {
    setCustomizedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        customQuantity: Math.max(0, newQuantity)
      }
    }));
  };

  // Toggle item inclusion
  const toggleItemInclusion = (itemId) => {
    setCustomizedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        included: !prev[itemId]?.included
      }
    }));
  };

  // Remove item completely
  const removeItem = (itemId) => {
    setCustomizedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        included: false,
        customQuantity: 0
      }
    }));
  };

  // Reset to original package
  const resetToOriginal = () => {
    if (event && event.categories) {
      const initialItems = {};
      event.categories.forEach(category => {
        category.items?.forEach(item => {
          initialItems[item.id] = {
            ...item,
            customQuantity: item.quantity,
            included: true
          };
        });
      });
      setCustomizedItems(initialItems);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error && !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <Link to="/events" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to all events
        </Link>
      </div>
    );
  }
  
  // If we don't have event data, return null
  if (!event) return null;
  
  // Cleanup function for effect
  // No need for an empty cleanup effect as we already have cleanup in the data fetching effect



  // Calculate dynamic package price based on customized items
  const packagePrice = calculatePackagePrice();
  const deliveryOption = event?.delivery_options?.find(option => option.id === selectedDelivery) || null;
  const deliveryFee = deliveryOption ? deliveryOption.price : 0;
  const total = packagePrice + deliveryFee;

  // Add to cart handler
  const handleAddToCart = async () => {
    try {
      // Validate delivery option is selected
      if (!selectedDelivery) {
        setError('Please select a delivery option');
        return;
      }

      // Calculate custom price based on selected items
      const customPrice = calculatePackagePrice();
      
      // Prepare customized items data
      const customizedItemsData = Object.values(customizedItems).filter(item => item.included && item.customQuantity > 0);

      // Use cart context to add event to cart with customized data
      await addToCart(event.id, 1, customPrice, customizedItemsData);
      
      // Show success message
      toast.success('Added to cart successfully!');
      
      // Navigate to cart page
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Handle different error scenarios
      if (error.message.includes('Please log in') || error.response?.status === 401) {
        // Save current page URL to redirect back after login
        const returnUrl = encodeURIComponent(location.pathname);
        navigate(`/login?redirect=${returnUrl}`, { 
          state: { 
            message: 'Please log in to add items to your cart'
          }
        });
      } else if (error.message.includes('session has expired')) {
        // Handle expired session
        navigate('/login', {
          state: {
            message: 'Your session has expired. Please log in again.',
            from: location.pathname
          }
        });
      } else {
        // Show error message to user
        setError(error.message || 'Failed to add item to cart. Please try again.');
        // Clear error after 5 seconds
        setTimeout(() => setError(null), 5000);
      }
    }
  };

  // Wishlist handler
  const handleWishlistToggle = async () => {
    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await wishlistAPI.removeFromWishlist(event.id);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistAPI.addToWishlist(event.id);
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      if (error.response?.status === 401) {
        const returnUrl = encodeURIComponent(location.pathname);
        navigate(`/login?redirect=${returnUrl}`, { 
          state: { 
            message: 'Please log in to use wishlist'
          }
        });
      } else {
        toast.error(error.message || 'Failed to update wishlist');
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  if (!event) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Link to="/events" className="btn btn-primary">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Professional Back button */}
        <div className="mb-8">
          <Link 
            to="/events" 
            className="inline-flex items-center px-4 py-2 bg-white text-primary hover:bg-primary hover:text-white font-medium rounded-lg shadow-sm border border-gray-200 transition-all duration-200 group"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Events
          </Link>
        </div>

        {/* Professional Event Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8 border border-gray-100">
          <div className="h-80 relative">
            <img 
              src={event.image_url || event.image} 
              alt={event.name || event.title} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 text-white p-6">
              <div className="max-w-4xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-3 drop-shadow-lg">{event.name || event.title}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="font-medium">{event.items?.length || 0} items</span>
                  </div>
                  <div className="flex items-center bg-primary/80 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="font-medium">₹{packagePrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed mb-4">{event.description}</p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                {event.category?.charAt(0).toUpperCase() + event.category?.slice(1)}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                Customizable Package
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Professional Shopping List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Shopping List</h2>
                  <p className="text-gray-600">Customize your perfect package</p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                  <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-1">
                      <SparklesIcon className="w-4 h-4 mr-1 text-blue-600" />
                      <span className="font-medium text-blue-900">Customize your package</span>
                    </div>
                    <p className="text-xs text-blue-700">Adjust quantities or remove items you don't need</p>
                  </div>
                  <button
                    onClick={resetToOriginal}
                    className="text-sm text-primary hover:text-primary-dark underline font-medium transition-colors"
                  >
                    Reset to Original
                  </button>
                </div>
              </div>
              
              {event.categories?.map(category => (
                <div key={category.id} className="mb-8">
                  <div className="flex items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mr-3">{category.name}</h3>
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-sm text-gray-500 ml-3 bg-gray-100 px-2 py-1 rounded-full">
                      {category.items?.length || 0} items
                    </span>
                  </div>
                  <div className="space-y-3">
                    {category.items?.map(item => {
                      const customItem = customizedItems[item.id] || item;
                      const isIncluded = customItem.included !== false;
                      const quantity = customItem.customQuantity || item.quantity;
                      
                      return (
                        <div key={item.id} className={`p-4 rounded-lg border transition-all duration-200 ${
                          isIncluded 
                            ? 'border-green-200 bg-green-50/50' 
                            : 'border-gray-200 bg-gray-50/50 opacity-60'
                        }`}>
                          <div className="flex items-center gap-4">
                            {/* Professional Item Image */}
                            <div className="flex-shrink-0">
                              {item.image_url ? (
                                <div className="relative">
                                  <img 
                                    src={item.image_url} 
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded-lg shadow-sm border border-gray-200"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                  {isIncluded && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                      <CheckCircleIcon className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                  <ShoppingCartIcon className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            {/* Item Details */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className={`font-semibold mb-1 ${!isIncluded ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                    {item.name}
                                  </h4>
                                  <p className="text-gray-600 text-sm mb-2">{item.description || `Category: ${category.name}`}</p>
                                  {item.price && (
                                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                      ₹{item.price} each
                                    </span>
                                  )}
                                </div>
                                
                                {/* Professional Controls */}
                                <div className="flex items-center gap-3">
                                  {isIncluded ? (
                                    <>
                                      {/* Quantity Controls */}
                                      <div className="flex items-center bg-white rounded-md border border-gray-300 shadow-sm">
                                        <button
                                          onClick={() => updateItemQuantity(item.id, quantity - 1)}
                                          disabled={quantity <= 1}
                                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-l-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                          <MinusIcon className="w-4 h-4" />
                                        </button>
                                        
                                        <span className="px-3 py-2 font-semibold text-primary min-w-[2.5rem] text-center">
                                          {quantity}
                                        </span>
                                        
                                        <button
                                          onClick={() => updateItemQuantity(item.id, quantity + 1)}
                                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-r-md transition-colors"
                                        >
                                          <PlusIcon className="w-4 h-4" />
                                        </button>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-green-700 font-medium bg-green-100 px-2 py-1 rounded-full">
                                          Included
                                        </span>
                                        
                                        {/* Remove Button */}
                                        <button
                                          onClick={() => removeItem(item.id)}
                                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                          title="Remove item"
                                        >
                                          <XMarkIcon className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">Removed</span>
                                      
                                      {/* Add Back Button */}
                                      <button
                                        onClick={() => toggleItemInclusion(item.id)}
                                        className="px-3 py-1.5 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium rounded-md border border-blue-200 transition-colors"
                                      >
                                        Add Back
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Professional Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <ShoppingCartIcon className="w-5 h-5 text-primary mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Package Price</span>
                  <span className="font-semibold text-gray-900">₹{packagePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center">
                    <TruckIcon className="w-4 h-4 mr-1 text-green-500" />
                    <span className="text-gray-600">Delivery Fee</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center mb-1">
                  <SparklesIcon className="w-3 h-3 mr-1 text-blue-600" />
                  <span className="font-medium text-blue-900">Customized Package</span>
                </div>
                Package includes {Object.values(customizedItems).filter(item => item.included && item.customQuantity > 0).length} items with your specified quantities.
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-900">Delivery Options</h3>
                <div className="space-y-2">
                  {event.delivery_options?.map(option => (
                    <label 
                      key={option.id} 
                      className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedDelivery === option.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value={option.id}
                        checked={selectedDelivery === option.id}
                        onChange={() => setSelectedDelivery(option.id)}
                        className="mt-1 mr-3 text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{option.name}</div>
                        <div className="text-sm flex items-center mt-1 text-gray-600">
                          <ClockIcon className="w-4 h-4 mr-1 text-gray-500" />
                          <span>{option.time}</span>
                        </div>
                        <div className="text-sm font-semibold mt-1 text-primary">
                          {option.price === 0 ? 'Free' : `₹${option.price.toFixed(2)}`}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleAddToCart}
                  className="w-full btn btn-primary py-3 text-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <ShoppingCartIcon className="w-5 h-5 mr-2" />
                  Add Package to Cart
                </button>
                
                <button 
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className="w-full py-3 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium text-gray-700"
                >
                  {wishlistLoading ? (
                    <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
                  ) : (
                    <>
                      {isInWishlist ? (
                        <HeartIconSolid className="w-5 h-5 mr-2 text-red-500" />
                      ) : (
                        <HeartIcon className="w-5 h-5 mr-2" />
                      )}
                    </>
                  )}
                  {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage; 