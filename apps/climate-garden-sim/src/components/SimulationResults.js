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
    <section className="card results-section">
      <div className="card-header">
        <h2 className="card-title">Simulation Results</h2>
      </div>
      
      {simulating && (
        <div className="loading">
          <span>Running Monte Carlo simulation...</span>
        </div>
      )}

      <div className="results-grid">
        {/* Key Metrics */}
        <div className="result-card">
          <div className="result-value">${isFinite(simulationResults.mean) ? simulationResults.mean.toFixed(0) : '0'}</div>
          <div className="result-label">Expected Net Return</div>
          <div className="result-confidence">
            Range: ${isFinite(simulationResults.percentiles?.p10) ? simulationResults.percentiles.p10.toFixed(0) : '0'} - ${isFinite(simulationResults.percentiles?.p90) ? simulationResults.percentiles.p90.toFixed(0) : '0'}
          </div>
        </div>

        <div className="result-card">
          <div className="result-value">{isFinite(simulationResults.successRate) ? formatPercentage(simulationResults.successRate / 100) : '0%'}</div>
          <div className="result-label">Success Rate</div>
          <div className="result-confidence">Probability of positive return</div>
        </div>

        <div className="result-card">
          <div className="result-value">{isFinite(simulationResults.roi?.mean) ? simulationResults.roi.mean.toFixed(1) : '0'}%</div>
          <div className="result-label">ROI</div>
          <div className="result-confidence">
            Median: {isFinite(simulationResults.roi?.median) ? simulationResults.roi.median.toFixed(1) : '0'}%
          </div>
        </div>

        <div className="result-card">
          <div className="result-value">${isFinite(totalInvestment) ? totalInvestment : '0'}</div>
          <div className="result-label">Total Investment</div>
          <div className="result-confidence">Annual budget allocation</div>
        </div>
      </div>

      {/* Return Distribution Chart */}
      {simulationResults.returnHistogram && (
        <div className="mt-xl">
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
              <Bar dataKey="value" fill="var(--color-primary)" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-tertiary text-center mt-md">Distribution of potential net returns from 1,000 simulations</p>
        </div>
      )}
    </section>
  );
};

export default SimulationResults;