/**
 * SimulationResults Component
 * Displays Monte Carlo simulation results with charts and metrics
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatPercentage, formatCurrency } from '../config.js';

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

      {/* Return Distribution Chart */}
      {simulationResults.returnHistogram && (
        <div className="mt-xl">
          <h3>Return Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={simulationResults.returnHistogram}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" tickFormatter={(value) => formatCurrency(value)} />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`${value} outcomes`, 'Count']}
                labelFormatter={(value) => `Net Return: ${formatCurrency(value)}`}
              />
              <Bar dataKey="value">
                {simulationResults.returnHistogram.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.x < 0 ? 'var(--color-error)' : 'var(--color-primary)'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color positive"></div>
              <span>Profitable outcomes</span>
            </div>
            <div className="legend-item">
              <div className="legend-color negative"></div>
              <span>Loss outcomes</span>
            </div>
          </div>
          <p className="text-tertiary text-center mt-md">Distribution of potential net returns from 1,000 simulations</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="results-grid">
        <div className={`result-card ${simulationResults.mean > 0 ? 'positive' : simulationResults.mean < 0 ? 'negative' : 'neutral'}`}>
          <div className={`result-value ${simulationResults.mean > 0 ? 'text-positive' : simulationResults.mean < 0 ? 'text-negative' : 'text-neutral'}`}>
            {formatCurrency(isFinite(simulationResults.mean) ? simulationResults.mean : 0)}
          </div>
          <div className="result-label">Expected Net Return</div>
          <div className="result-confidence">
            Range: {formatCurrency(isFinite(simulationResults.percentiles?.p10) ? simulationResults.percentiles.p10 : 0)} - {formatCurrency(isFinite(simulationResults.percentiles?.p90) ? simulationResults.percentiles.p90 : 0)}
          </div>
        </div>

        <div className={`result-card ${simulationResults.successRate > 70 ? 'positive' : simulationResults.successRate < 30 ? 'negative' : 'neutral'}`}>
          <div className={`result-value ${simulationResults.successRate > 70 ? 'text-positive' : simulationResults.successRate < 30 ? 'text-negative' : 'text-neutral'}`}>
            {isFinite(simulationResults.successRate) ? formatPercentage(simulationResults.successRate / 100) : '0%'}
          </div>
          <div className="result-label">Success Rate</div>
          <div className="result-confidence">Probability of positive return</div>
        </div>

        {/* Investment Sufficiency Analysis */}
        {simulating ? (
          <div className="result-card investment-analysis neutral">
            <div className="loading-shimmer">
              <div className="shimmer-value"></div>
              <div className="shimmer-label">Investment Sufficiency</div>
              <div className="shimmer-confidence"></div>
            </div>
          </div>
        ) : simulationResults.rawResults?.[0]?.investmentSufficiency && (
          <div className={`result-card investment-analysis ${
            simulationResults.rawResults[0].investmentSufficiency.level === 'excellent' ? 'positive' :
            simulationResults.rawResults[0].investmentSufficiency.level === 'good' ? 'neutral' :
            simulationResults.rawResults[0].investmentSufficiency.level === 'caution' ? 'warning' : 'negative'
          }`}>
            <div className={`result-value ${
              simulationResults.rawResults[0].investmentSufficiency.level === 'excellent' ? 'text-positive' :
              simulationResults.rawResults[0].investmentSufficiency.level === 'good' ? 'text-neutral' :
              simulationResults.rawResults[0].investmentSufficiency.level === 'caution' ? 'text-warning' : 'text-negative'
            }`}>
              {(simulationResults.rawResults[0].investmentSufficiency.ratio * 100).toFixed(0)}%
            </div>
            <div className="result-label">Investment Sufficiency</div>
            <div className="result-confidence">
              {simulationResults.rawResults[0].investmentSufficiency.status === 'abundant' && 'Exceeds requirements'}
              {simulationResults.rawResults[0].investmentSufficiency.status === 'adequate' && 'Meets requirements'}
              {simulationResults.rawResults[0].investmentSufficiency.status === 'marginal' && `${formatCurrency(simulationResults.rawResults[0].investmentSufficiency.gap)} shortfall`}
              {simulationResults.rawResults[0].investmentSufficiency.status === 'insufficient' && `${formatCurrency(simulationResults.rawResults[0].investmentSufficiency.gap)} shortfall`}
            </div>
          </div>
        )}

        <div className={`result-card ${simulationResults.roi?.mean > 0 ? 'positive' : simulationResults.roi?.mean < 0 ? 'negative' : 'neutral'}`}>
          <div className={`result-value ${simulationResults.roi?.mean > 0 ? 'text-positive' : simulationResults.roi?.mean < 0 ? 'text-negative' : 'text-neutral'}`}>
            {isFinite(simulationResults.roi?.mean) ? simulationResults.roi.mean.toFixed(1) : '0'}%
          </div>
          <div className="result-label">ROI</div>
          <div className="result-confidence">
            Median: {isFinite(simulationResults.roi?.median) ? simulationResults.roi.median.toFixed(1) : '0'}%
          </div>
        </div>

        <div className="result-card neutral">
          <div className="result-value">{formatCurrency(isFinite(totalInvestment) ? totalInvestment : 0)}</div>
          <div className="result-label">Total Investment</div>
          <div className="result-confidence">Annual budget allocation</div>
        </div>
      </div>

    </section>
  );
};

export default SimulationResults;