import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

// Ensure we're not redirecting to API routes
const currentPath = window.location.pathname;
if (currentPath !== '/' && 
    !currentPath.startsWith('/api/') && 
    !currentPath.includes('.') &&
    document.getElementById('root')) {
  
  console.log('Handling client-side route:', currentPath);
  
  // Force React Router to handle this route
  const baseUrl = window.location.origin;
  window.history.replaceState(
    { path: currentPath },
    document.title,
    baseUrl + currentPath
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
