import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  UserGroupIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  TicketIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  MapPinIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

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

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const eventsPerPage = 12;

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    image_url: '',
    location: '',
    date: '',
    category: '',
    price: '',
    attendees: '',
    delivery_options: ''
  });

  const [editEvent, setEditEvent] = useState({
    id: '',
    title: '',
    description: '',
    image_url: '',
    location: '',
    date: '',
    category: '',
    price: '',
    attendees: '',
    delivery_options: ''
  });

  const [eventItems, setEventItems] = useState([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    quantity: 1,
    price: 0,
    image_url: '',
    category: ''
  });

  const [editingItem, setEditingItem] = useState(null);
  const [editItemData, setEditItemData] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading: authLoading, logout: authLogout } = useAuth();

  const categories = ['Music', 'Sports', 'Technology', 'Art', 'Food', 'Business', 'Education', 'Health'];

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.is_admin)) {
      navigate('/login');
      return;
    }

    if (isAuthenticated && user?.is_admin) {
      fetchEvents();
    }
  }, [navigate, isAuthenticated, authLoading, user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/events');
      if (response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await adminApi.post('/admin/events', newEvent);
      if (response.data) {
        setEvents([response.data, ...events]);
        setShowCreateModal(false);
        setNewEvent({
          title: '',
          description: '',
          image_url: '',
          location: '',
          date: '',
          category: '',
          price: '',
          attendees: '',
          delivery_options: ''
        });
        toast.success('Event created successfully');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await adminApi.delete(`/admin/events/${eventId}`);
      setEvents(events.filter(event => event.id !== eventId));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    authLogout(); // This clears user state and localStorage
    navigate('/'); // Redirect to landing page after logout
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleEditEvent = async (event) => {
    setEditEvent({
      id: event.id,
      title: event.title,
      description: event.description,
      image_url: event.image_url || '',
      location: event.location,
      date: event.date,
      category: event.category,
      price: event.price.toString(),
      attendees: event.attendees || '',
      delivery_options: event.delivery_options || ''
    });
    
    // Load event items
    try {
      console.log('Loading items for event ID:', event.id);
      const response = await adminApi.get(`/admin/events/${event.id}/items`);
      console.log('Items API response:', response.data);
      setEventItems(response.data);
    } catch (error) {
      console.error('Error loading event items:', error);
      console.error('Error details:', error.response?.data);
      setEventItems([]);
    }
    
    setShowEditModal(true);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await adminApi.put(`/admin/events/${editEvent.id}`, editEvent);
      if (response.data) {
        setEvents(events.map(event => 
          event.id === editEvent.id ? response.data : event
        ));
        setShowEditModal(false);
        setEditEvent({
          id: '',
          title: '',
          description: '',
          image_url: '',
          location: '',
          date: '',
          category: '',
          price: '',
          attendees: '',
          delivery_options: ''
        });
        setEventItems([]);
        toast.success('Event updated successfully');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      console.error('Error details:', error.response?.data);
      console.error('Status:', error.response?.status);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update event';
      toast.error(`Update failed: ${errorMessage}`);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const response = await adminApi.post(`/admin/events/${editEvent.id}/items`, newItem);
      if (response.data) {
        setEventItems([...eventItems, response.data]);
        setNewItem({
          name: '',
          description: '',
          quantity: 1,
          price: 0,
          image_url: '',
          category: ''
        });
        setShowAddItem(false);
        toast.success('Item added successfully');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    }
  };

  const handleUpdateItem = async (itemId, updatedItem) => {
    try {
      const response = await adminApi.put(`/admin/events/${editEvent.id}/items/${itemId}`, updatedItem);
      if (response.data) {
        setEventItems(eventItems.map(item => 
          item.id === itemId ? response.data : item
        ));
        toast.success('Item updated successfully');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await adminApi.delete(`/admin/events/${editEvent.id}/items/${itemId}`);
        setEventItems(eventItems.filter(item => item.id !== itemId));
        toast.success('Item deleted successfully');
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Failed to delete item');
      }
    }
  };

  const startEditingItem = (item) => {
    setEditingItem(item.id);
    setEditItemData({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      category: item.category || '',
      image_url: item.image_url || ''
    });
  };

  const cancelEditingItem = () => {
    setEditingItem(null);
    setEditItemData({});
  };

  const saveEditingItem = async () => {
    try {
      const response = await adminApi.put(`/admin/events/${editEvent.id}/items/${editingItem}`, editItemData);
      if (response.data) {
        setEventItems(eventItems.map(item => 
          item.id === editingItem ? response.data : item
        ));
        setEditingItem(null);
        setEditItemData({});
        toast.success('Item updated successfully');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  // Filter and search events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterCategory === 'all' || event.category === filterCategory;

    return matchesSearch && matchesFilter;
  });

  // Pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

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
      <div className="ml-64 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-600">Create and manage all events</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Create Event
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {currentEvents.length > 0 ? (
            currentEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  {event.image_url ? (
                    <img 
                      src={event.image_url} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <TicketIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                      {event.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">{event.title}</h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <CalendarDaysIcon className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TagIcon className="w-4 h-4" />
                      <span className="font-medium text-gray-900">₹{event.price}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewEvent(event)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit Event"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        disabled={deleting}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Event"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">
                      {event.attendees || '0'} attendees
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <TicketIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No events found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {indexOfFirstEvent + 1} to {Math.min(indexOfLastEvent, filteredEvents.length)} of {filteredEvents.length} events
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <span className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-lg">
                {currentPage}
              </span>
              <span className="text-gray-500">of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Create New Event</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={newEvent.price}
                    onChange={(e) => setNewEvent({...newEvent, price: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="text"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    placeholder="e.g., 15 Dec 2024"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={newEvent.image_url}
                    onChange={(e) => setNewEvent({...newEvent, image_url: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Attendees</label>
                  <input
                    type="text"
                    value={newEvent.attendees}
                    onChange={(e) => setNewEvent({...newEvent, attendees: e.target.value})}
                    placeholder="e.g., 100-200"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Options</label>
                <input
                  type="text"
                  value={newEvent.delivery_options}
                  onChange={(e) => setNewEvent({...newEvent, delivery_options: e.target.value})}
                  placeholder="e.g., E-ticket, Physical ticket"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Event Details</h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedEvent.image_url && (
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={selectedEvent.image_url} 
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedEvent.title}</h4>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mb-3">
                  {selectedEvent.category}
                </span>
                <p className="text-gray-600 leading-relaxed">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Date</span>
                  </div>
                  <p className="font-medium">{selectedEvent.date}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <p className="font-medium">{selectedEvent.location}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <TagIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Price</span>
                  </div>
                  <p className="font-medium">₹{selectedEvent.price}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <UserGroupIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Attendees</span>
                  </div>
                  <p className="font-medium">{selectedEvent.attendees || 'Not specified'}</p>
                </div>
              </div>

              {selectedEvent.delivery_options && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h5 className="font-medium text-gray-900 mb-1">Delivery Options</h5>
                  <p className="text-gray-600">{selectedEvent.delivery_options}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Edit Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Edit Event</h3>
              <button
                                  onClick={() => {
                    setShowEditModal(false);
                    setEventItems([]);
                    setShowAddItem(false);
                    setEditingItem(null);
                    setEditItemData({});
                  }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editEvent.title}
                  onChange={(e) => setEditEvent({...editEvent, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editEvent.description}
                  onChange={(e) => setEditEvent({...editEvent, description: e.target.value})}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editEvent.category}
                    onChange={(e) => setEditEvent({...editEvent, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={editEvent.price}
                    onChange={(e) => setEditEvent({...editEvent, price: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editEvent.location}
                    onChange={(e) => setEditEvent({...editEvent, location: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="text"
                    value={editEvent.date}
                    onChange={(e) => setEditEvent({...editEvent, date: e.target.value})}
                    placeholder="e.g., 15 Dec 2024"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={editEvent.image_url}
                    onChange={(e) => setEditEvent({...editEvent, image_url: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Attendees</label>
                  <input
                    type="text"
                    value={editEvent.attendees}
                    onChange={(e) => setEditEvent({...editEvent, attendees: e.target.value})}
                    placeholder="e.g., 100-200"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Options</label>
                <input
                  type="text"
                  value={editEvent.delivery_options}
                  onChange={(e) => setEditEvent({...editEvent, delivery_options: e.target.value})}
                  placeholder="e.g., E-ticket, Physical ticket"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Event Items Section */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Event Items</h4>
                  <button
                    type="button"
                    onClick={() => setShowAddItem(true)}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Item
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {eventItems.map((item) => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                      {editingItem === item.id ? (
                        // Editing mode
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                              <input
                                type="text"
                                value={editItemData.name}
                                onChange={(e) => setEditItemData({...editItemData, name: e.target.value})}
                                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Price (₹)</label>
                              <input
                                type="number"
                                value={editItemData.price}
                                onChange={(e) => setEditItemData({...editItemData, price: parseFloat(e.target.value)})}
                                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                            <input
                              type="text"
                              value={editItemData.description}
                              onChange={(e) => setEditItemData({...editItemData, description: e.target.value})}
                              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                              <input
                                type="number"
                                value={editItemData.quantity}
                                onChange={(e) => setEditItemData({...editItemData, quantity: parseInt(e.target.value)})}
                                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                                min="1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                              <input
                                type="text"
                                value={editItemData.category}
                                onChange={(e) => setEditItemData({...editItemData, category: e.target.value})}
                                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                                placeholder="e.g., decorations"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
                            <input
                              type="url"
                              value={editItemData.image_url}
                              onChange={(e) => setEditItemData({...editItemData, image_url: e.target.value})}
                              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={cancelEditingItem}
                              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={saveEditingItem}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <div className="flex items-center gap-3">
                          {item.image_url && (
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{item.name}</h5>
                            <p className="text-sm text-gray-600">{item.description}</p>
                            <div className="flex gap-4 text-sm text-gray-500 mt-1">
                              <span>Qty: {item.quantity}</span>
                              <span>₹{item.price}</span>
                              <span>Category: {item.category || 'Default'}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => startEditingItem(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                              title="Edit Item"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedItem = {
                                  ...item,
                                  quantity: item.quantity + 1
                                };
                                handleUpdateItem(item.id, updatedItem);
                              }}
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                              title="Increase Quantity"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  const updatedItem = {
                                    ...item,
                                    quantity: item.quantity - 1
                                  };
                                  handleUpdateItem(item.id, updatedItem);
                                }
                              }}
                              className="p-1.5 text-yellow-600 hover:bg-yellow-100 rounded"
                              title="Decrease Quantity"
                              disabled={item.quantity <= 1}
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                              title="Delete Item"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {eventItems.length === 0 && (
                    <div className="text-center py-8">
                      <TicketIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No items added yet</p>
                      <p className="text-sm text-gray-400">Click "Add Item" to get started</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEventItems([]);
                    setShowAddItem(false);
                    setEditingItem(null);
                    setEditItemData({});
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add New Item</h3>
              <button
                onClick={() => setShowAddItem(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                    min="1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value)})}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  placeholder="e.g., decorations, tableware"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={newItem.image_url}
                  onChange={(e) => setNewItem({...newItem, image_url: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents; 