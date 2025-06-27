/**
 * AddPlantingForm Component
 * Simple inline form for adding plantings to the garden log
 */

import React, { useState, useEffect } from 'react';
import { cropDataService } from '../services/cropDataService.js';

function AddPlantingForm({ cropKey = '', onAddPlanting, onCancel }) {
  const [formData, setFormData] = useState({
    crop: cropKey,
    variety: '',
    plantedDate: '',
    quantity: '',
    location: '',
    notes: '',
    status: 'planned'
  });

  const [errors, setErrors] = useState([]);
  const [allCrops, setAllCrops] = useState([]);
  const [isLoadingCrops, setIsLoadingCrops] = useState(true);

  // Load crops from database on component mount
  useEffect(() => {
    const loadCrops = async () => {
      try {
        setIsLoadingCrops(true);
        const cropDatabase = await cropDataService.getCropDatabase();
        
        const crops = Object.entries(cropDatabase).flatMap(([category, crops]) =>
          Object.entries(crops).map(([key, crop]) => ({
            key,
            name: crop.name?.en || key,
            category
          }))
        );
        
        setAllCrops(crops);
      } catch (error) {
        console.error('Failed to load crops:', error);
        setErrors(['Failed to load crop database']);
      } finally {
        setIsLoadingCrops(false);
      }
    };

    loadCrops();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.crop) {
      newErrors.push('Please select a crop');
    }
    
    if (formData.status !== 'planned' && !formData.plantedDate) {
      newErrors.push('Please enter the planted date');
    }
    
    if (formData.plantedDate) {
      const plantedDate = new Date(formData.plantedDate);
      const today = new Date();
      if (plantedDate > today) {
        newErrors.push('Planted date cannot be in the future');
      }
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Create planting data object
    const plantingData = {
      crop: formData.crop,
      variety: formData.variety || null,
      plantedDate: formData.plantedDate || null,
      quantity: formData.quantity || null,
      location: formData.location || null,
      notes: formData.notes || null,
      status: formData.status
    };

    onAddPlanting(plantingData);
    
    // Reset form
    setFormData({
      crop: '',
      variety: '',
      plantedDate: '',
      quantity: '',
      location: '',
      notes: '',
      status: 'planned'
    });
  };

  return (
    <div className="add-planting-form">
      <h3>Add to Garden Log</h3>
      
      {errors.length > 0 && (
        <div className="form-errors">
          {errors.map((error, index) => (
            <div key={index} className="error-message">{error}</div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="crop">Crop *</label>
          <select
            id="crop"
            value={formData.crop}
            onChange={(e) => handleInputChange('crop', e.target.value)}
            required
            disabled={isLoadingCrops}
          >
            <option value="">
              {isLoadingCrops ? 'Loading crops...' : 'Select a crop...'}
            </option>
            {allCrops.map(crop => (
              <option key={crop.key} value={crop.key}>
                {crop.name} ({crop.category})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="variety">Variety</label>
          <input
            id="variety"
            type="text"
            value={formData.variety}
            onChange={(e) => handleInputChange('variety', e.target.value)}
            placeholder="e.g., Winterbor, Cherokee Purple"
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
          >
            <option value="planned">Planned</option>
            <option value="planted">Planted</option>
            <option value="germinated">Germinated</option>
            <option value="growing">Growing</option>
            <option value="ready">Ready to Harvest</option>
          </select>
        </div>

        {formData.status !== 'planned' && (
          <div className="form-group">
            <label htmlFor="plantedDate">Planted Date *</label>
            <input
              id="plantedDate"
              type="date"
              value={formData.plantedDate}
              onChange={(e) => handleInputChange('plantedDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="quantity">Quantity</label>
          <input
            id="quantity"
            type="text"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', e.target.value)}
            placeholder="e.g., 12 plants, 1 row, 4x4 patch"
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="e.g., Bed A, Container 3, Front yard"
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Any additional notes about this planting..."
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Add to Garden
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddPlantingForm;