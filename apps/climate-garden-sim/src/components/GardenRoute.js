/**
 * GardenRoute Component
 * Handles garden-specific dashboard with cloud sync functionality
 */

import React from 'react';
import DashboardView from './DashboardView.js';
import useCloudSync from '../hooks/useCloudSync.js';

/**
 * Component that provides garden-specific dashboard with cloud sync
 */
const GardenRoute = () => {
  const {
    gardenId,
    gardenData,
    isLoading,
    error,
    isSyncing,
    lastSyncTime,
    shareableUrl,
    saveGardenData,
    clearError
  } = useCloudSync();

  // Loading state
  if (isLoading) {
    return (
      <div className="garden-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <h2>Loading Garden...</h2>
        <p>Initializing your garden data for ID: {gardenId}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="garden-error">
        <div className="error-content">
          <h2>🌱 Garden Error</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button 
              className="error-retry-btn"
              onClick={() => {
                clearError();
                window.location.reload();
              }}
            >
              Try Again
            </button>
            <button 
              className="error-home-btn"
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="garden-route">
      {/* Sync Status Banner */}
      {(isSyncing || lastSyncTime) && (
        <div className={`sync-status ${isSyncing ? 'syncing' : 'synced'}`}>
          {isSyncing ? (
            <span className="sync-indicator">
              <div className="sync-spinner"></div>
              Syncing garden data...
            </span>
          ) : (
            <span className="sync-indicator">
              ✓ Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
            </span>
          )}
          
          {shareableUrl && (
            <button 
              className="share-garden-btn"
              onClick={() => {
                navigator.clipboard?.writeText(shareableUrl);
                // Could add a toast notification here
              }}
              title="Copy garden sharing link"
            >
              📋 Share Garden
            </button>
          )}
        </div>
      )}

      {/* Garden-specific Dashboard */}
      <div className="garden-dashboard">
        <div className="garden-header">
          <h2>🌱 Garden: {gardenId?.slice(0, 8)}...</h2>
          <p>Cloud-synced garden planning</p>
        </div>
        
        <DashboardView 
          gardenId={gardenId}
          gardenData={gardenData}
          onGardenDataChange={saveGardenData}
          // For now, use default props - we'll integrate with cloud data later
          shoppingActions={{ totalItems: 0 }}
          monthlyFocus={null}
          simulationResults={null}
          totalInvestment={0}
          onViewChange={() => {}} // Navigation handled differently for garden routes
          gardenCalendar={[]}
        />
      </div>
    </div>
  );
};

export default GardenRoute;