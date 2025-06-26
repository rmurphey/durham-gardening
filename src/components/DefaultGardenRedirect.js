/**
 * DefaultGardenRedirect Component
 * Handles auto-redirect from home page to default garden
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


/**
 * Component that handles first-time users and garden creation
 */
const DefaultGardenRedirect = () => {
  const navigate = useNavigate();

  // Auto-redirect to standard dashboard
  useEffect(() => {
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  // Show loading while redirecting
  return (
    <div className="default-garden-loading">
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
      <h2>🌱 Loading Your Garden...</h2>
      <p>Setting up your personalized garden dashboard</p>
    </div>
  );
};

export default DefaultGardenRedirect;