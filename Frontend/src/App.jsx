import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import RegistrationSuccessPage from './pages/RegistrationSuccessPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import FAQPage from './pages/FAQPage';
import NotFoundPage from './pages/NotFoundPage';
import ErrorPage from './pages/ErrorPage';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminOrders from './pages/AdminOrders';
import AdminEvents from './pages/AdminEvents';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminSettings from './pages/AdminSettings';
import ProtectedRoute from './components/ProtectedRoute';

// Error boundary component to catch errors in child components
const ErrorBoundary = ({ children }) => {
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Reset error when location changes
    setError(null);
  }, [location]);

  const handleError = (error, errorInfo) => {
    console.error("Error caught by error boundary:", error, errorInfo);
    setError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
    });
  };

  if (error) {
    return (
      <ErrorPage
        error={{
          status: 500,
          title: "Something went wrong",
          message: "An unexpected error occurred. Please try again later.",
          ...error
        }}
      />
    );
  }

  return children;
};

// Wrapper component to handle errors in routes
const RouteWithErrorHandling = ({ element, ...rest }) => {
  const location = useLocation();
  
  return (
    <ErrorBoundary key={location.pathname}>
      {element}
    </ErrorBoundary>
  );
};

// Inner component to access useLocation
const AppContent = () => {
  const location = useLocation();
  const isAdminPage = location?.pathname?.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminPage && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RouteWithErrorHandling element={<HomePage />} />} />
          <Route path="/events" element={<RouteWithErrorHandling element={<EventsPage />} />} />
          <Route path="/events/category/:category" element={<RouteWithErrorHandling element={<EventsPage />} />} />
          <Route path="/events/:eventId" element={<RouteWithErrorHandling element={<EventDetailPage />} />} />
          <Route path="/about" element={<RouteWithErrorHandling element={<AboutPage />} />} />
          <Route path="/contact" element={<RouteWithErrorHandling element={<ContactPage />} />} />
          <Route path="/login" element={<RouteWithErrorHandling element={<LoginPage />} />} />
          <Route path="/register" element={<RouteWithErrorHandling element={<RegisterPage />} />} />
          <Route path="/registration-success" element={<RouteWithErrorHandling element={<RegistrationSuccessPage />} />} />
          <Route path="/verify-email" element={<RouteWithErrorHandling element={<EmailVerificationPage />} />} />
          <Route path="/forgot-password" element={<RouteWithErrorHandling element={<ForgotPasswordPage />} />} />
          <Route path="/reset-password/:token" element={<RouteWithErrorHandling element={<ResetPasswordPage />} />} />
          <Route path="/terms-of-service" element={<RouteWithErrorHandling element={<TermsOfServicePage />} />} />
          <Route path="/privacy-policy" element={<RouteWithErrorHandling element={<PrivacyPolicyPage />} />} />
          <Route path="/faq" element={<RouteWithErrorHandling element={<FAQPage />} />} />
          
          {/* Protected Routes */}
          <Route path="/cart" element={
            <RouteWithErrorHandling element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            } />
          } />
          <Route path="/checkout" element={
            <RouteWithErrorHandling element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } />
          } />
          <Route path="/order-success" element={
            <RouteWithErrorHandling element={
              <ProtectedRoute>
                <OrderSuccessPage />
              </ProtectedRoute>
            } />
          } />
          <Route path="/dashboard" element={
            <RouteWithErrorHandling element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
          } />
          <Route path="/profile" element={
            <RouteWithErrorHandling element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <RouteWithErrorHandling element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          } />
          <Route path="/admin/users" element={
            <RouteWithErrorHandling element={
              <ProtectedRoute adminOnly={true}>
                <AdminUsers />
              </ProtectedRoute>
            } />
          } />
          <Route path="/admin/orders" element={
            <RouteWithErrorHandling element={
              <ProtectedRoute adminOnly={true}>
                <AdminOrders />
              </ProtectedRoute>
            } />
          } />
          <Route path="/admin/events" element={
            <RouteWithErrorHandling element={
              <ProtectedRoute adminOnly={true}>
                <AdminEvents />
              </ProtectedRoute>
            } />
          } />
          <Route path="/admin/analytics" element={
            <RouteWithErrorHandling element={
              <ProtectedRoute adminOnly={true}>
                <AdminAnalytics />
              </ProtectedRoute>
            } />
          } />
          <Route path="/admin/settings" element={
            <RouteWithErrorHandling element={
              <ProtectedRoute adminOnly={true}>
                <AdminSettings />
              </ProtectedRoute>
            } />
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<RouteWithErrorHandling element={<NotFoundPage />} />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
