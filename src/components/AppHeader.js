/**
 * AppHeader Component
 * Unified header for both standard app and garden-specific contexts
 */

import React from 'react';

function AppHeader({ 
  gardenId = null,
  isReadOnly = false,
  isSyncing = false,
  lastSyncTime = null,
  shareableUrl = null,
  onForkGarden = null,
  onShareGarden = null
}) {
  const isGardenContext = !!gardenId;

  const handleShareClick = () => {
    if (shareableUrl && navigator.clipboard) {
      navigator.clipboard.writeText(shareableUrl);
      // Could add toast notification here
    }
    if (onShareGarden) {
      onShareGarden();
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-main">
          <h1 className="app-title">🌱 GardenSim</h1>
          <p className="app-subtitle">
            {isGardenContext ? (
              isReadOnly ? (
                <>Viewing Garden: {gardenId?.slice(0, 8)}... (Read-Only)</>
              ) : (
                <>Your Garden: {gardenId?.slice(0, 8)}...</>
              )
            ) : (
              'Climate-aware garden planning for your location'
            )}
          </p>
        </div>
        
        {/* Garden actions - only show in garden context */}
        {isGardenContext && (
          <div className="garden-actions">
            {/* Sync status */}
            {(isSyncing || lastSyncTime) && (
              <div className={`sync-status ${isSyncing ? 'syncing' : 'synced'}`}>
                {isSyncing ? (
                  <span className="sync-indicator">
                    <div className="sync-spinner"></div>
                    Syncing...
                  </span>
                ) : (
                  <span className="sync-indicator">
                    ✓ {new Date(lastSyncTime).toLocaleTimeString()}
                  </span>
                )}
              </div>
            )}
            
            {/* New Garden button for owned gardens */}
            {!isReadOnly && onForkGarden && (
              <button 
                className="new-garden-btn"
                onClick={onForkGarden}
                title="Create a new garden"
              >
                ➕ New Garden
              </button>
            )}
            
            {/* Fork button for read-only gardens */}
            {isReadOnly && onForkGarden && (
              <button 
                className="fork-garden-btn"
                onClick={onForkGarden}
                title="Create your own copy of this garden"
              >
                🍴 Fork Garden
              </button>
            )}
            
            {/* Share button for owned gardens */}
            {!isReadOnly && shareableUrl && (
              <button 
                className="share-garden-btn"
                onClick={handleShareClick}
                title="Copy sharing link"
              >
                📋 Share
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default AppHeader;