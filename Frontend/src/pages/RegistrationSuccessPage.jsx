import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const RegistrationSuccessPage = () => {
  const location = useLocation();
  const [isResending, setIsResending] = useState(false);
  
  // Get email from navigation state
  const email = location.state?.email || '';
  const message = location.state?.message || 'Registration successful! Please check your email to verify your account.';

  const handleResendVerification = async () => {
    if (!email) {
      alert('Email address not found. Please register again.');
      return;
    }

    setIsResending(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/auth/resend-verification', {
        email: email
      });

      if (response.data.success) {
        alert('Verification email sent successfully! Please check your email.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      alert(error.response?.data?.error || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-primary">
            EventCart
          </Link>
          <p className="text-gray-600 mt-2">Registration Successful</p>
        </div>

        {/* Main Content */}
        <div className="bg-white py-10 px-8 shadow-xl rounded-xl border border-gray-100">
          <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            {email && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center">
                  <EnvelopeIcon className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-blue-700 font-medium">{email}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="text-left bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">📧 What's next?</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Check your email inbox (and spam folder)</li>
                  <li>• Click the verification link in the email</li>
                  <li>• Complete your account setup</li>
                  <li>• Start booking amazing events!</li>
                </ul>
              </div>

              <div className="space-y-3">
                {email && (
                  <button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full py-2 px-4 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
                  >
                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                )}
                
                <Link 
                  to="/login" 
                  className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Didn't receive the email? Check your spam folder or{' '}
            <Link to="/contact" className="text-primary hover:text-primary/80">contact support</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccessPage; 