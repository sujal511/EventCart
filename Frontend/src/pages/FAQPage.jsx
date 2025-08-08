import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const FAQPage = () => {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const faqData = [
    {
      id: 'general',
      title: 'General Questions',
      questions: [
        {
          id: 'what-is-eventcart',
          question: 'What is EventCart?',
          answer: 'EventCart is a comprehensive event management platform that allows users to discover, book, and manage events. Whether you\'re looking for concerts, workshops, conferences, or social gatherings, EventCart makes it easy to find and attend events in your area.'
        },
        {
          id: 'how-it-works',
          question: 'How does EventCart work?',
          answer: 'Simply browse our event listings, select events that interest you, and book your tickets securely through our platform. You\'ll receive confirmation emails and reminders, and you can manage all your bookings through your personal dashboard.'
        },
        {
          id: 'cost',
          question: 'Is EventCart free to use?',
          answer: 'Creating an account and browsing events on EventCart is completely free. You only pay for the events you book, plus any applicable service fees.'
        }
      ]
    },
    {
      id: 'booking',
      title: 'Booking & Tickets',
      questions: [
        {
          id: 'book-tickets',
          question: 'How do I book tickets for an event?',
          answer: 'To book tickets: 1) Find the event you want to attend, 2) Click on the event to view details, 3) Select your preferred ticket type and quantity, 4) Add to cart and proceed to checkout, 5) Complete payment to secure your booking.'
        },
        {
          id: 'payment-methods',
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and digital wallets like PayPal. All payments are processed securely through encrypted channels.'
        },
        {
          id: 'confirmation',
          question: 'Will I receive a confirmation of my booking?',
          answer: 'Yes! After successful payment, you\'ll receive an email confirmation with your ticket details, event information, and a unique booking reference number.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Profile',
      questions: [
        {
          id: 'create-account',
          question: 'Do I need an account to book events?',
          answer: 'Yes, you need to create a free EventCart account to book events. This allows us to send you confirmations, manage your bookings, and provide personalized recommendations.'
        },
        {
          id: 'forgot-password',
          question: 'I forgot my password. How can I reset it?',
          answer: 'Click on "Forgot Password" on the login page, enter your email address, and we\'ll send you a secure link to reset your password.'
        },
        {
          id: 'update-profile',
          question: 'How do I update my profile information?',
          answer: 'Log in to your account and go to "Profile" to update your personal information, contact details, and preferences.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
            <p className="mt-4 text-lg text-gray-600">
              Find answers to common questions about using EventCart for events and bookings.
            </p>
          </div>

          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Can't find what you're looking for?</h3>
              <p className="text-blue-700 mb-4">
                Our support team is here to help! Contact us directly and we'll get back to you within 24 hours.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> support@eventcart.com</p>
                <p><strong>Phone:</strong> (555) 123-4567</p>
                <p><strong>Live Chat:</strong> Available 9 AM - 6 PM EST</p>
              </div>
            </div>
          </div>

          {faqData.map((section) => (
            <div key={section.id} className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.title}</h2>
              <div className="space-y-4">
                {section.questions.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSection(faq.id)}
                      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      {openSections[faq.id] ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    {openSections[faq.id] && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Still have questions?</h3>
              <p className="text-gray-600 mb-6">
                We're always happy to help! Check out our other resources or get in touch.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Contact Support
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage; 