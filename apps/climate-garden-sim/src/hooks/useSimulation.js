/**
 * Custom hook for managing simulation state and operations
 * Handles Monte Carlo simulation, debouncing, and result management
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const debounceTimer = useRef(null);
  const lastSimulationParams = useRef(null);

  // Stable total investment calculation
  const totalInvestment = useMemo(() => {
    if (!customInvestment) return 400;
    return Object.values(customInvestment).reduce((total, amount) => {
      const numericAmount = parseFloat(amount) || 0;
      return total + numericAmount;
    }, 0);
  }, [customInvestment]);

  // Create stable simulation parameters
  const simulationKey = useMemo(() => {
    return JSON.stringify({
      selectedSummer,
      selectedWinter,
      selectedPortfolio,
      totalInvestment,
      customPortfolio: customPortfolio ? JSON.stringify(customPortfolio) : null
    });
  }, [selectedSummer, selectedWinter, selectedPortfolio, totalInvestment, customPortfolio]);

  // Main simulation runner
  const runSimulation = useCallback(async () => {
    // Prevent duplicate simulations
    if (lastSimulationParams.current === simulationKey || simulating) {
      return;
    }

    console.log('Running Monte Carlo simulation...', { selectedSummer, selectedWinter, selectedPortfolio });
    lastSimulationParams.current = simulationKey;
    setSimulating(true);
    
    try {
      const portfolio = getPortfolioStrategies(locationConfig, customPortfolio)[selectedPortfolio];
      const portfolioMultiplier = selectedPortfolio === 'conservative' ? 0.85 : 
                                 selectedPortfolio === 'aggressive' ? 1.15 : 1.0;

      const config = {
        portfolio,
        baseInvestment: totalInvestment,
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
      lastSimulationParams.current = null; // Allow retry on error
    } finally {
      setSimulating(false);
    }
  }, [simulationKey, selectedSummer, selectedWinter, selectedPortfolio, locationConfig, customPortfolio, totalInvestment, simulating]);

  // Single effect to handle all simulation triggers with debouncing
  useEffect(() => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Only run if we have required parameters
    if (!selectedSummer || !selectedWinter || !selectedPortfolio || !locationConfig) {
      return;
    }

    // Skip if already simulated with same parameters
    if (lastSimulationParams.current === simulationKey) {
      return;
    }

    // Debounce simulation execution
    debounceTimer.current = setTimeout(() => {
      runSimulation().catch(console.error);
    }, 300); // Increased debounce time

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [simulationKey, selectedSummer, selectedWinter, selectedPortfolio, locationConfig, runSimulation]);

  // Manual trigger for simulation
  const triggerSimulation = useCallback(() => {
    lastSimulationParams.current = null; // Force re-run
    runSimulation().catch(console.error);
  }, [runSimulation]);

  return {
    simulationResults,
    simulating,
    triggerSimulation,
    totalInvestment
  };
};