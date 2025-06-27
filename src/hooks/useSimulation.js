/**
 * Custom hook for managing simulation state and operations
 * Handles Monte Carlo simulation, debouncing, and result management
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { runCompleteSimulation } from '../services/simulationEngine.js';
import { getPortfolioStrategies } from '../data/portfolioStrategies.js';
import { useWeatherData } from './useWeatherData.js';

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

  // Integrate real weather data for enhanced simulation accuracy
  const { 
    current: currentWeather, 
    forecast: weatherForecast, 
    gddData, 
    hasWeatherData,
    loading: weatherLoading 
  } = useWeatherData(locationConfig, {
    enableForecast: true,
    enableGDD: true,
    autoRefresh: true
  });

  // Stable total investment calculation
  const totalInvestment = useMemo(() => {
    if (!customInvestment) return 400;
    return Object.values(customInvestment).reduce((total, amount) => {
      const numericAmount = parseFloat(amount) || 0;
      return total + numericAmount;
    }, 0);
  }, [customInvestment]);

  // Create stable simulation parameters including weather data freshness
  const simulationKey = useMemo(() => {
    return JSON.stringify({
      selectedSummer,
      selectedWinter,
      selectedPortfolio,
      totalInvestment,
      customPortfolio: customPortfolio ? JSON.stringify(customPortfolio) : null,
      hasWeatherData,
      // Include weather timestamp to refresh simulation when weather data updates
      weatherTimestamp: hasWeatherData && currentWeather ? 
        Math.floor(Date.now() / (30 * 60 * 1000)) : null // Round to 30-minute intervals
    });
  }, [selectedSummer, selectedWinter, selectedPortfolio, totalInvestment, customPortfolio, hasWeatherData, currentWeather]);

  // Main simulation runner
  const runSimulation = useCallback(async () => {
    // Prevent duplicate simulations
    if (lastSimulationParams.current === simulationKey || simulating) {
      return;
    }

    console.log('Running Monte Carlo simulation...', { 
      selectedSummer, 
      selectedWinter, 
      selectedPortfolio,
      weatherEnhanced: hasWeatherData ? 'Yes' : 'No',
      forecastDays: weatherForecast?.length || 0
    });
    lastSimulationParams.current = simulationKey;
    setSimulating(true);
    
    try {
      const portfolio = getPortfolioStrategies(locationConfig, customPortfolio)[selectedPortfolio];
      const portfolioMultiplier = selectedPortfolio === 'conservative' ? 0.85 : 
                                 selectedPortfolio === 'aggressive' ? 1.15 : 1.0;

      // Prepare weather data for simulation if available
      const weatherData = hasWeatherData ? {
        current: currentWeather,
        forecast: weatherForecast,
        gddData: gddData,
        timestamp: new Date()
      } : null;

      const config = {
        portfolio,
        baseInvestment: totalInvestment,
        selectedSummer,
        selectedWinter,
        locationConfig,
        portfolioMultiplier,
        weatherData
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
  }, [simulationKey, selectedSummer, selectedWinter, selectedPortfolio, locationConfig, customPortfolio, totalInvestment, simulating, hasWeatherData, currentWeather, weatherForecast, gddData]);

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
    totalInvestment,
    // Weather integration status
    weatherEnhanced: hasWeatherData,
    weatherLoading,
    forecastAvailable: weatherForecast?.length > 0
  };
};