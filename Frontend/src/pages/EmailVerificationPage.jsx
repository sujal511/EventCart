import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/auth/verify-email', {
        token: verificationToken
      });

      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message);
        
        // Store auth data
        if (response.data.access_token && response.data.user) {
          localStorage.setItem('token', response.data.access_token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      
      if (error.response?.data?.error) {
        const errorMsg = error.response.data.error;
        setMessage(errorMsg);
        
        if (errorMsg.includes('expired')) {
          setStatus('expired');
        } else {
          setStatus('error');
        }
      } else {
        setStatus('error');
        setMessage('Email verification failed. Please try again.');
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      alert('Please enter your email address');
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

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center">
            <ClockIcon className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying Your Email</h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verified Successfully!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Redirecting to dashboard in 3 seconds...</p>
              <Link 
                to="/dashboard" 
                className="btn btn-primary"
              >
                Go to Dashboard Now
              </Link>
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Link Expired</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your email to resend verification
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full btn btn-primary disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </button>
                
                <Link 
                  to="/register" 
                  className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Register Again
                </Link>
              </div>
            </div>
          </div>
        );

      case 'error':
      default:
        return (
          <div className="text-center">
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="space-y-3">
              <Link 
                to="/login" 
                className="btn btn-primary"
              >
                Go to Login
              </Link>
              
              <Link 
                to="/register" 
                className="block text-center py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Register Again
              </Link>
            </div>
          </div>
        );
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
          <p className="text-gray-600 mt-2">Email Verification</p>
        </div>

        {/* Main Content */}
        <div className="bg-white py-10 px-8 shadow-xl rounded-xl border border-gray-100">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Need help? <Link to="/contact" className="text-primary hover:text-primary/80">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage; 