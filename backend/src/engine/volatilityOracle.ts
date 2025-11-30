import { prisma } from '../db/prisma';
import { logger } from '../utils/logger';
import {
  calculateVolatility,
  calculateSharpeRatio,
  calculateMaxDrawdown,
} from '../utils/math';

export interface VolatilityMetrics {
  protocol: string;
  asset: string;
  volatility24h: number;
  volatility7d: number;
  volatility30d: number;
  sharpeRatio: number;
  maxDrawdown: number;
  timestamp: Date;
}

export class VolatilityOracle {
  /**
   * Calculate volatility metrics for a protocol/asset
   */
  async calculateMetrics(protocol: string, asset: string): Promise<VolatilityMetrics> {
    try {
      logger.info(`Calculating volatility metrics for ${protocol}/${asset}`);
      
      const now = new Date();
      const day24Ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const day7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const day30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // Fetch historical yield data
      const records24h = await prisma.yieldRecord.findMany({
        where: {
          protocol,
          asset,
          timestamp: { gte: day24Ago },
        },
        orderBy: { timestamp: 'asc' },
      });
      
      const records7d = await prisma.yieldRecord.findMany({
        where: {
          protocol,
          asset,
          timestamp: { gte: day7Ago },
        },
        orderBy: { timestamp: 'asc' },
      });
      
      const records30d = await prisma.yieldRecord.findMany({
        where: {
          protocol,
          asset,
          timestamp: { gte: day30Ago },
        },
        orderBy: { timestamp: 'asc' },
      });
      
      // Calculate returns for each period
      const returns24h = this.calculateReturns(records24h.map(r => r.apy));
      const returns7d = this.calculateReturns(records7d.map(r => r.apy));
      const returns30d = this.calculateReturns(records30d.map(r => r.apy));
      
      // Calculate volatility (standard deviation of returns)
      const volatility24h = calculateVolatility(returns24h);
      const volatility7d = calculateVolatility(returns7d);
      const volatility30d = calculateVolatility(returns30d);
      
      // Calculate Sharpe ratio (risk-adjusted return)
      const sharpeRatio = calculateSharpeRatio(returns30d);
      
      // Calculate max drawdown
      const apyValues = records30d.map(r => r.apy);
      const maxDrawdown = calculateMaxDrawdown(apyValues);
      
      const metrics: VolatilityMetrics = {
        protocol,
        asset,
        volatility24h,
        volatility7d,
        volatility30d,
        sharpeRatio,
        maxDrawdown,
        timestamp: now,
      };
      
      // Store in database
      await this.storeMetrics(metrics);
      
      logger.info(`Volatility metrics calculated for ${protocol}/${asset}`, {
        volatility30d,
        sharpeRatio,
      });
      
      return metrics;
    } catch (error) {
      logger.error(`Error calculating volatility metrics for ${protocol}/${asset}:`, error);
      throw error;
    }
  }
  
  /**
   * Calculate returns from APY values
   */
  private calculateReturns(apyValues: number[]): number[] {
    const returns: number[] = [];
    
    for (let i = 1; i < apyValues.length; i++) {
      const prevAPY = apyValues[i - 1];
      const currentAPY = apyValues[i];
      
      if (prevAPY > 0) {
        const returnValue = (currentAPY - prevAPY) / prevAPY;
        returns.push(returnValue);
      }
    }
    
    return returns;
  }
  
  /**
   * Store volatility metrics in database
   */
  private async storeMetrics(metrics: VolatilityMetrics): Promise<void> {
    try {
      await prisma.volatilitySnapshot.create({
        data: {
          protocol: metrics.protocol,
          asset: metrics.asset,
          volatility: metrics.volatility30d,
          sharpeRatio: metrics.sharpeRatio,
          maxDrawdown: metrics.maxDrawdown,
          timeWindow: '30d',
          timestamp: metrics.timestamp,
        },
      });
      
      await prisma.volatilitySnapshot.create({
        data: {
          protocol: metrics.protocol,
          asset: metrics.asset,
          volatility: metrics.volatility7d,
          sharpeRatio: null,
          maxDrawdown: null,
          timeWindow: '7d',
          timestamp: metrics.timestamp,
        },
      });
      
      await prisma.volatilitySnapshot.create({
        data: {
          protocol: metrics.protocol,
          asset: metrics.asset,
          volatility: metrics.volatility24h,
          sharpeRatio: null,
          maxDrawdown: null,
          timeWindow: '24h',
          timestamp: metrics.timestamp,
        },
      });
    } catch (error) {
      logger.error('Error storing volatility metrics:', error);
    }
  }
  
  /**
   * Get latest volatility metrics
   */
  async getLatestMetrics(protocol: string, asset: string): Promise<VolatilityMetrics | null> {
    try {
      const snapshot = await prisma.volatilitySnapshot.findFirst({
        where: {
          protocol,
          asset,
          timeWindow: '30d',
        },
        orderBy: { timestamp: 'desc' },
      });
      
      if (!snapshot) return null;
      
      const snapshot7d = await prisma.volatilitySnapshot.findFirst({
        where: {
          protocol,
          asset,
          timeWindow: '7d',
        },
        orderBy: { timestamp: 'desc' },
      });
      
      const snapshot24h = await prisma.volatilitySnapshot.findFirst({
        where: {
          protocol,
          asset,
          timeWindow: '24h',
        },
        orderBy: { timestamp: 'desc' },
      });
      
      return {
        protocol,
        asset,
        volatility24h: snapshot24h?.volatility || 0,
        volatility7d: snapshot7d?.volatility || 0,
        volatility30d: snapshot.volatility,
        sharpeRatio: snapshot.sharpeRatio || 0,
        maxDrawdown: snapshot.maxDrawdown || 0,
        timestamp: snapshot.timestamp,
      };
    } catch (error) {
      logger.error('Error fetching latest volatility metrics:', error);
      return null;
    }
  }
  
  /**
   * Detect volatility spike events
   */
  async detectVolatilitySpike(
    protocol: string,
    asset: string,
    threshold: number = 2.0
  ): Promise<boolean> {
    try {
      const metrics = await this.getLatestMetrics(protocol, asset);
      if (!metrics) return false;
      
      // Compare 24h volatility to 30d average
      const isSpike = metrics.volatility24h > metrics.volatility30d * threshold;
      
      if (isSpike) {
        logger.warn(`Volatility spike detected for ${protocol}/${asset}`, {
          volatility24h: metrics.volatility24h,
          volatility30d: metrics.volatility30d,
        });
        
        // Log risk event
        await prisma.riskEvent.create({
          data: {
            protocol,
            eventType: 'high_volatility',
            severity: metrics.volatility24h > metrics.volatility30d * 3 ? 'high' : 'medium',
            description: `Volatility spike detected: 24h volatility (${metrics.volatility24h.toFixed(4)}) is ${(metrics.volatility24h / metrics.volatility30d).toFixed(2)}x the 30d average`,
            metrics: {
              volatility24h: metrics.volatility24h,
              volatility30d: metrics.volatility30d,
              ratio: metrics.volatility24h / metrics.volatility30d,
            },
          },
        });
      }
      
      return isSpike;
    } catch (error) {
      logger.error('Error detecting volatility spike:', error);
      return false;
    }
  }
  
  /**
   * Calculate all metrics for all protocols
   */
  async calculateAllMetrics(): Promise<VolatilityMetrics[]> {
    try {
      // Get unique protocol/asset combinations
      const combinations = await prisma.yieldRecord.findMany({
        distinct: ['protocol', 'asset'],
        select: {
          protocol: true,
          asset: true,
        },
      });
      
      const results: VolatilityMetrics[] = [];
      
      for (const { protocol, asset } of combinations) {
        try {
          const metrics = await this.calculateMetrics(protocol, asset);
          results.push(metrics);
        } catch (error) {
          logger.error(`Failed to calculate metrics for ${protocol}/${asset}:`, error);
        }
      }
      
      return results;
    } catch (error) {
      logger.error('Error calculating all volatility metrics:', error);
      return [];
    }
  }
}

export default new VolatilityOracle();
