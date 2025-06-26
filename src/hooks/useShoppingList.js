/**
 * Shopping List Hook
 * Manages shopping list state with localStorage persistence
 */

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'garden-shopping-list';

export const useShoppingList = () => {
  const [shoppingList, setShoppingList] = useState([]);
  const [rejectedItems, setRejectedItems] = useState(new Set());
  const [ownedItems, setOwnedItems] = useState(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setShoppingList(data.shoppingList || []);
        setRejectedItems(new Set(data.rejectedItems || []));
        setOwnedItems(new Set(data.ownedItems || []));
      }
    } catch (error) {
      console.error('Error loading shopping list:', error);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      const data = {
        shoppingList,
        rejectedItems: Array.from(rejectedItems),
        ownedItems: Array.from(ownedItems)
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving shopping list:', error);
    }
  }, [shoppingList, rejectedItems, ownedItems]);

  const addToShoppingList = (item) => {
    // Remove from rejected/owned if previously marked
    const newRejected = new Set(rejectedItems);
    const newOwned = new Set(ownedItems);
    newRejected.delete(item.id);
    newOwned.delete(item.id);
    setRejectedItems(newRejected);
    setOwnedItems(newOwned);

    // Add to shopping list if not already there
    setShoppingList(prevList => {
      const exists = prevList.find(listItem => listItem.id === item.id);
      if (exists) return prevList;
      
      return [...prevList, {
        id: item.id,
        item: item.item,
        price: item.price,
        category: item.category,
        urgency: item.urgency,
        plantingDate: item.plantingDate,
        daysUntilPlanting: item.daysUntilPlanting,
        plantingWindow: item.plantingWindow,
        addedAt: new Date().toISOString()
      }];
    });
  };

  const markAsOwned = (itemId) => {
    // Remove from shopping list and rejected
    setShoppingList(prevList => prevList.filter(item => item.id !== itemId));
    const newRejected = new Set(rejectedItems);
    newRejected.delete(itemId);
    setRejectedItems(newRejected);

    // Add to owned
    const newOwned = new Set(ownedItems);
    newOwned.add(itemId);
    setOwnedItems(newOwned);
  };

  const rejectItem = (itemId) => {
    // Remove from shopping list and owned
    setShoppingList(prevList => prevList.filter(item => item.id !== itemId));
    const newOwned = new Set(ownedItems);
    newOwned.delete(itemId);
    setOwnedItems(newOwned);

    // Add to rejected
    const newRejected = new Set(rejectedItems);
    newRejected.add(itemId);
    setRejectedItems(newRejected);
  };

  const removeFromShoppingList = (itemId) => {
    setShoppingList(prevList => prevList.filter(item => item.id !== itemId));
  };

  const clearShoppingList = () => {
    setShoppingList([]);
  };

  const clearAllSelections = () => {
    setShoppingList([]);
    setRejectedItems(new Set());
    setOwnedItems(new Set());
  };

  const getItemStatus = (itemId) => {
    if (ownedItems.has(itemId)) return 'owned';
    if (rejectedItems.has(itemId)) return 'rejected';
    if (shoppingList.find(item => item.id === itemId)) return 'shopping';
    return 'unselected';
  };

  const getTotalCost = () => {
    return shoppingList.reduce((sum, item) => sum + item.price, 0);
  };

  return {
    shoppingList,
    rejectedItems,
    ownedItems,
    addToShoppingList,
    markAsOwned,
    rejectItem,
    removeFromShoppingList,
    clearShoppingList,
    clearAllSelections,
    getItemStatus,
    getTotalCost,
    totalItems: shoppingList.length
  };
};