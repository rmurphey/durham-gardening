/**
 * DefaultGardenRedirect Component
 * Handles auto-redirect from home page to default garden
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateGardenId } from '../utils/gardenId.js';


/**
 * Component that handles first-time users and garden creation
 */
const DefaultGardenRedirect = () => {
  const navigate = useNavigate();

  // Check if user has existing gardens and redirect appropriately
  useEffect(() => {
    try {
      const myGardens = JSON.parse(localStorage.getItem('myGardens') || '[]');
      
      if (myGardens.length > 0) {
        // User has gardens - redirect to their default garden
        const defaultGardenId = localStorage.getItem('defaultGardenId') || myGardens[0];
        navigate(`/garden/${defaultGardenId}/dashboard`, { replace: true });
      } else {
        // No existing gardens - create new one and redirect
        const newGardenId = generateGardenId();
        
        // Mark as owned and default
        localStorage.setItem('defaultGardenId', newGardenId);
        localStorage.setItem('myGardens', JSON.stringify([newGardenId]));
        
        navigate(`/garden/${newGardenId}/dashboard`, { replace: true });
      }
    } catch (error) {
      console.error('Error handling garden redirect:', error);
      // Fallback to standard dashboard
      navigate('/dashboard', { replace: true });
    }
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