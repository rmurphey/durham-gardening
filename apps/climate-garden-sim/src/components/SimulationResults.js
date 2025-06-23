/**
 * SimulationResults Component
 * Displays Monte Carlo simulation results with charts and metrics
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatPercentage } from '../config.js';

const SimulationResults = ({
  simulationResults,
  simulating,
  totalInvestment
}) => {
  if (!simulationResults) {
    return null;
  }

  return (
    <section className="results-section">
      <h2>Simulation Results</h2>
      
      {simulating && (
        <div className="simulation-spinner">
          <div className="spinner"></div>
          <span>Running Monte Carlo simulation...</span>
        </div>
      )}

      <div className="results-grid">
        {/* Key Metrics */}
        <div className="metric-card">
          <h3>Expected Net Return</h3>
          <div className="metric-value">${simulationResults.mean?.toFixed(0) || '0'}</div>
          <div className="metric-range">
            Range: ${simulationResults.percentiles?.p10?.toFixed(0) || '0'} - ${simulationResults.percentiles?.p90?.toFixed(0) || '0'}
          </div>
        </div>

        <div className="metric-card">
          <h3>Success Rate</h3>
          <div className="metric-value">{formatPercentage(simulationResults.successRate / 100)}</div>
          <div className="metric-desc">Probability of positive return</div>
        </div>

        <div className="metric-card">
          <h3>ROI</h3>
          <div className="metric-value">{simulationResults.roi?.mean?.toFixed(1) || '0'}%</div>
          <div className="metric-range">
            Median: {simulationResults.roi?.median?.toFixed(1) || '0'}%
          </div>
        </div>

        <div className="metric-card">
          <h3>Total Investment</h3>
          <div className="metric-value">${totalInvestment}</div>
          <div className="metric-desc">Annual budget allocation</div>
        </div>
      </div>

      {/* Return Distribution Chart */}
      {simulationResults.returnHistogram && (
        <div className="chart-section">
          <h3>Return Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={simulationResults.returnHistogram}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" tickFormatter={(value) => `$${value.toFixed(0)}`} />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`${value} outcomes`, 'Count']}
                labelFormatter={(value) => `Net Return: $${value.toFixed(0)}`}
              />
              <Bar dataKey="value" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
          <p className="chart-description">Distribution of potential net returns from 1,000 simulations</p>
        </div>
      )}
    </section>
  );
};

export default SimulationResults;