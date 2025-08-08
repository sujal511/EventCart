import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const HomePage = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEventDropdown, setShowEventDropdown] = useState(false);

  useEffect(() => {
    // Fetch events from backend API
    fetch('http://localhost:5000/api/events')
      .then(response => response.json())
      .then(data => {
        setAllEvents(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
        // Fallback to sample data if API fails
        setAllEvents(sampleEvents);
        setIsLoading(false);
      });
  }, []);

  // Sample data for event categories
  const eventCategories = [
    {
      id: 1,
      name: 'Birthday Parties',
      description: 'Everything you need for a memorable birthday celebration',
      image: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      path: '/events/category/birthday'
    },
    {
      id: 2,
      name: 'Weddings',
      description: 'Elegant supplies for your perfect wedding day',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      path: '/events/category/wedding'
    },
    {
      id: 3,
      name: 'Housewarming',
      description: 'Everything needed to welcome guests to a new home',
      image: 'https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      path: '/events/category/housewarming'
    },

    {
      id: 5,
      name: 'Festivals',
      description: 'Celebrate cultural traditions with all essential items',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      path: '/events/category/festivals'
    },
    {
      id: 6,
      name: 'Baby Showers',
      description: 'Welcome the newest addition with perfect party supplies',
      image: 'https://images.pexels.com/photos/459296/pexels-photo-459296.jpeg?auto=compress&w=1000&q=80',
      path: '/events/category/baby-shower'
    },
    {
      id: 7,
      name: 'Graduation Parties',
      description: 'Celebrate academic achievements with style',
      image: 'https://images.unsplash.com/photo-1627556592933-ffe99c1cd9eb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      path: '/events/category/graduation'
    },
    {
      id: 8,
      name: 'Anniversary Celebrations',
      description: 'Mark your special milestones with perfect party essentials',
      image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      path: '/events/category/anniversary'
    }
  ];

  // Sample events data as fallback
  const sampleEvents = [
    {
      id: 1,
      title: "Tech Conference 2023",
      description: "Join us for the biggest tech conference in India",
      location: "Bangalore",
      image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800"
    },
    {
      id: 2,
      title: "Music Festival 2023",
      description: "Experience the ultimate music festival",
      location: "Gurugram",
      image_url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800"
    },
    {
      id: 3,
      title: "Food & Culture Expo",
      description: "Explore the rich culinary traditions of India",
      location: "New Delhi",
      image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800"
    }
  ];

  // Sample data for how it works steps
  const howItWorksSteps = [
    {
      id: 1,
      title: 'Choose an Event Type',
      description: 'Select from our curated list of event templates to find exactly what you need.'
    },
    {
      id: 2,
      title: 'Customize Your Order',
      description: 'Add, remove, or adjust quantities of items based on your event size and preferences.'
    },
    {
      id: 3,
      title: 'Select Delivery Option',
      description: 'Choose between local delivery or self-pickup based on your convenience.'
    },
    {
      id: 4,
      title: 'Track Your Order',
      description: 'Receive real-time updates about your order status from preparation to delivery.'
    }
  ];

  const toggleEventDropdown = () => {
    setShowEventDropdown(!showEventDropdown);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Effortless Event Shopping
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Shop for events directly from wholesale suppliers with curated lists, customization options, and convenient delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/events" className="btn bg-white text-primary hover:bg-gray-100 py-3 px-8 text-lg font-semibold shadow-lg hover:shadow-xl">
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Event Categories Section */}
      <section className="py-16 bg-light">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Event Categories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find ready-made shopping lists for any occasion
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {eventCategories.map((category) => (
              <div key={category.id} className="card group">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <Link 
                    to={category.path} 
                    className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                  >
                    View Lists
                    <ArrowRightIcon className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How EventCart Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Shop smarter and save time with our streamlined process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorksSteps.map((step) => (
              <div key={step.id} className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mb-6">
                  {step.id}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Simplify Your Event Shopping?</h2>
            <p className="text-xl mb-8">
              Join thousands of customers who have transformed their event planning experience with EventCart.
            </p>
            <Link to="/events" className="btn bg-white text-[#5146E5] hover:bg-gray-100 py-3 px-8 text-lg font-semibold shadow-lg hover:shadow-xl">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;