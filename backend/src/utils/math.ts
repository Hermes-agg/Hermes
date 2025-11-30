import Decimal from 'decimal.js';

// Configure Decimal for high precision calculations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Calculate compound interest APY from APR
 */
export function aprToApy(apr: number, compoundingFrequency: number = 365): number {
  return Math.pow(1 + apr / compoundingFrequency, compoundingFrequency) - 1;
}

/**
 * Calculate standard deviation (volatility)
 */
export function calculateVolatility(values: number[]): number {
  if (values.length < 2) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  
  return Math.sqrt(variance);
}

/**
 * Calculate Sharpe ratio (risk-adjusted return)
 * @param returns Array of returns
 * @param riskFreeRate Risk-free rate (default 0.04 for 4%)
 */
export function calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.04): number {
  if (returns.length < 2) return 0;
  
  const meanReturn = returns.reduce((sum, val) => sum + val, 0) / returns.length;
  const volatility = calculateVolatility(returns);
  
  if (volatility === 0) return 0;
  
  return (meanReturn - riskFreeRate) / volatility;
}

/**
 * Calculate maximum drawdown
 */
export function calculateMaxDrawdown(values: number[]): number {
  if (values.length < 2) return 0;
  
  let maxDrawdown = 0;
  let peak = values[0];
  
  for (const value of values) {
    if (value > peak) {
      peak = value;
    }
    
    const drawdown = (peak - value) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown;
}

/**
 * Calculate impermanent loss for LP positions
 * @param priceRatio Current price ratio vs initial
 */
export function calculateImpermanentLoss(priceRatio: number): number {
  const k = Math.sqrt(priceRatio);
  return 2 * k / (1 + priceRatio) - 1;
}

/**
 * Normalize value to 0-100 scale
 */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

/**
 * Calculate weighted average
 */
export function weightedAverage(values: number[], weights: number[]): number {
  if (values.length !== weights.length) {
    throw new Error('Values and weights arrays must have the same length');
  }
  
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) return 0;
  
  const weightedSum = values.reduce((sum, val, i) => sum + val * weights[i], 0);
  return weightedSum / totalWeight;
}

/**
 * Safe division that handles zero denominators
 */
export function safeDivide(numerator: number, denominator: number, defaultValue: number = 0): number {
  if (denominator === 0) return defaultValue;
  return numerator / denominator;
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: number): number {
  return lamports / 1e9;
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
  return Math.floor(sol * 1e9);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Calculate exponential moving average
 */
export function calculateEMA(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  
  const k = 2 / (period + 1);
  const ema: number[] = [values[0]];
  
  for (let i = 1; i < values.length; i++) {
    ema.push(values[i] * k + ema[i - 1] * (1 - k));
  }
  
  return ema;
}

/**
 * Calculate risk-adjusted score
 */
export function calculateRiskAdjustedScore(
  apy: number,
  tvl: number,
  volatility: number,
  ilRisk: number,
  protocolRisk: number,
  weights: {
    apy: number;
    tvl: number;
    volatility: number;
    il: number;
    protocol: number;
  }
): number {
  // Normalize inputs
  const normalizedAPY = Math.min(apy * 10, 100); // Scale APY (0-10% -> 0-100)
  const normalizedTVL = normalize(Math.log10(tvl + 1), 0, 10); // Log scale for TVL
  const normalizedVolatility = 100 - Math.min(volatility * 100, 100); // Inverse (lower is better)
  const normalizedIL = 100 - Math.min(ilRisk * 100, 100); // Inverse
  const normalizedProtocol = 100 - protocolRisk; // Already 0-100
  
  // Calculate weighted score
  const score =
    normalizedAPY * weights.apy +
    normalizedTVL * weights.tvl +
    normalizedVolatility * weights.volatility +
    normalizedIL * weights.il +
    normalizedProtocol * weights.protocol;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate percentage difference
 */
export function percentageDifference(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue === 0 ? 0 : 1;
  return (newValue - oldValue) / oldValue;
}

/**
 * Check if value is within threshold
 */
export function isWithinThreshold(value: number, target: number, threshold: number): boolean {
  return Math.abs(value - target) <= threshold;
}
