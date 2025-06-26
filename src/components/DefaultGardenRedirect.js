/**
 * DefaultGardenRedirect Component
 * Handles auto-redirect from home page to default garden
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateGardenId } from '../utils/gardenId.js';

/**
 * Get or create default garden ID
 */
const getDefaultGardenId = () => {
  try {
    // First check if we have a saved default garden
    const defaultGardenId = localStorage.getItem('defaultGardenId');
    if (defaultGardenId) {
      return defaultGardenId;
    }

    // Check if we have any owned gardens
    const myGardens = JSON.parse(localStorage.getItem('myGardens') || '[]');
    if (myGardens.length > 0) {
      // Use the first owned garden as default
      const firstGarden = myGardens[0];
      localStorage.setItem('defaultGardenId', firstGarden);
      return firstGarden;
    }

    // No existing gardens - create new one
    const newGardenId = generateGardenId();
    
    // Mark as owned and default
    localStorage.setItem('defaultGardenId', newGardenId);
    localStorage.setItem('myGardens', JSON.stringify([newGardenId]));
    
    return newGardenId;
  } catch (error) {
    console.error('Error getting default garden ID:', error);
    // Fallback - generate new ID
    return generateGardenId();
  }
};

/**
 * Component that handles first-time users and garden creation
 */
const DefaultGardenRedirect = () => {
  const navigate = useNavigate();

  // Check if user has existing gardens
  const hasExistingGardens = () => {
    try {
      const myGardens = JSON.parse(localStorage.getItem('myGardens') || '[]');
      return myGardens.length > 0;
    } catch {
      return false;
    }
  };

  // Auto-redirect if user has existing gardens
  useEffect(() => {
    if (hasExistingGardens()) {
      const defaultGardenId = getDefaultGardenId();
      navigate(`/garden/${defaultGardenId}/dashboard`, { replace: true });
    }
  }, [navigate]);

  // If user has existing gardens, show loading
  if (hasExistingGardens()) {
    return (
      <div className="default-garden-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <h2>🌱 Loading Your Garden...</h2>
        <p>Setting up your personalized garden dashboard</p>
      </div>
    );
  }

  // Show welcome screen for new users
  const handleCreateGarden = () => {
    const newGardenId = generateGardenId();
    
    // Mark as owned and default
    localStorage.setItem('defaultGardenId', newGardenId);
    localStorage.setItem('myGardens', JSON.stringify([newGardenId]));
    
    navigate(`/garden/${newGardenId}/dashboard`, { replace: true });
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-header">
          <h1>🌱 Welcome to Durham Garden Planner</h1>
          <p className="welcome-subtitle">
            Plan your heat-adapted garden with AI-powered climate modeling and real weather data
          </p>
        </div>

        <div className="welcome-features">
          <div className="feature-grid">
            <div className="feature-item">
              <div className="feature-icon">🌤️</div>
              <h3>Real Weather Data</h3>
              <p>Live forecasts from National Weather Service with garden-specific alerts</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <h3>Monte Carlo Simulation</h3>
              <p>5,000-iteration simulations to optimize your garden strategy</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔥</div>
              <h3>Heat-Adapted Planning</h3>
              <p>Specialized for Durham's Zone 7 climate with extended heat periods</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🛒</div>
              <h3>Smart Shopping Lists</h3>
              <p>Timed recommendations for seeds, supplies, and garden tasks</p>
            </div>
          </div>
        </div>

        <div className="welcome-actions">
          <button 
            className="create-garden-btn primary"
            onClick={handleCreateGarden}
          >
            🌱 Start Your Garden Plan
          </button>
          <p className="welcome-note">
            Your garden data is stored locally and can be shared with others
          </p>
        </div>

        <div className="welcome-location">
          <div className="location-info">
            <strong>🌍 Optimized for Durham, NC (Zone 7)</strong>
            <p>Hardiness zone 7b • Average rainfall 46" • 95+ heat days annually</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultGardenRedirect;