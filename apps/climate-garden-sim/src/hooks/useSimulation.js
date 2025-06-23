/**
 * Custom hook for managing simulation state and operations
 * Handles Monte Carlo simulation, debouncing, and result management
 */

import { useState, useEffect, useCallback } from 'react';
import { runCompleteSimulation } from '../services/simulationEngine.js';
import { getPortfolioStrategies } from '../data/portfolioStrategies.js';

export const useSimulation = (
  selectedSummer,
  selectedWinter, 
  selectedPortfolio,
  locationConfig,
  customPortfolio,
  customInvestment
) => {
  const [simulationResults, setSimulationResults] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [simulationDebounceTimer, setSimulationDebounceTimer] = useState(null);

  // Calculate total investment from custom inputs
  const calculateTotalInvestment = useCallback(() => {
    if (!customInvestment) return 400; // Default budget
    return Object.values(customInvestment).reduce((total, amount) => total + amount, 0);
  }, [customInvestment]);

  // Main simulation runner
  const runSimulation = useCallback(async () => {
    console.log('Running Monte Carlo simulation...', { selectedSummer, selectedWinter, selectedPortfolio });
    setSimulating(true);
    
    try {
      const portfolio = getPortfolioStrategies(locationConfig, customPortfolio)[selectedPortfolio];
      const baseInvestment = calculateTotalInvestment();
      const portfolioMultiplier = selectedPortfolio === 'conservative' ? 0.85 : 
                                 selectedPortfolio === 'aggressive' ? 1.15 : 1.0;

      const config = {
        portfolio,
        baseInvestment,
        selectedSummer,
        selectedWinter,
        locationConfig,
        portfolioMultiplier
      };

      const results = await runCompleteSimulation(config, 1000);
      
      console.log('Monte Carlo results:', results);
      setSimulationResults(results);
    } catch (error) {
      console.error('Simulation error:', error);
      setSimulationResults(null);
    } finally {
      setSimulating(false);
    }
  }, [
    selectedSummer, 
    selectedWinter, 
    selectedPortfolio, 
    locationConfig, 
    customPortfolio,
    customInvestment,
    calculateTotalInvestment
  ]);

  // Auto-run simulation when key selections change (immediate)
  useEffect(() => {
    if (selectedSummer && selectedWinter && selectedPortfolio && locationConfig) {
      runSimulation().catch(console.error);
    }
  }, [selectedSummer, selectedWinter, selectedPortfolio, runSimulation]);

  // Auto-run simulation when investment changes (debounced for sliders)
  useEffect(() => {
    if (simulationDebounceTimer) {
      clearTimeout(simulationDebounceTimer);
    }
    
    const timer = setTimeout(() => {
      if (selectedSummer && selectedWinter && selectedPortfolio && locationConfig) {
        runSimulation().catch(console.error);
      }
    }, 100);
    
    setSimulationDebounceTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [customInvestment, runSimulation]);

  // Manual trigger for simulation
  const triggerSimulation = useCallback(() => {
    runSimulation().catch(console.error);
  }, [runSimulation]);

  return {
    simulationResults,
    simulating,
    triggerSimulation,
    totalInvestment: calculateTotalInvestment()
  };
};