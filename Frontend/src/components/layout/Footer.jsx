import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-section">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-bold text-white">EventCart</Link>
            <p className="mt-4 text-gray-300">
              Transforming the way people shop for events by streamlining bulk purchasing directly from local wholesale suppliers.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-gray-300 hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Event Categories */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Event Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/events/birthday" className="text-gray-300 hover:text-white transition-colors">
                  Birthday Parties
                </Link>
              </li>
              <li>
                <Link to="/events/wedding" className="text-gray-300 hover:text-white transition-colors">
                  Weddings
                </Link>
              </li>
              <li>
                <Link to="/events/housewarming" className="text-gray-300 hover:text-white transition-colors">
                  Housewarming
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Contact Us</h3>
            <address className="not-italic">
              <p className="text-gray-300 mb-2">123 Event Plaza</p>
              <p className="text-gray-300 mb-2">Karwar, Karnataka – 581301</p>
              <p className="text-gray-300 mb-2">Email: info@eventcart.com</p>
              <p className="text-gray-300">Phone: +91 98451 71207</p>
            </address>
          </div>
        </div>

        <hr className="border-gray-700 my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} EventCart. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-6">
              <Link to="/terms-of-service" className="text-gray-400 hover:text-white text-sm">
                Terms of Service
              </Link>
              <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </Link>
              <Link to="/faq" className="text-gray-400 hover:text-white text-sm">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 