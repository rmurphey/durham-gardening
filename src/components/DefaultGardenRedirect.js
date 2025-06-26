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
 * Component that redirects to default garden
 */
const DefaultGardenRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const defaultGardenId = getDefaultGardenId();
    navigate(`/garden/${defaultGardenId}/dashboard`, { replace: true });
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