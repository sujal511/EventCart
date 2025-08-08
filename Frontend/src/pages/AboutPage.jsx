import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">About Us</h1>
          
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <p className="text-lg mb-6">
              At EventCart, we're transforming the way people shop for events by streamlining bulk purchasing directly from trusted local wholesale suppliers. No more hopping between markets or juggling endless vendor lists—we bring everything you need for your celebration under one smart, simple platform.
            </p>
            
            <p className="text-lg mb-6">
              Whether you're planning a wedding, birthday, housewarming, or community gathering, EventCart connects you to verified wholesalers offering transparent pricing, bulk deals, and reliable delivery—all in just a few clicks.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="bg-primary/10 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Trusted Suppliers</h3>
                <p className="text-gray-600">We partner only with verified wholesale suppliers to ensure quality and reliability.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Transparent Pricing</h3>
                <p className="text-gray-600">Clear pricing with no hidden fees, so you always know what you're paying.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Reliable delivery options to ensure your event supplies arrive on time.</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link to="/events" className="btn btn-primary px-8 py-3">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
