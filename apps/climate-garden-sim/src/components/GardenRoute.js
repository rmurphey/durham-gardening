/**
 * GardenRoute Component
 * Handles garden-specific routing and cloud data loading
 */

import React from 'react';
import AppContent from './AppContent.js';
import useCloudSync from '../hooks/useCloudSync.js';

/**
 * Component that wraps AppContent with cloud sync functionality for specific gardens
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
        <p>Initializing your garden data</p>
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
              onClick={() => window.location.href = '/'}
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

      {/* Main App Content */}
      <AppContent 
        gardenId={gardenId}
        initialGardenData={gardenData}
        onGardenDataChange={saveGardenData}
      />
    </div>
  );
};

export default GardenRoute;