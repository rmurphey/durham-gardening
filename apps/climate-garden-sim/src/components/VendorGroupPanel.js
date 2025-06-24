/**
 * Vendor Group Panel Component
 * Groups items by vendor for bulk ordering and shipping optimization
 */

import React, { useState } from 'react';

const VendorGroupPanel = ({ 
  vendor = { name: '', items: [], totalCost: 0, shippingThreshold: 50, notes: '' }, 
  onAddToShoppingList = () => {}, 
  onMarkAsOwned = () => {}, 
  getItemStatus = () => 'unknown' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddAllToShoppingList = () => {
    vendor.items.forEach(item => {
      if (getItemStatus(item.id) !== 'shopping' && getItemStatus(item.id) !== 'owned') {
        onAddToShoppingList({
          id: item.id,
          item: item.item || item.crop,
          price: item.totalCost || item.cost,
          category: item.category,
          quantity: item.packetsNeeded || 1,
          notes: item.notes || item.description,
          vendor: vendor.name
        });
      }
    });
  };

  const handleAddToShoppingList = (item) => {
    onAddToShoppingList({
      id: item.id,
      item: item.item || item.crop,
      price: item.totalCost || item.cost,
      category: item.category,
      quantity: item.packetsNeeded || 1,
      notes: item.notes || item.description,
      vendor: vendor.name
    });
  };

  const handleMarkAsOwned = (item) => {
    onMarkAsOwned(item.id);
  };

  const getShippingStatus = () => {
    if (vendor.totalCost >= vendor.shippingThreshold) {
      return {
        status: 'free',
        message: `✅ Free shipping (over $${vendor.shippingThreshold})`
      };
    } else {
      const needed = vendor.shippingThreshold - vendor.totalCost;
      return {
        status: 'paid',
        message: `📦 Add $${needed.toFixed(2)} for free shipping`
      };
    }
  };

  const shippingInfo = getShippingStatus();

  return (
    <div className="vendor-group-panel card">
      <div className="card-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="vendor-info">
          <h4 className="vendor-name">{vendor.name}</h4>
          <div className="vendor-notes">{vendor.notes}</div>
        </div>
        <div className="vendor-stats">
          <div className="vendor-cost">${vendor.totalCost.toFixed(2)}</div>
          <div className="vendor-count">{vendor.items.length} items</div>
        </div>
        <button className="expand-button">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      <div className={`shipping-info ${shippingInfo.status}`}>
        {shippingInfo.message}
      </div>

      {isExpanded && (
        <div className="vendor-content">
          <div className="vendor-actions">
            <button 
              className="bulk-add-button"
              onClick={handleAddAllToShoppingList}
            >
              📦 Add All to Shopping List
            </button>
          </div>

          <div className="vendor-items">
            {vendor.items.map((item, index) => (
              <div key={index} className="vendor-item">
                <div className="item-main">
                  <div className="item-name">
                    {item.crop || item.item}
                    {item.variety && <span className="variety-info"> - {item.variety}</span>}
                  </div>
                  <div className="item-details">
                    <span className="category-tag">{item.category}</span>
                    {item.packetsNeeded && (
                      <span className="packet-info">{item.packetsNeeded} packets</span>
                    )}
                    <span className="cost-info">${(item.totalCost || item.cost).toFixed(2)}</span>
                  </div>
                  {(item.notes || item.description) && (
                    <div className="item-notes">{item.notes || item.description}</div>
                  )}
                </div>
                <div className="item-actions">
                  <button
                    className="action-button add-button"
                    onClick={() => handleAddToShoppingList(item)}
                    disabled={getItemStatus(item.id) === 'shopping'}
                  >
                    {getItemStatus(item.id) === 'shopping' ? '✓ Added' : '+ Add'}
                  </button>
                  <button
                    className="action-button owned-button"
                    onClick={() => handleMarkAsOwned(item)}
                    disabled={getItemStatus(item.id) === 'owned'}
                  >
                    {getItemStatus(item.id) === 'owned' ? '✓ Own' : 'Have It'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorGroupPanel;